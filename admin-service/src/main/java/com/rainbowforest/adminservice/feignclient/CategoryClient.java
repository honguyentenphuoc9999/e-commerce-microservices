package com.rainbowforest.adminservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "product-catalog-service", contextId = "categoryClient")
public interface CategoryClient {

    @GetMapping("/categories")
    Object getAllCategories();

    @GetMapping("/categories/{id}")
    Object getCategoryById(@PathVariable("id") Long id);

    @PostMapping("/categories")
    Object addCategory(@RequestBody Object category);

    @PutMapping("/categories/{id}")
    Object updateCategory(@PathVariable("id") Long id, @RequestBody Object category);

    @DeleteMapping("/categories/{id}")
    Object deleteCategory(@PathVariable("id") Long id);

    @PostMapping(value = "/admin/categories/upload-image/{id}", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    Object uploadCategoryImage(@PathVariable("id") Long id, @RequestPart("image") org.springframework.web.multipart.MultipartFile imageFile);
}
