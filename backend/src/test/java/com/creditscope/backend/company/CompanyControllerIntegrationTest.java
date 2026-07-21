package com.creditscope.backend.company;

import com.creditscope.backend.auth.Role;
import com.creditscope.backend.common.AbstractIntegrationTest;
import com.creditscope.backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CompanyControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CompanyRepository companyRepository;

    private String adminToken() {
        return jwtService.issueToken("admin", Role.ADMIN);
    }

    private String viewerToken() {
        return jwtService.issueToken("viewer", Role.VIEWER);
    }

    // @spec API-BE-001
    @Test
    void listIsPublicAndDefaultsToPageSize20() throws Exception {
        mockMvc.perform(get("/api/companies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(18)))
                .andExpect(jsonPath("$.size").value(20));
    }

    // @spec API-BE-002
    @Test
    void rejectsSizeGreaterThan100() throws Exception {
        mockMvc.perform(get("/api/companies").param("size", "101"))
                .andExpect(status().isBadRequest());
    }

    // @spec API-BE-002
    @Test
    void rejectsNonPositivePage() throws Exception {
        mockMvc.perform(get("/api/companies").param("page", "0"))
                .andExpect(status().isBadRequest());
    }

    // @spec API-BE-008
    @Test
    void pageBeyondLastReturnsEmptyContentWithValidMetadata() throws Exception {
        mockMvc.perform(get("/api/companies").param("page", "999").param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.totalElements").value(18));
    }

    // @spec API-BE-006
    @Test
    void sortedListIsDeterministicAcrossRepeatedRequests() throws Exception {
        String first = mockMvc.perform(get("/api/companies").param("sort", "sector").param("size", "100"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String second = mockMvc.perform(get("/api/companies").param("sort", "sector").param("size", "100"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        org.junit.jupiter.api.Assertions.assertEquals(first, second);
    }

    // @spec API-BE-007
    @Test
    void rejectsUnknownSortField() throws Exception {
        mockMvc.perform(get("/api/companies").param("sort", "notAField"))
                .andExpect(status().isBadRequest());
    }

    // @spec API-BE-009, API-DATA-004
    @Test
    void getByIdReturnsDetailWithRatingHistoryAndCurrentGrade() throws Exception {
        String id = "11111111-1111-1111-1111-111111111103"; // Solara: A, A, AA (current = AA)
        mockMvc.perform(get("/api/companies/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticker").value("SOLA"))
                .andExpect(jsonPath("$.currentGrade").value("AA"))
                .andExpect(jsonPath("$.ratings", hasSize(3)));
    }

    // @spec API-BE-010, API-ERR-002
    @Test
    void getByIdReturns404ForUnknownId() throws Exception {
        mockMvc.perform(get("/api/companies/" + java.util.UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    // @spec API-DATA-006
    @Test
    void companyWithNoRatingsHasNullCurrentGradeAndEmptyHistory() throws Exception {
        Company noRatings = companyRepository.save(new Company("No Ratings Co", "NORT", "Industrials", "US", null));
        mockMvc.perform(get("/api/companies/" + noRatings.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentGrade").doesNotExist())
                .andExpect(jsonPath("$.ratings", hasSize(0)));
    }

    // @spec API-BE-011
    // @spec AUTH-BE-008, AUTH-BE-012
    @Test
    void createWithoutTokenIsRejected() throws Exception {
        mockMvc.perform(post("/api/companies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Test Co","ticker":"TST","sector":"Technology","country":"US"}"""))
                .andExpect(status().isUnauthorized());
    }

    // @spec API-BE-011, AUTH-BE-010, AUTH-BE-013
    @Test
    void createWithViewerTokenIsForbidden() throws Exception {
        mockMvc.perform(post("/api/companies")
                        .header("Authorization", "Bearer " + viewerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Test Co","ticker":"TSTV","sector":"Technology","country":"US"}"""))
                .andExpect(status().isForbidden());
    }

    // @spec API-BE-011, API-BE-012, AUTH-BE-010
    @Test
    void createWithAdminTokenSucceeds() throws Exception {
        mockMvc.perform(post("/api/companies")
                        .header("Authorization", "Bearer " + adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Test Co","ticker":"TSTA","sector":"Technology","country":"US","description":"d"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ticker").value("TSTA"));
    }

    // @spec API-ERR-001
    @Test
    void createWithBlankNameReturns400WithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/companies")
                        .header("Authorization", "Bearer " + adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"","ticker":"TSTB","sector":"Technology","country":"US"}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[0].field").value("name"));
    }

    // @spec API-ERR-003, API-DATA-001
    @Test
    void createWithDuplicateTickerCaseInsensitiveReturns409() throws Exception {
        mockMvc.perform(post("/api/companies")
                        .header("Authorization", "Bearer " + adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Dup Co","ticker":"acme","sector":"Technology","country":"US"}"""))
                .andExpect(status().isConflict());
    }
}
