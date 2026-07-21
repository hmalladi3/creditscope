package com.creditscope.backend.rating;

import java.time.LocalDate;
import java.util.UUID;

public record RatingDto(
        UUID id,
        Grade grade,
        Outlook outlook,
        LocalDate ratingDate,
        String rationale
) {
    public static RatingDto from(Rating rating) {
        return new RatingDto(rating.getId(), rating.getGrade(), rating.getOutlook(),
                rating.getRatingDate(), rating.getRationale());
    }
}
