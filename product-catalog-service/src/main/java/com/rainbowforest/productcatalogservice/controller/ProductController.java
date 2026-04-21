package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class ProductController {

    @Autowired
    private ProductService productService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping (value = "/products")
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "minPrice", required = false) java.math.BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) java.math.BigDecimal maxPrice
    ){
        List<Product> products;
        
        // Nếu có bất kỳ tham số giá nào, đảm bảo cả 2 đều có giá trị mặc định nếu thiếu
        boolean hasPriceFilter = minPrice != null || maxPrice != null;
        java.math.BigDecimal effectiveMin = minPrice != null ? minPrice : java.math.BigDecimal.ZERO;
        java.math.BigDecimal effectiveMax = maxPrice != null ? maxPrice : new java.math.BigDecimal("999999999999");

        if (category != null && hasPriceFilter) {
            products = productService.getProductsByCategoryAndPrice(category, effectiveMin, effectiveMax);
        } else if (name != null && hasPriceFilter) {
            products = productService.getProductsByNameAndPrice(name, effectiveMin, effectiveMax);
        } else if (hasPriceFilter) {
            products = productService.getAllProductsByPriceRange(effectiveMin, effectiveMax);
        } else if (category != null) {
            products = productService.getAllProductByCategory(category);
        } else if (name != null) {
            products = productService.getAllProductsByName(name);
        } else {
            products = productService.getAllProduct();
        }

        return new ResponseEntity<List<Product>>(
                products,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @GetMapping (value = "/products/{id}")
    public ResponseEntity<Product> getOneProductById(@PathVariable ("id") long id){
        Product product =  productService.getProductById(id);
        if(product != null) {
            return new ResponseEntity<Product>(
                    product,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<Product>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @PutMapping(value = "/products/{id}/deduct")
    public ResponseEntity<Void> deductProductInventory(
            @PathVariable("id") long id,
            @RequestParam("quantity") int quantity) {
        boolean success = productService.deductProductInventory(id, quantity);
        if (success) {
            return new ResponseEntity<Void>(
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<Void>(
                headerGenerator.getHeadersForError(),
                HttpStatus.BAD_REQUEST);
    }
}
