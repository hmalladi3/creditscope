package com.creditscope.backend.rating;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface RatingRepository extends JpaRepository<Rating, UUID> {

    // @spec API-BE-016, API-DATA-004
    @Query(value = """
            SELECT DISTINCT ON (r.company_id) r.*
            FROM rating r
            ORDER BY r.company_id, r.rating_date DESC, r.id DESC
            """, nativeQuery = true)
    List<Rating> findCurrentRatingPerCompany();
}
