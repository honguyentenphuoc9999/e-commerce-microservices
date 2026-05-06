package com.rainbowforest.recommendationservice.repository;

import com.rainbowforest.recommendationservice.model.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
@Transactional
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    // Dùng trường productName thay vì r.product.productName (vì không còn @ManyToOne)
    @Query("SELECT r FROM Recommendation r WHERE r.productName = :productName")
    List<Recommendation> findAllRatingByProductName(@Param("productName") String productName);

    Recommendation findByUserIdAndProductId(Long userId, Long productId);

    List<Recommendation> findByUserId(Long userId);

    org.springframework.data.domain.Page<Recommendation> findByRating(int rating, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Recommendation> findByRatingBetween(int min, int max, org.springframework.data.domain.Pageable pageable);
}
