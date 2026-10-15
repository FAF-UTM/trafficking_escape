package org.example.backend.ai;

import org.example.backend.exceptions.AiServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class OpenAiResponsesClientTest {

    private MockRestServiceServer server;
    private OpenAiResponsesClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder()
                .baseUrl("https://api.openai.test/v1")
                .defaultHeader("Authorization", "Bearer sk-test");
        server = MockRestServiceServer.bindTo(builder).build();
        OpenAiProperties properties = new OpenAiProperties("sk-test", "https://api.openai.test/v1", "gpt-6-luna",
                "low", 2000, Duration.ofSeconds(5));
        client = new OpenAiResponsesClient(builder.build(), properties);
    }

    @Test
    void sendsStructuredOutputRequestAndReturnsOutputText() {
        server.expect(requestTo("https://api.openai.test/v1/responses"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "Bearer sk-test"))
                .andExpect(jsonPath("$.model").value("gpt-6-luna"))
                .andExpect(jsonPath("$.reasoning.effort").value("low"))
                .andExpect(jsonPath("$.store").value(false))
                .andExpect(jsonPath("$.text.format.type").value("json_schema"))
                .andExpect(jsonPath("$.text.format.strict").value(true))
                .andExpect(jsonPath("$.instructions").value("be nice"))
                .andRespond(withSuccess("""
                        {"id":"resp_1","status":"completed","output":[
                          {"type":"reasoning","summary":[]},
                          {"type":"message","role":"assistant","content":[{"type":"output_text","text":"{\\"a\\":1}","annotations":[]}]}
                        ],"usage":{"input_tokens":10}}""", MediaType.APPLICATION_JSON));

        String text = client.createStructuredResponse("be nice", "input", "chat_turn", Map.of("type", "object"));

        assertThat(text).isEqualTo("{\"a\":1}");
        server.verify();
    }

    @Test
    void incompleteResponsesAndRefusalsAreRetryableFailures() {
        server.expect(requestTo("https://api.openai.test/v1/responses"))
                .andRespond(withSuccess("""
                        {"status":"incomplete","incomplete_details":{"reason":"max_output_tokens"},"output":[]}""",
                        MediaType.APPLICATION_JSON));
        assertThatThrownBy(() -> client.createStructuredResponse("i", "x", "s", Map.of()))
                .isInstanceOf(AiServiceException.class)
                .hasMessageContaining("max_output_tokens")
                .matches(e -> ((AiServiceException) e).isRetryable());
    }

    @Test
    void clientErrorsAreNotRetryable() {
        server.expect(requestTo("https://api.openai.test/v1/responses"))
                .andRespond(withStatus(HttpStatus.BAD_REQUEST).body("{\"error\":{\"message\":\"bad param\"}}"));
        assertThatThrownBy(() -> client.createStructuredResponse("i", "x", "s", Map.of()))
                .isInstanceOf(AiServiceException.class)
                .matches(e -> !((AiServiceException) e).isRetryable());
    }

    @Test
    void languageNamesFallBackToEnglish() {
        assertThat(ChatTurnPrompt.languageName("nl")).isEqualTo("Dutch");
        assertThat(ChatTurnPrompt.languageName("en-US")).isEqualTo("English");
        assertThat(ChatTurnPrompt.languageName(null)).isEqualTo("English");
        assertThat(ChatTurnPrompt.languageName("zz")).isNotBlank();
    }
}
