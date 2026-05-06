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
    public ResponseEntity<?> getProducts(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "minPrice", required = false) java.math.BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) java.math.BigDecimal maxPrice,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sort", required = false) String sort
    ){
        org.springframework.data.domain.Sort sortOrder = org.springframework.data.domain.Sort.by("id").descending();
        if (sort != null && !sort.isEmpty()) {
            if ("price-asc".equals(sort) || "price,asc".equals(sort)) {
                sortOrder = org.springframework.data.domain.Sort.by("price").ascending();
            } else if ("price-desc".equals(sort) || "price,desc".equals(sort)) {
                sortOrder = org.springframework.data.domain.Sort.by("price").descending();
            } else if (sort.contains(",")) {
                String[] parts = sort.split(",");
                sortOrder = org.springframework.data.domain.Sort.by(
                    parts[1].equalsIgnoreCase("desc") ? org.springframework.data.domain.Sort.Direction.DESC : org.springframework.data.domain.Sort.Direction.ASC,
                    parts[0]
                );
            }
        }

        org.springframework.data.domain.Pageable pageable = 
            org.springframework.data.domain.PageRequest.of(page, size, sortOrder);

        boolean hasPriceFilter = minPrice != null || maxPrice != null;
        java.math.BigDecimal effectiveMin = minPrice != null ? minPrice : java.math.BigDecimal.ZERO;
        java.math.BigDecimal effectiveMax = maxPrice != null ? maxPrice : new java.math.BigDecimal("999999999999");

        org.springframework.data.domain.Page<Product> productsPage;

        if (category != null && hasPriceFilter) {
            productsPage = productService.getProductsByCategoryAndPricePaginated(category, effectiveMin, effectiveMax, pageable);
        } else if (name != null && hasPriceFilter) {
            productsPage = productService.getProductsByNameAndPricePaginated(name, effectiveMin, effectiveMax, pageable);
        } else if (hasPriceFilter) {
            productsPage = productService.getAllProductsByPriceRangePaginated(effectiveMin, effectiveMax, pageable);
        } else if (category != null) {
            productsPage = productService.getAllProductByCategoryPaginated(category, pageable);
        } else if (name != null) {
            productsPage = productService.getAllProductsByNamePaginated(name, pageable);
        } else {
            productsPage = productService.getAllProductsPaginated(pageable);
        }

        return new ResponseEntity<>(
                productsPage,
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

    @PutMapping(value = "/products/{id}/add")
    public ResponseEntity<Void> addProductInventory(
            @PathVariable("id") long id,
            @RequestParam("quantity") int quantity) {
        boolean success = productService.addProductInventory(id, quantity);
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
