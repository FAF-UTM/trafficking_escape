package org.example.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SCHEME_NAME = "sessionCookie";

    @Bean
    public OpenAPI openAPI(@Value("${app.security.cookie.session-name}") String cookieName) {
        return new OpenAPI()
                .info(new Info().title("Trafficking Escape API").version("1.0")
                        .description("Authenticated with an HttpOnly session cookie set by the sign-in endpoints. "
                                + "State-changing requests also need the X-XSRF-TOKEN header from GET /api/v1/auth/csrf."))
                .addSecurityItem(new SecurityRequirement().addList(SCHEME_NAME))
                .components(new Components().addSecuritySchemes(SCHEME_NAME, new SecurityScheme()
                        .type(SecurityScheme.Type.APIKEY)
                        .in(SecurityScheme.In.COOKIE)
                        .name(cookieName)));
    }
}
