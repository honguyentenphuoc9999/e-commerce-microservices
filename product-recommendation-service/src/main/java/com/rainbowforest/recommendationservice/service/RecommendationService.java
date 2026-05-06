package com.rainbowforest.recommendationservice.service;

import com.rainbowforest.recommendationservice.model.Recommendation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface RecommendationService {
	Recommendation getRecommendationById(Long recommendationId);
    Recommendation saveRecommendation(Recommendation recommendation);
    List<Recommendation> getAllRecommendationByProductName(String productName);
    void deleteRecommendation(Long id);
    Recommendation getRecommendationByUserIdAndProductId(Long userId, Long productId);
    List<Recommendation> getAllRecommendationsByUserId(Long userId);
    List<Recommendation> getAllRecommendations();
    Page<Recommendation> getAllRecommendationsPaginated(Pageable pageable);
    Page<Recommendation> getRecommendationsByRatingPaginated(int rating, Pageable pageable);
    Page<Recommendation> getRecommendationsByRatingRangePaginated(int min, int max, Pageable pageable);
}
