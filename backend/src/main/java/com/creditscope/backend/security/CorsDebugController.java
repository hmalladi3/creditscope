package com.creditscope.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * TEMPORARY — diagnosing a live CORS_ALLOWED_ORIGINS mismatch on the deployed
 * Render service. Not a permanent part of the app; remove once resolved.
 * Origins are not sensitive (they're meant to be public — visible in any
 * successful CORS response header anyway), so this is safe to expose publicly
 * for the duration of this debugging session.
 */
@RestController
public class CorsDebugController {

    private final List<String> allowedOrigins;

    public CorsDebugController(@Value("${app.cors.allowed-origins}") List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    @GetMapping("/api/_debug/cors-origins")
    public List<String> corsOrigins() {
        return allowedOrigins;
    }
}
