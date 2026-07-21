package com.creditscope.backend.company;

import com.creditscope.backend.rating.Grade;
import com.creditscope.backend.rating.Outlook;
import com.creditscope.backend.rating.Rating;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CompanyMapperTest {

    private final CompanyMapper mapper = new CompanyMapper();

    // @spec API-DATA-006
    @Test
    void currentGradeIsNullWhenNoRatings() {
        assertThat(mapper.currentGrade(List.of())).isNull();
    }

    // @spec API-DATA-004
    @Test
    void currentGradeIsTheLastRatingInAscendingOrder() {
        Company company = new Company("Test", "TST", "Tech", "US", null);
        Rating older = new Rating(company, Grade.BBB, Outlook.STABLE, LocalDate.of(2023, 1, 1), null);
        Rating newer = new Rating(company, Grade.A, Outlook.STABLE, LocalDate.of(2024, 1, 1), null);

        assertThat(mapper.currentGrade(List.of(older, newer))).isEqualTo(Grade.A);
    }
}
