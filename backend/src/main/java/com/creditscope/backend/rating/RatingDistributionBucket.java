package com.creditscope.backend.rating;

// @spec API-BE-016
public record RatingDistributionBucket(Grade grade, long count) {
}
