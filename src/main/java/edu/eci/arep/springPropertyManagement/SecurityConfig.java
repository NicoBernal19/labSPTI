package edu.eci.arep.springPropertyManagement;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Collections;
import java.util.Map;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .ignoringRequestMatchers("/api/properties/search") // Opcional: excluye endpoints GET
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/properties/**").permitAll() // Ajusta según tus necesidades
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives("default-src 'self'; script-src 'self'")
                        )
                        .frameOptions(frame -> frame
                                .deny()
                        )
                        .contentTypeOptions(contentType -> {
                            // Esto activa X-Content-Type-Options: nosniff
                        })
                );

        return http.build();
    }

    @GetMapping("/csrf")
    public @ResponseBody Map<String, String> getCsrfToken(HttpServletRequest request) {
        return Collections.singletonMap("token", request.getAttribute("_csrf").toString());
    }
}
