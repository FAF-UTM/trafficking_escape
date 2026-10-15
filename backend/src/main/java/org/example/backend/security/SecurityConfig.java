package org.example.backend.security;

import jakarta.servlet.http.Cookie;
import org.example.backend.config.CorsProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationProvider;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfException;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

/**
 * Browser authentication: the JWT lives in an HttpOnly, Secure, SameSite cookie, so page scripts
 * (and any injected script) can never read it. Because browsers attach cookies automatically, every
 * state-changing request must also carry a CSRF token (double-submit: an HttpOnly cookie plus the
 * X-XSRF-TOKEN header, which the SPA obtains from GET /api/v1/auth/csrf).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    public static final String CSRF_HEADER = "X-XSRF-TOKEN";

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthCookieProperties cookies,
                                                   JwtDecoder jwtDecoder) throws Exception {
        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfTokenRepository(cookies))
                        // Masks the token per response (BREACH protection); unmasks the header on the way back.
                        .csrfTokenRequestHandler(new XorCsrfTokenRequestAttributeHandler())
                        // Anonymous play-time statistics sent with navigator.sendBeacon, which cannot set headers.
                        .ignoringRequestMatchers(
                                PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.POST, "/api/v1/gameplay")))
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/v1/users/token", "/api/v1/users/access-code").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/gameplay").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs", "/v3/api-docs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/").permitAll()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated())
                // Not oauth2ResourceServer(): that DSL exempts every request carrying a "bearer token"
                // from CSRF, which is right for Authorization headers but wrong for cookies.
                .addFilterBefore(cookieAuthenticationFilter(cookies, jwtDecoder), BasicAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(clearingEntryPoint(cookies))
                        .accessDeniedHandler(problemAccessDeniedHandler()))
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'none'; frame-ancestors 'none'"))
                        .referrerPolicy(referrer -> referrer.policy(
                                org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER)));
        return http.build();
    }

    /** Authenticates requests from the JWT in the session cookie (same validation as the resource server). */
    private static BearerTokenAuthenticationFilter cookieAuthenticationFilter(AuthCookieProperties cookies,
                                                                             JwtDecoder jwtDecoder) {
        JwtAuthenticationProvider provider = new JwtAuthenticationProvider(jwtDecoder);
        provider.setJwtAuthenticationConverter(new PlatformJwtAuthenticationConverter());
        BearerTokenAuthenticationFilter filter = new BearerTokenAuthenticationFilter(new ProviderManager(provider));
        filter.setBearerTokenResolver(new CookieBearerTokenResolver(cookies.sessionName()));
        filter.setAuthenticationEntryPoint(clearingEntryPoint(cookies));
        return filter;
    }

    /** CSRF secret in an HttpOnly cookie; the SPA gets the (masked) token from /api/v1/auth/csrf instead. */
    private static CookieCsrfTokenRepository csrfTokenRepository(AuthCookieProperties cookies) {
        CookieCsrfTokenRepository repository = new CookieCsrfTokenRepository();
        repository.setCookieName(cookies.csrfName());
        repository.setHeaderName(CSRF_HEADER);
        repository.setCookiePath("/");
        repository.setCookieCustomizer(cookie -> {
            cookie.httpOnly(true).secure(cookies.secure()).sameSite(cookies.sameSite());
            if (StringUtils.hasText(cookies.domain())) cookie.domain(cookies.domain());
        });
        return repository;
    }

    /** 401 for missing/invalid sessions; a rejected session cookie is cleared so the browser drops it. */
    private static AuthenticationEntryPoint clearingEntryPoint(AuthCookieProperties cookies) {
        BearerTokenAuthenticationEntryPoint delegate = new BearerTokenAuthenticationEntryPoint();
        return (request, response, exception) -> {
            Cookie[] sent = request.getCookies();
            if (sent != null && Arrays.stream(sent).anyMatch(c -> cookies.sessionName().equals(c.getName()))) {
                Cookie cleared = new Cookie(cookies.sessionName(), "");
                cleared.setPath("/");
                cleared.setMaxAge(0);
                cleared.setHttpOnly(true);
                cleared.setSecure(cookies.secure());
                cleared.setAttribute("SameSite", cookies.sameSite());
                if (StringUtils.hasText(cookies.domain())) cleared.setDomain(cookies.domain());
                response.addCookie(cleared);
            }
            delegate.commence(request, response, exception);
        };
    }

    /** 403 as a problem response; CSRF failures carry code "csrf" so the SPA can refresh its token and retry. */
    private static AccessDeniedHandler problemAccessDeniedHandler() {
        return (request, response, exception) -> {
            boolean csrf = exception instanceof CsrfException;
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
            response.getWriter().write(csrf
                    ? "{\"status\":403,\"title\":\"Forbidden\",\"detail\":\"Missing or invalid CSRF token\",\"code\":\"csrf\"}"
                    : "{\"status\":403,\"title\":\"Forbidden\",\"detail\":\"Access denied\"}");
        };
    }

    @Bean
    public JwtDecoder jwtDecoder(JwtProperties properties) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(JwtService.secretKey(properties))
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(properties.issuer()));
        return decoder;
    }

    /** Only needed when the frontend is served from a different origin than the API (same site required). */
    @Bean
    public CorsConfigurationSource corsConfigurationSource(CorsProperties properties) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(properties.allowedOrigins());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of(HttpHeaders.CONTENT_TYPE, CSRF_HEADER));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(Duration.ofHours(1));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        DelegatingPasswordEncoder encoder = (DelegatingPasswordEncoder) PasswordEncoderFactories.createDelegatingPasswordEncoder();
        // Hashes stored before this encoder was introduced are plain BCrypt without an "{id}" prefix.
        encoder.setDefaultPasswordEncoderForMatches(new BCryptPasswordEncoder());
        return encoder;
    }
}
