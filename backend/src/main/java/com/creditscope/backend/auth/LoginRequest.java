package com.creditscope.backend.auth;

import jakarta.validation.constraints.NotBlank;

// @spec AUTH-BE-001, AUTH-BE-003
public record LoginRequest(
        @NotBlank String username,
        @NotBlank String password
) {
}
