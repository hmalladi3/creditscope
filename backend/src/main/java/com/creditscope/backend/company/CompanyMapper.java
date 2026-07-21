package com.creditscope.backend.company;

import com.creditscope.backend.rating.Grade;
import com.creditscope.backend.rating.Rating;
import com.creditscope.backend.rating.RatingDto;
import org.springframework.stereotype.Component;

import java.util.List;

// @spec API-DATA-004, API-DATA-006, API-BE-009
@Component
public class CompanyMapper {

    /** Ratings must already be ordered ascending by (ratingDate, id) — see Company.ratings' @OrderBy. */
    public Grade currentGrade(List<Rating> ratingsAscending) {
        if (ratingsAscending.isEmpty()) {
            return null;
        }
        return ratingsAscending.get(ratingsAscending.size() - 1).getGrade();
    }

    public CompanySummaryDto toSummary(Company company) {
        return new CompanySummaryDto(
                company.getId(), company.getName(), company.getTicker(),
                company.getSector(), company.getCountry(), currentGrade(company.getRatings()));
    }

    public CompanyDetailDto toDetail(Company company) {
        List<RatingDto> ratingDtos = company.getRatings().stream().map(RatingDto::from).toList();
        return new CompanyDetailDto(
                company.getId(), company.getName(), company.getTicker(), company.getSector(),
                company.getCountry(), company.getDescription(),
                currentGrade(company.getRatings()), ratingDtos);
    }
}
