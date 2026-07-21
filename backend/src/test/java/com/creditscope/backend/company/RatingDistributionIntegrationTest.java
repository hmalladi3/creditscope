package com.creditscope.backend.company;

import com.creditscope.backend.auth.Role;
import com.creditscope.backend.common.AbstractIntegrationTest;
import com.creditscope.backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RatingDistributionIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private JwtService jwtService;

    // @spec API-BE-016
    @Test
    void distributionIsPublicAndAlwaysReturnsAllTenGradeBuckets() throws Exception {
        mockMvc.perform(get("/api/ratings/distribution"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(10)))
                .andExpect(jsonPath("$[?(@.grade=='AAA')].count").value(0));
    }

    // @spec API-BE-018
    @Test
    void noEndpointExistsToMutateAnIndividualRating() throws Exception {
        // Authenticated as ADMIN so a 404 here proves the route itself doesn't exist,
        // rather than merely proving the request was blocked by the auth layer.
        String adminToken = jwtService.issueToken("admin", Role.ADMIN);
        String someRatingId = java.util.UUID.randomUUID().toString();
        mockMvc.perform(put("/api/ratings/" + someRatingId).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }
}
