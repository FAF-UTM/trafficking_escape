package org.example.backend.security;

import org.example.backend.service.CustomUserDetailsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityConfig.class);

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        LOGGER.info("Configuring SecurityFilterChain");
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(
                                "/api/v1/users/token",
                                "/api/v1/users/register",
                                "/h2-console/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/v3/api-docs.yaml",
                                "/swagger-ui.html"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtFilter jwtFilter() {
        LOGGER.info("Creating JwtFilter bean");
        return new JwtFilter();
    }

    /**
     * Option 1: Provide a CorsFilter bean explicitly.
     * If you do this, you can remove or modify 'corsConfigurationSource()' accordingly.
     */
//    @Bean
//    public CorsFilter corsFilter() {
//        LOGGER.info("Creating CorsFilter bean");
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        CorsConfiguration config = new CorsConfiguration();
//        // Allow credentials if needed (e.g., for cookies).
//        config.setAllowCredentials(true);
//        // Allow any origin.
//        config.addAllowedOriginPattern("*");
//        // Or if you prefer just addAllowedOrigin("*"), but addAllowedOriginPattern("*") covers subdomains as well.
//        config.addAllowedHeader("*");
//        config.addAllowedMethod("*");
//        source.registerCorsConfiguration("/**", config);
//        return new CorsFilter(source);
//    }

    /**
     * Option 2: Provide a CORS configuration source bean, which Spring Security will use.
     * Either method works, but typically you pick just one approach.
     */
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        LOGGER.info("Creating UrlBasedCorsConfigurationSource bean");
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow credentials if you need session/cookie details in the requests
        configuration.setAllowCredentials(true);
        configuration.addAllowedHeader("*");
        configuration.addAllowedMethod("*");

        // ************ IMPORTANT CHANGE HERE ************
        // Switch to allow any origin by using "*"
        configuration.setAllowedOriginPatterns(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        LOGGER.info("Creating PasswordEncoder bean");
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            HttpSecurity http,
            PasswordEncoder passwordEncoder,
            CustomUserDetailsService userDetailsService
    ) throws Exception {
        LOGGER.info("Creating AuthenticationManager bean");
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder)
                .and()
                .build();
    }
}
