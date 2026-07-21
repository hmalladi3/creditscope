package com.creditscope.backend.auth;

import java.time.Instant;

// @spec AUTH-BE-001
public record LoginResponse(
        String token,
        String username,
        Role role,
        Instant expiresAt
) {
}
