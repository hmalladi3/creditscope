package com.creditscope.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

// @spec AUTH-BE-008, AUTH-BE-009, AUTH-BE-010, AUTH-BE-011, AUTH-BE-017, AUTH-BE-020
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final List<String> allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                           @Value("${app.cors.allowed-origins}") List<String> allowedOrigins) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // The frontend (Vercel) and backend (Render) are different origins even in
    // production, not just in local dev (Vite on :5173 vs Spring on :8080) — the
    // browser's own preflight OPTIONS check blocks every request without this,
    // regardless of what the security rules below say about GET/POST/etc.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Origin matching is an exact string comparison (Spring does not trim), so a
        // stray leading/trailing space or newline pasted into a dashboard env-var
        // field — an easy mistake, and one that produces the exact same silent 403
        // as a genuine misconfiguration — would otherwise fail with no indication
        // of why. Trimming (and dropping anything that goes blank) is cheap
        // insurance against that specific, very plausible failure mode.
        List<String> trimmedOrigins = allowedOrigins.stream()
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(trimmedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationEntryPoint unauthorizedEntryPoint() {
        return (request, response, authException) -> response.sendError(401, "Unauthorized");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                // Anonymous auth deliberately left enabled (Spring Security's default):
                // a missing token becomes an AnonymousAuthenticationToken, which Spring
                // Security's ExceptionTranslationFilter specifically recognizes and routes
                // to the 401 entry point on a role-check failure. A genuinely-null
                // Authentication is NOT recognized as anonymous by the trust resolver, so
                // disabling this filter would perversely turn "no credentials" into 403
                // too, collapsing the AUTH-BE-012 (401) / AUTH-BE-013 (403) distinction.
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Without httpBasic()/formLogin() configured, Spring Security has no
                // meaningful default AuthenticationEntryPoint and falls back to one that
                // always sends 403 — collapsing the 401/403 distinction entirely. A stateless
                // JWT API must supply its own entry point for the "missing/invalid
                // credentials" case (AUTH-BE-012); AccessDeniedException (wrong role,
                // AUTH-BE-013) is handled separately and unaffected by this.
                .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedEntryPoint()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/companies/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/ratings/distribution").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/api/_debug/**").permitAll() // TEMPORARY, see CorsDebugController
                        .requestMatchers(HttpMethod.POST, "/api/companies/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/companies/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/companies/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
