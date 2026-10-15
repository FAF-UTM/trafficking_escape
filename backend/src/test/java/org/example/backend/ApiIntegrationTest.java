package org.example.backend;

import org.example.backend.ai.OpenAiResponsesClient;
import org.example.backend.exceptions.AiServiceException;
import org.example.backend.model.Message;
import org.example.backend.model.Role;
import org.example.backend.model.User;
import org.example.backend.repos.MessageRepository;
import org.example.backend.repos.UserRepository;
import org.example.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.MvcResult;
import jakarta.servlet.http.Cookie;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "app.security.jwt.secret=test-secret-test-secret-test-secret-0123456789",
        "app.openai.api-key=test-key",
        "app.cors.allowed-origins=http://localhost:5173"
})
@AutoConfigureMockMvc
@Import(TestcontainersConfig.class)
class ApiIntegrationTest {

    private static final AtomicInteger IP_COUNTER = new AtomicInteger(1);

    @Autowired MockMvc mvc;
    @Autowired JsonMapper json;
    @Autowired UserRepository userRepository;
    @Autowired MessageRepository messageRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;

    @MockitoBean OpenAiResponsesClient openAi;

    // ---------- helpers ----------

    private User createUser(Role role, String password) {
        String name = "u_" + UUID.randomUUID().toString().substring(0, 8);
        User user = new User();
        user.setUsername(name);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(name + "@example.test");
        user.setRole(role);
        return userRepository.save(user);
    }

    private static final String SESSION_COOKIE = "te_session";

    // A real CSRF token per test, obtained the way the SPA does it. Spring's csrf() test helper is
    // deliberately not used: it swaps the token repository for the whole context and hides failures.
    private Cookie csrfCookie;
    private String csrfToken;

    @BeforeEach
    void fetchCsrfToken() throws Exception {
        MvcResult result = mvc.perform(get("/api/v1/auth/csrf")).andReturn();
        csrfCookie = result.getResponse().getCookie("te_csrf");
        csrfToken = json.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    private static void addCookie(org.springframework.mock.web.MockHttpServletRequest request, Cookie cookie) {
        Cookie[] existing = request.getCookies() == null ? new Cookie[0] : request.getCookies();
        Cookie[] all = java.util.Arrays.copyOf(existing, existing.length + 1);
        all[existing.length] = cookie;
        request.setCookies(all);
    }

    /** CSRF cookie + X-XSRF-TOKEN header, as the browser sends them. */
    private RequestPostProcessor csrf() {
        return request -> {
            addCookie(request, csrfCookie);
            request.addHeader("X-XSRF-TOKEN", csrfToken);
            return request;
        };
    }

    /** Signs the request in the way a browser would: session cookie plus a valid CSRF token. */
    private RequestPostProcessor as(User user) {
        String token = jwtService.issue(user).token();
        return request -> {
            addCookie(request, new Cookie(SESSION_COOKIE, token));
            return csrf().postProcessRequest(request);
        };
    }

    /** Each test gets its own client IP so per-IP rate limits do not leak between tests. */
    private static RequestPostProcessor freshIp() {
        String ip = "10.1." + (IP_COUNTER.get() / 250) + "." + (IP_COUNTER.getAndIncrement() % 250 + 1);
        return request -> {
            request.setRemoteAddr(ip);
            return request;
        };
    }

    private static MockHttpServletRequestBuilder postJson(String url, String body) {
        return post(url).contentType(MediaType.APPLICATION_JSON).content(body);
    }

    private JsonNode body(org.springframework.test.web.servlet.ResultActions result) throws Exception {
        return json.readTree(result.andReturn().getResponse().getContentAsString());
    }

    private long createChat(User owner, boolean trafficker) throws Exception {
        String req = """
                {"chatName":"Alex","chatImageUrl":"/assets/chat/a.png","isTrafficker":%s}""".formatted(trafficker);
        return body(mvc.perform(postJson("/api/chats", req).with(as(owner)))
                .andExpect(status().isOk())).get("id").asLong();
    }

    // ---------- authentication ----------

    @Test
    void loginSetsAHardenedSessionCookieAndNeverReturnsTheToken() throws Exception {
        User user = createUser(Role.ROLE_USER, "correct horse battery");

        MvcResult result = mvc.perform(postJson("/api/v1/users/token",
                        "{\"username\":\"%s\",\"password\":\"correct horse battery\"}".formatted(user.getUsername()))
                        .with(freshIp()).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.userId").value(user.getId()))
                .andExpect(jsonPath("$.role").value("ROLE_USER"))
                .andExpect(jsonPath("$.token").doesNotExist())
                .andReturn();

        String setCookie = result.getResponse().getHeader(HttpHeaders.SET_COOKIE);
        assertThat(setCookie).startsWith(SESSION_COOKIE + "=")
                .contains("HttpOnly", "Secure", "SameSite=Strict", "Path=/", "Max-Age=");
        assertThat(result.getResponse().getContentAsString()).doesNotContain(setCookie.split("[=;]")[1]);
    }
    @Test
    void loginRejectsWrongPasswordAndUnknownUser() throws Exception {
        User user = createUser(Role.ROLE_USER, "correct horse battery");
        mvc.perform(postJson("/api/v1/users/token",
                        "{\"username\":\"%s\",\"password\":\"nope\"}".formatted(user.getUsername())).with(freshIp()).with(csrf()))
                .andExpect(status().isUnauthorized());
        mvc.perform(postJson("/api/v1/users/token", "{\"username\":\"ghost\",\"password\":\"nope\"}").with(freshIp()).with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void legacyUnprefixedBcryptHashesStillWork() throws Exception {
        User user = createUser(Role.ROLE_USER, "x");
        user.setPassword(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("old password 1"));
        userRepository.save(user);

        mvc.perform(postJson("/api/v1/users/token",
                        "{\"username\":\"%s\",\"password\":\"old password 1\"}".formatted(user.getUsername())).with(freshIp()).with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    void loginIsRateLimited() throws Exception {
        RequestPostProcessor ip = freshIp();
        for (int i = 0; i < 10; i++) {
            mvc.perform(postJson("/api/v1/users/token", "{\"username\":\"ghost%d\",\"password\":\"x\"}".formatted(i)).with(ip).with(csrf()))
                    .andExpect(status().isUnauthorized());
        }
        mvc.perform(postJson("/api/v1/users/token", "{\"username\":\"ghost\",\"password\":\"x\"}").with(ip).with(csrf()))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists(HttpHeaders.RETRY_AFTER));
    }

    @Test
    void requestsWithoutOrWithForgedTokensAreRejected() throws Exception {
        mvc.perform(get("/api/chats/user/1")).andExpect(status().isUnauthorized());

        // Admin claims signed with a key the server does not know; the cookie is cleared in the response.
        String forged = ForgedToken.signedWithUnknownKey();
        mvc.perform(get("/api/chats/user/1").cookie(new Cookie(SESSION_COOKIE, forged)))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("Max-Age=0")));
    }

    @Test
    void authorizationHeadersAreIgnored() throws Exception {
        User user = createUser(Role.ROLE_USER, "pw");
        String token = jwtService.issue(user).token();
        mvc.perform(get("/api/chats/user/" + user.getId()).header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void stateChangingRequestsWithoutCsrfTokenAreRejected() throws Exception {
        User user = createUser(Role.ROLE_USER, "pw");
        Cookie session = new Cookie(SESSION_COOKIE, jwtService.issue(user).token());
        mvc.perform(postJson("/api/chats", "{\"chatName\":\"x\",\"isTrafficker\":false}").cookie(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("csrf"));
        mvc.perform(postJson("/api/v1/users/token", "{\"username\":\"a\",\"password\":\"b\"}").with(freshIp()))
                .andExpect(status().isForbidden());
    }

    @Test
    void realCsrfRoundTripLetsTheBrowserSignInAndOut() throws Exception {
        User user = createUser(Role.ROLE_USER, "correct horse battery");

        // 1. The SPA asks for a CSRF token; the secret goes into an HttpOnly cookie.
        MvcResult csrfResult = mvc.perform(get("/api/v1/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headerName").value("X-XSRF-TOKEN"))
                .andReturn();
        Cookie csrfCookie = csrfResult.getResponse().getCookie("te_csrf");
        assertThat(csrfCookie).isNotNull();
        assertThat(csrfCookie.isHttpOnly()).isTrue();
        String csrfToken = json.readTree(csrfResult.getResponse().getContentAsString()).get("token").asText();

        // 2. Sign in with header + cookie; a stale session cookie must not get in the way.
        MvcResult login = mvc.perform(postJson("/api/v1/users/token",
                        "{\"username\":\"%s\",\"password\":\"correct horse battery\"}".formatted(user.getUsername()))
                        .with(freshIp())
                        .cookie(csrfCookie, new Cookie(SESSION_COOKIE, "stale.garbage.token"))
                        .header("X-XSRF-TOKEN", csrfToken))
                .andExpect(status().isOk())
                .andReturn();
        Cookie session = login.getResponse().getCookie(SESSION_COOKIE);

        // 3. The session endpoint reports who is signed in.
        mvc.perform(get("/api/v1/auth/session").cookie(session))
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.username").value(user.getUsername()));

        // 4. Sign out clears the cookie.
        mvc.perform(post("/api/v1/auth/logout").cookie(csrfCookie, session).header("X-XSRF-TOKEN", csrfToken))
                .andExpect(status().isNoContent())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("Max-Age=0")));
    }

    @Test
    void sessionEndpointClearsInvalidCookies() throws Exception {
        mvc.perform(get("/api/v1/auth/session")).andExpect(jsonPath("$.authenticated").value(false));
        mvc.perform(get("/api/v1/auth/session").cookie(new Cookie(SESSION_COOKIE, "not-a-jwt")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(false))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("Max-Age=0")));
    }
    /** HS256 token with admin claims signed with a key the server does not know. */
    private static final class ForgedToken {
        static String signedWithUnknownKey() throws Exception {
            String header = b64("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
            String payload = b64("{\"id\":1,\"username\":\"admin\",\"role\":\"ROLE_ADMIN\",\"iss\":\"trafficking-escape\",\"exp\":%d}"
                    .formatted(Instant.now().plusSeconds(3600).getEpochSecond()));
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec("your_secret_key-padding-padding-padding".getBytes(), "HmacSHA256"));
            String sig = Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal((header + "." + payload).getBytes()));
            return header + "." + payload + "." + sig;
        }

        private static String b64(String s) {
            return Base64.getUrlEncoder().withoutPadding().encodeToString(s.getBytes());
        }
    }

    // ---------- registration / admin ----------

    @Test
    void registrationIsAdminOnlyAndNeverReturnsThePassword() throws Exception {
        String req = """
                {"username":"newuser_%s","password":"long enough password","email":"n%s@example.test","role":"ROLE_ADMIN"}"""
                .formatted(System.nanoTime(), System.nanoTime());

        mvc.perform(postJson("/api/v1/users/register", req).with(csrf())).andExpect(status().isUnauthorized());
        mvc.perform(postJson("/api/v1/users/register", req)
                        .with(as(createUser(Role.ROLE_USER, "pw"))))
                .andExpect(status().isForbidden());
        mvc.perform(postJson("/api/v1/users/register", req)
                        .with(as(createUser(Role.ROLE_ADMIN, "pw"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"));
    }

    @Test
    void registrationValidatesInput() throws Exception {
        mvc.perform(postJson("/api/v1/users/register", "{\"username\":\"a\",\"password\":\"short\",\"email\":\"bad\"}")
                        .with(as(createUser(Role.ROLE_ADMIN, "pw"))))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON));
    }

    // ---------- access codes ----------

    @Test
    void accessCodeOneTimeLoginWorksOnceAndBlocksPasswordLogin() throws Exception {
        User admin = createUser(Role.ROLE_ADMIN, "pw");
        JsonNode created = body(mvc.perform(post("/api/v1/users/random?validityMinutes=30")
                        .with(as(admin)))
                .andExpect(status().isOk()));
        String code = created.get("accessCode").asText();
        String username = created.get("username").asText();
        assertThat(username).doesNotContain(code);

        // Lower-case input is accepted; the session comes back as a cookie, never in the body.
        mvc.perform(postJson("/api/v1/users/access-code", "{\"code\":\"%s\",\"oneTime\":true}".formatted(code.toLowerCase()))
                        .with(freshIp()).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.token").doesNotExist())
                .andExpect(cookie().httpOnly(SESSION_COOKIE, true));
        mvc.perform(postJson("/api/v1/users/access-code", "{\"code\":\"%s\",\"oneTime\":true}".formatted(code))
                        .with(freshIp()).with(csrf()))
                .andExpect(status().isUnauthorized());

        // Previously the code doubled as the password, so one-time codes could be reused here.
        mvc.perform(postJson("/api/v1/users/token", "{\"username\":\"%s\",\"password\":\"%s\"}".formatted(username, code)).with(freshIp()).with(csrf()))
                .andExpect(status().isUnauthorized());

        mvc.perform(get("/api/v1/users/created").with(as(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value(username));
    }

    // ---------- chats & messages ----------

    @Test
    void chatIdsInRequestBodiesCannotOverwriteOtherUsersChats() throws Exception {
        User alice = createUser(Role.ROLE_USER, "pw");
        User mallory = createUser(Role.ROLE_USER, "pw");
        long aliceChat = createChat(alice, false);

        long malloryChat = body(mvc.perform(postJson("/api/chats",
                        "{\"id\":%d,\"chatName\":\"hijack\",\"isTrafficker\":true}".formatted(aliceChat))
                        .with(as(mallory)))
                .andExpect(status().isOk())).get("id").asLong();
        assertThat(malloryChat).isNotEqualTo(aliceChat);

        mvc.perform(get("/api/chats/" + aliceChat).with(as(alice)))
                .andExpect(jsonPath("$.chatName").value("Alex"));
        mvc.perform(get("/api/chats/" + aliceChat).with(as(mallory)))
                .andExpect(status().isNotFound());
        mvc.perform(postJson("/api/messages", "{\"chatId\":%d,\"isOutgoing\":true,\"messageText\":\"hi\"}".formatted(aliceChat))
                        .with(as(mallory)))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/chats/user/" + alice.getId()).with(as(mallory)))
                .andExpect(status().isForbidden());
    }

    @Test
    void chatsAreListedWithTheirMessagesInOrder() throws Exception {
        User user = createUser(Role.ROLE_USER, "pw");
        long chatId = createChat(user, true);
        for (String text : new String[]{"one", "two", "three"}) {
            mvc.perform(postJson("/api/messages", "{\"chatId\":%d,\"isOutgoing\":false,\"messageText\":\"%s\"}".formatted(chatId, text))
                            .with(as(user)))
                    .andExpect(status().isOk());
        }

        mvc.perform(get("/api/chats/user/" + user.getId()).with(as(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].isTrafficker").value(true))
                .andExpect(jsonPath("$[0].messages[0].messageText").value("one"))
                .andExpect(jsonPath("$[0].messages[2].messageText").value("three"));

        mvc.perform(delete("/api/chats/" + chatId).with(as(user)))
                .andExpect(status().isNoContent());
        assertThat(messageRepository.findByChatIdOrderBySentAtAscIdAsc(chatId)).isEmpty();
    }

    @Test
    void digestWorksForMessagesWithoutDangerLevel() throws Exception {
        User user = createUser(Role.ROLE_USER, "pw");
        long chatId = createChat(user, false);
        Message m = new Message();
        m.setChatId(chatId);
        m.setIsOutgoing(true);
        m.setMessageText("hello");
        messageRepository.save(m);

        mvc.perform(get("/api/v1/users/%d/digest".formatted(user.getId())).with(as(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(100))
                .andExpect(jsonPath("$.totalMessages").value(1));
        mvc.perform(get("/api/v1/users/%d/digest".formatted(user.getId()))
                        .with(as(createUser(Role.ROLE_USER, "pw"))))
                .andExpect(status().isForbidden());
    }

    // ---------- message generation ----------

    private static final String MODEL_OUTPUT = """
            {"npcReply":"Hey! You seem really mature for your age 😉✨",
             "playerOptions":[
               {"text":"thanks i guess 😊","riskLevel":1},
               {"text":"who are you? i'll ask my mom first 🤔","riskLevel":-6},
               {"text":"omg thanks!! want my number? 😍","riskLevel":8}]}""";

    @Test
    void generationReturnsTheFieldsTheFrontendReads() throws Exception {
        when(openAi.createStructuredResponse(anyString(), anyString(), anyString(), any())).thenReturn(MODEL_OUTPUT);
        User user = createUser(Role.ROLE_USER, "pw");

        mvc.perform(postJson("/api/v1/message-generation/generate", """
                        {"context":"A child is chatting with someone online.","lastMessage":"Hello",
                         "currentDangerLevel":2,"isTrafficker":true,"language":"nl"}""")
                        .with(as(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.chatResponse").value("Hey! You seem really mature for your age 😉✨"))
                .andExpect(jsonPath("$.option1").isString())
                .andExpect(jsonPath("$.dangerLevel3").isNumber())
                .andExpect(jsonPath("$.updatedDangerLevel").value(10))
                .andExpect(jsonPath("$.isTrafficker").value(true))
                .andExpect(jsonPath("$.language").value("nl"));

        ArgumentCaptor<String> input = ArgumentCaptor.forClass(String.class);
        verify(openAi).createStructuredResponse(anyString(), input.capture(), eq("chat_turn"), any());
        assertThat(input.getValue()).contains("npc_role: trafficker", "language: Dutch", "Hello");
    }

    @Test
    void generationUsesStoredHistoryAndChatRoleWhenChatIdIsGiven() throws Exception {
        when(openAi.createStructuredResponse(anyString(), anyString(), anyString(), any())).thenReturn(MODEL_OUTPUT);
        User user = createUser(Role.ROLE_USER, "pw");
        long chatId = createChat(user, false);
        mvc.perform(postJson("/api/messages", "{\"chatId\":%d,\"isOutgoing\":true,\"messageText\":\"i like <b>horses</b>\"}".formatted(chatId))
                .with(as(user)));

        mvc.perform(postJson("/api/v1/message-generation/generate", """
                        {"lastMessage":"and you?","currentDangerLevel":0,"isTrafficker":true,"chatId":%d}""".formatted(chatId))
                        .with(as(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isTrafficker").value(false));

        ArgumentCaptor<String> input = ArgumentCaptor.forClass(String.class);
        verify(openAi).createStructuredResponse(anyString(), input.capture(), anyString(), any());
        assertThat(input.getValue()).contains("npc_role: peer", "PLAYER: i like ‹b›horses‹/b›");
    }

    @Test
    void generationRetriesOnceThenReportsServiceUnavailable() throws Exception {
        when(openAi.createStructuredResponse(anyString(), anyString(), anyString(), any()))
                .thenReturn("{\"npcReply\":\"hi\",\"playerOptions\":[]}")
                .thenThrow(new AiServiceException("HTTP 500", true));
        User user = createUser(Role.ROLE_USER, "pw");

        mvc.perform(postJson("/api/v1/message-generation/generate",
                        "{\"lastMessage\":\"Hello\",\"currentDangerLevel\":0,\"isTrafficker\":false}")
                        .with(as(user)))
                .andExpect(status().isServiceUnavailable());
        verify(openAi, times(2)).createStructuredResponse(anyString(), anyString(), anyString(), any());
    }

    @Test
    void generationValidatesInput() throws Exception {
        mvc.perform(postJson("/api/v1/message-generation/generate", "{\"lastMessage\":\"\",\"isTrafficker\":\"yes\"}")
                        .with(as(createUser(Role.ROLE_USER, "pw"))))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(openAi);
    }

    // ---------- public endpoints / infrastructure ----------

    @Test
    void gameplayIsPublicButValidated() throws Exception {
        mvc.perform(postJson("/api/v1/gameplay", "{\"gameName\":\"word_scramble\",\"totalSeconds\":42}").with(freshIp()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalSeconds").value(42));
        mvc.perform(postJson("/api/v1/gameplay", "{\"gameName\":\"<script>\",\"totalSeconds\":-1}").with(freshIp()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void healthEndpointIsPublic() throws Exception {
        mvc.perform(get("/actuator/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void corsAllowsOnlyConfiguredOrigins() throws Exception {
        mvc.perform(options("/api/chats")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"));
        mvc.perform(options("/api/chats")
                        .header(HttpHeaders.ORIGIN, "https://evil.example")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
                .andExpect(status().isForbidden());
    }
}
