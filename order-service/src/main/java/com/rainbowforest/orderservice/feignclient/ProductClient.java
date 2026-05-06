package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;

import com.rainbowforest.orderservice.domain.Product;

@FeignClient(name = "product-catalog-service", url = "http://localhost:8810/")
public interface ProductClient {

    @GetMapping(value = "/products/{id}")
    public Product getProductById(@PathVariable(value = "id") Long productId);

    @PutMapping(value = "/products/{id}/deduct")
    public ResponseEntity<Void> deductProductInventory(@PathVariable("id") Long id, @RequestParam("quantity") int quantity);

    @PutMapping(value = "/products/{id}/add")
    public ResponseEntity<Void> addProductInventory(@PathVariable("id") Long id, @RequestParam("quantity") int quantity);
}
