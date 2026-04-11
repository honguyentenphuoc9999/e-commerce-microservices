package com.rainbowforest.recommendationservice.controller;

import com.rainbowforest.recommendationservice.feignClient.ProductClient;
import com.rainbowforest.recommendationservice.feignClient.UserClient;
import com.rainbowforest.recommendationservice.http.header.HeaderGenerator;
import com.rainbowforest.recommendationservice.model.Product;
import com.rainbowforest.recommendationservice.model.Recommendation;
import com.rainbowforest.recommendationservice.model.User;
import com.rainbowforest.recommendationservice.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private ProductClient productClient;

    @Autowired
    private UserClient userClient;

    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping(value = "/recommendations")
    public ResponseEntity<List<Recommendation>> getAllRating(@RequestParam("name") String productName) {
        List<Recommendation> recommendations = recommendationService.getAllRecommendationByProductName(productName);
        if (!recommendations.isEmpty()) {
            return new ResponseEntity<>(recommendations, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        }
        return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/{userId}/recommendations/{productId}")
    public ResponseEntity<Recommendation> getRecommendationByUserIdAndProductId(
            @PathVariable("userId") Long userId,
            @PathVariable("productId") Long productId) {
        Recommendation recommendation = recommendationService.getRecommendationByUserIdAndProductId(userId, productId);
        if (recommendation != null) {
            return new ResponseEntity<>(recommendation, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        }
        return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/{userId}/recommendations")
    public ResponseEntity<List<Recommendation>> getAllRecommendationsByUserId(@PathVariable("userId") Long userId) {
        List<Recommendation> recommendations = recommendationService.getAllRecommendationsByUserId(userId);
        return new ResponseEntity<>(recommendations != null ? recommendations : List.of(), headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @PostMapping(value = "/{userId}/recommendations/{productId}")
    public ResponseEntity<Recommendation> saveRecommendations(
            @PathVariable("userId") Long userId,
            @PathVariable("productId") Long productId,
            @RequestParam("rating") int rating,
            HttpServletRequest request) {

        try {
            // 1. Kiểm tra xem đã có đánh giá chưa - POST chỉ được dùng để TẠO MỚI
            Recommendation recommendation = recommendationService.getRecommendationByUserIdAndProductId(userId, productId);
            if (recommendation != null) {
                // Đã tồn tại -> Không cho phép POST nữa
                return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.CONFLICT);
            }

            // 2. Lấy User từ user-service và kiểm tra trạng thái tài khoản
            User user = null;
            try {
                user = userClient.getUserById(userId);
            } catch (Exception e) {
                return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
            }

            if (user == null || (user.getActive() != null && user.getActive() != 1)) {
                return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
            }

            // 3. Lấy Product từ product-service
            Product product = null;
            try {
                product = productClient.getProductById(productId);
            } catch (Exception e) {
                return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
            }

            if (product == null) {
                return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
            }

            // 4. Tạo mới
            recommendation = new Recommendation();
            recommendation.setUserId(userId);
            recommendation.setUserName(user.getUserName());
            recommendation.setProductId(productId);
            recommendation.setProductName(product.getProductName());
            recommendation.setRating(rating);

            Recommendation saved = recommendationService.saveRecommendation(recommendation);
            return new ResponseEntity<>(saved, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.CREATED);

        } catch (Exception e) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/{userId}/recommendations/{productId}")
    public ResponseEntity<Recommendation> updateRecommendations(
            @PathVariable("userId") Long userId,
            @PathVariable("productId") Long productId,
            @RequestParam("rating") int rating,
            HttpServletRequest request) {

        try {
            // 1. Kiểm tra xem đã có đánh giá chưa - PUT chỉ được dùng để CẬP NHẬT
            Recommendation recommendation = recommendationService.getRecommendationByUserIdAndProductId(userId, productId);
            if (recommendation == null) {
                // Chưa tồn tại -> Không cho phép PUT
                return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
            }

            // 2. Cập nhật điểm rating
            recommendation.setRating(rating);
            Recommendation saved = recommendationService.saveRecommendation(recommendation);
            return new ResponseEntity<>(saved, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping(value = "/recommendations/{id}")
    public ResponseEntity<Void> deleteRecommendations(@PathVariable("id") Long id) {
        Recommendation recommendation = recommendationService.getRecommendationById(id);
        if (recommendation != null) {
            try {
                recommendationService.deleteRecommendation(id);
                return new ResponseEntity<>(headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
            } catch (Exception e) {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
