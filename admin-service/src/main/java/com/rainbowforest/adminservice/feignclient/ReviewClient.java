package com.rainbowforest.adminservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;

@FeignClient(name = "product-recommendation-service")
public interface ReviewClient {

    @GetMapping("/all-recommendations")
    Object getAllReviews(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("sort") String sort,
            @RequestParam(value = "rating", required = false) String rating);

    @PostMapping("/recommendations/{id}/respond")
    Object respondToReview(@PathVariable("id") Long id, @RequestParam("response") String response);

    @GetMapping("/reviews/product/{productId}")
    Object getReviewsByProduct(@PathVariable("productId") Long productId);
}
