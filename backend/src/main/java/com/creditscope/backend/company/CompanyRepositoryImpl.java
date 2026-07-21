package com.creditscope.backend.company;

import com.creditscope.backend.rating.Grade;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

// @spec API-BE-003, API-BE-004, API-BE-005, API-BE-006
// Sorting/filtering by a company's *current* rating needs a value derived from the
// Rating table (most-recent-per-company via a lateral join), which Spring Data's
// Criteria-based query derivation can't express — hence a hand-written native query
// here, while everything else about Company stays plain JpaRepository usage.
@Repository
public class CompanyRepositoryImpl implements CompanyRepositoryCustom {

    private static final Map<String, String> SORT_COLUMNS = Map.of(
            "name", "c.name",
            "ticker", "c.ticker",
            "sector", "c.sector",
            "currentGrade", "grade_rank"
    );

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @SuppressWarnings("unchecked")
    public Page<Company> search(String search, String sector, String country, Grade grade,
                                 String sortField, boolean sortDesc, int pageNumberZeroBased, int pageSize) {
        String orderColumn = SORT_COLUMNS.getOrDefault(sortField, "c.name");
        String direction = sortDesc ? "DESC" : "ASC";

        String fromWhere = """
                FROM company c
                LEFT JOIN LATERAL (
                    SELECT r.grade,
                           CASE r.grade
                               WHEN 'AAA' THEN 1 WHEN 'AA' THEN 2 WHEN 'A' THEN 3 WHEN 'BBB' THEN 4
                               WHEN 'BB' THEN 5 WHEN 'B' THEN 6 WHEN 'CCC' THEN 7 WHEN 'CC' THEN 8
                               WHEN 'C' THEN 9 WHEN 'D' THEN 10 END AS grade_rank
                    FROM rating r
                    WHERE r.company_id = c.id
                    ORDER BY r.rating_date DESC, r.id DESC
                    LIMIT 1
                ) cr ON true
                WHERE (CAST(:search AS text) IS NULL OR c.name ILIKE '%' || CAST(:search AS text) || '%' OR c.ticker ILIKE '%' || CAST(:search AS text) || '%')
                  AND (CAST(:sector AS text) IS NULL OR c.sector = CAST(:sector AS text))
                  AND (CAST(:country AS text) IS NULL OR c.country = CAST(:country AS text))
                  AND (CAST(:grade AS text) IS NULL OR cr.grade = CAST(:grade AS text))
                """;

        String idSql = "SELECT c.id " + fromWhere + " ORDER BY " + orderColumn + " " + direction + " NULLS LAST, c.id ASC";
        String countSql = "SELECT count(*) " + fromWhere;

        String gradeParam = grade == null ? null : grade.name();

        List<UUID> ids = entityManager.createNativeQuery(idSql, UUID.class)
                .setParameter("search", search)
                .setParameter("sector", sector)
                .setParameter("country", country)
                .setParameter("grade", gradeParam)
                .setFirstResult(pageNumberZeroBased * pageSize)
                .setMaxResults(pageSize)
                .getResultList();

        long total = ((Number) entityManager.createNativeQuery(countSql)
                .setParameter("search", search)
                .setParameter("sector", sector)
                .setParameter("country", country)
                .setParameter("grade", gradeParam)
                .getSingleResult()).longValue();

        // Re-fetch as managed entities (with ratings eagerly joined so CompanyMapper
        // can derive currentGrade without N+1 queries), then restore the id order the
        // paginated native query already established.
        List<Company> companies = ids.isEmpty() ? List.of() : entityManager.createQuery(
                        "SELECT DISTINCT c FROM Company c LEFT JOIN FETCH c.ratings WHERE c.id IN :ids", Company.class)
                .setParameter("ids", ids)
                .getResultList();
        Map<UUID, Company> byId = companies.stream().collect(Collectors.toMap(Company::getId, c -> c));
        List<Company> ordered = ids.stream().map(byId::get).filter(Objects::nonNull).toList();

        return new PageImpl<>(ordered, PageRequest.of(pageNumberZeroBased, pageSize), total);
    }
}
