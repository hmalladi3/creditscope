package com.creditscope.backend.common;

import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SecurityIntegrationTest extends AbstractIntegrationTest {

    // @spec AUTH-BE-009, AUTH-BE-019, DEPLOY-016
    @Test
    void actuatorHealthIsPublic() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    // @spec API-BE-017, AUTH-BE-009
    @Test
    void swaggerUiIsPublic() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk());
    }

    // @spec AUTH-BE-020
    // Regression test for a real bug: without CORS configured, the browser's own
    // preflight OPTIONS request is rejected by Spring Security before authorization
    // rules are even consulted, blocking every request regardless of permitAll.
    @Test
    void corsPreflightSucceedsForConfiguredFrontendOrigin() throws Exception {
        mockMvc.perform(options("/api/companies")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    // @spec AUTH-BE-020
    @Test
    void corsRejectsUnconfiguredOrigin() throws Exception {
        mockMvc.perform(options("/api/companies")
                        .header("Origin", "http://evil.example.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}
