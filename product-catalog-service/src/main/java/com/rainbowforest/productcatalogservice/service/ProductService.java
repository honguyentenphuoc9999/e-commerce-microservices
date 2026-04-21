package com.rainbowforest.productcatalogservice.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;
import com.rainbowforest.productcatalogservice.entity.Product;

public interface ProductService {
    public List<Product> getAllProduct();
    public List<Product> getAllProductByCategory(String category);
    public Product getProductById(Long id);
    public List<Product> getAllProductsByName(String name);
    public List<Product> getAllProductsByPriceRange(java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice);
    public List<Product> getProductsByCategoryAndPrice(String category, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice);
    public List<Product> getProductsByNameAndPrice(String name, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice);
    public Product addProduct(Product product, MultipartFile imageFile);
    public void deleteProduct(Long productId);
    public Product updateProduct(Long id, Product product, MultipartFile imageFile);
    public Product updateProductImage(Long id, MultipartFile imageFile);
    public Product updateProductImages(Long id, MultipartFile[] imageFiles);
    public boolean deductProductInventory(Long id, int quantity);
}
