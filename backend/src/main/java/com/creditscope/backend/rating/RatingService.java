package com.creditscope.backend.rating;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// @spec API-BE-016
@Service
@Transactional(readOnly = true)
public class RatingService {

    private final RatingRepository ratingRepository;

    public RatingService(RatingRepository ratingRepository) {
        this.ratingRepository = ratingRepository;
    }

    public List<RatingDistributionBucket> distribution() {
        Map<Grade, Long> counts = new LinkedHashMap<>();
        for (Grade grade : Grade.values()) {
            counts.put(grade, 0L);
        }
        for (Rating rating : ratingRepository.findCurrentRatingPerCompany()) {
            counts.merge(rating.getGrade(), 1L, Long::sum);
        }
        return counts.entrySet().stream()
                .map(e -> new RatingDistributionBucket(e.getKey(), e.getValue()))
                .toList();
    }
}
