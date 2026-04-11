package com.rainbowforest.adminservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "product-catalog-service")
public interface ProductClient {

    @GetMapping("/products")
    Object getAllProducts();

    @GetMapping("/products/{id}")
    Object getProductById(@PathVariable("id") Long id);

    @PostMapping("/admin/products")
    Object addProduct(@RequestBody Object product);

    @PutMapping("/admin/products/{id}")
    Object updateProduct(@PathVariable("id") Long id, @RequestBody Object product);

    @DeleteMapping("/admin/products/{id}")
    Object deleteProduct(@PathVariable("id") Long id);

    @PostMapping(value = "/admin/products/upload-image/{id}", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    Object uploadProductImage(@PathVariable("id") Long id, @RequestPart("image") org.springframework.web.multipart.MultipartFile imageFile);

}
