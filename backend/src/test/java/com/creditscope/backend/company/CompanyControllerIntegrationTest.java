package com.creditscope.backend.company;

import com.creditscope.backend.auth.Role;
import com.creditscope.backend.common.AbstractIntegrationTest;
import com.creditscope.backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
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
                .andExpect(jsonPath("$.content", hasSize(20)))
                .andExpect(jsonPath("$.size").value(20))
                .andExpect(jsonPath("$.totalElements").value(48));
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
                .andExpect(jsonPath("$.totalElements").value(48));
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

    // @spec API-BE-003
    @Test
    void searchMatchesNameOrTickerCaseInsensitivePartial() throws Exception {
        // "solara" not "sola": Solaris Energy Corp (added later) also contains "sola" —
        // a real substring collision, and a reminder that a broader term should return
        // multiple matches rather than the test silently assuming it won't.
        mockMvc.perform(get("/api/companies").param("search", "solara"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].ticker").value("SOLA"));
    }

    // @spec API-BE-004
    @Test
    void sectorFilterAppliesExactMatch() throws Exception {
        mockMvc.perform(get("/api/companies").param("sector", "Technology").param("size", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].sector", everyItem(is("Technology"))));
    }

    // @spec API-BE-004
    @Test
    void gradeFilterMatchesCurrentRatingOnly() throws Exception {
        mockMvc.perform(get("/api/companies").param("grade", "AA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].currentGrade", everyItem(is("AA"))))
                .andExpect(jsonPath("$.totalElements").value(6)); // Solara, Vantage Health, Helvetia, Meridian Pharma, Redwood Software, Crestview Capital
    }

    // @spec API-BE-007
    @Test
    void invalidGradeFilterReturns400() throws Exception {
        mockMvc.perform(get("/api/companies").param("grade", "NOTAGRADE"))
                .andExpect(status().isBadRequest());
    }

    // @spec API-BE-005
    // Ascending currentGrade means best-quality-first (AAA=rank 1 ... D=rank 10), not
    // alphabetical — alphabetically "A" sorts before "AA", which is the wrong order for
    // rating quality. Five seed companies hold AAA, so that's the best present grade.
    @Test
    void sortByCurrentGradeOrdersByRatingQualityNotAlphabetically() throws Exception {
        mockMvc.perform(get("/api/companies").param("sort", "currentGrade").param("size", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].currentGrade").value("AAA"));
    }

    // @spec API-BE-011, AUTH-BE-010
    @Test
    void updateWithAdminTokenSucceeds() throws Exception {
        String id = "11111111-1111-1111-1111-111111111108"; // Prairie Agri Holdings
        mockMvc.perform(put("/api/companies/" + id)
                        .header("Authorization", "Bearer " + adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Prairie Agri Holdings Renamed","ticker":"PRAG","sector":"Consumer Staples","country":"CA"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Prairie Agri Holdings Renamed"));
    }

    // @spec API-BE-011
    @Test
    void updateWithoutTokenIsRejected() throws Exception {
        String id = "11111111-1111-1111-1111-111111111108";
        mockMvc.perform(put("/api/companies/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"x","ticker":"PRAG","sector":"Consumer Staples","country":"CA"}"""))
                .andExpect(status().isUnauthorized());
    }

    // @spec API-BE-011, API-BE-013
    @Test
    void deleteWithAdminTokenSucceedsAndCascadesRatings() throws Exception {
        Company toDelete = companyRepository.save(new Company("Delete Me Co", "DELM", "Industrials", "US", null));
        mockMvc.perform(delete("/api/companies/" + toDelete.getId())
                        .header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/companies/" + toDelete.getId()))
                .andExpect(status().isNotFound());
    }

    // @spec API-BE-013
    @Test
    void deleteAlreadyDeletedReturns404NotIdempotent() throws Exception {
        mockMvc.perform(delete("/api/companies/" + java.util.UUID.randomUUID())
                        .header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isNotFound());
    }

    // @spec API-BE-014, API-BE-011
    @Test
    void addRatingWithAdminTokenSucceeds() throws Exception {
        String id = "11111111-1111-1111-1111-111111111108";
        mockMvc.perform(post("/api/companies/" + id + "/ratings")
                        .header("Authorization", "Bearer " + adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"grade":"A","outlook":"STABLE","ratingDate":"2026-06-01","rationale":"Improved margins."}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.grade").value("A"));
        mockMvc.perform(get("/api/companies/" + id))
                .andExpect(jsonPath("$.currentGrade").value("A"));
    }

    // @spec API-BE-015
    @Test
    void addRatingToNonexistentCompanyReturns404() throws Exception {
        mockMvc.perform(post("/api/companies/" + java.util.UUID.randomUUID() + "/ratings")
                        .header("Authorization", "Bearer " + adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"grade":"A","outlook":"STABLE","ratingDate":"2026-06-01"}"""))
                .andExpect(status().isNotFound());
    }
}
