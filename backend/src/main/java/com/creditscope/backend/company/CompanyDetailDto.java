package com.creditscope.backend.company;

import com.creditscope.backend.rating.Grade;
import com.creditscope.backend.rating.RatingDto;

import java.util.List;
import java.util.UUID;

// @spec API-BE-009, API-DATA-006
public record CompanyDetailDto(
        UUID id,
        String name,
        String ticker,
        String sector,
        String country,
        String description,
        Grade currentGrade,
        List<RatingDto> ratings
) {
}
