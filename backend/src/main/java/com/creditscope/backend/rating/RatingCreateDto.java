package com.creditscope.backend.rating;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

// @spec API-BE-014
public record RatingCreateDto(
        @NotNull Grade grade,
        @NotNull Outlook outlook,
        @NotNull LocalDate ratingDate,
        @Size(max = 4000) String rationale
) {
}
