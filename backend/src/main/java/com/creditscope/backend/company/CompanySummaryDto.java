package com.creditscope.backend.company;

import com.creditscope.backend.rating.Grade;

import java.util.UUID;

// @spec API-BE-001, API-DATA-006
public record CompanySummaryDto(
        UUID id,
        String name,
        String ticker,
        String sector,
        String country,
        Grade currentGrade
) {
}
