package com.rainbowforest.productcatalogservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rainbowforest.productcatalogservice.entity.Product;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    public List<Product> findAllByCategoryCategoryName(String categoryName);
    public List<Product> findAllByProductNameContainingIgnoreCase(String name);
    public List<Product> findAllByPriceBetween(java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice);
    public List<Product> findAllByCategoryCategoryNameAndPriceBetween(String categoryName, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice);
    public List<Product> findAllByProductNameContainingIgnoreCaseAndPriceBetween(String name, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice);
}
