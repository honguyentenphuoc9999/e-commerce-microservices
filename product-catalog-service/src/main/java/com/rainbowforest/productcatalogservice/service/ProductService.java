package com.rainbowforest.productcatalogservice.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;
import com.rainbowforest.productcatalogservice.entity.Product;

public interface ProductService {
    public List<Product> getAllProduct();
    public Page<Product> getAllProductsPaginated(Pageable pageable);
    public List<Product> getAllProductByCategory(String category);
    public Product getProductById(Long id);
    public List<Product> getAllProductsByName(String name);
    public List<Product> getAllProductsByPriceRange(java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice);
    public List<Product> getProductsByCategoryAndPrice(String category, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice);
    public List<Product> getProductsByNameAndPrice(String name, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice);

    // Paginated versions
    public Page<Product> getAllProductByCategoryPaginated(String category, Pageable pageable);
    public Page<Product> getAllProductsByNamePaginated(String name, Pageable pageable);
    public Page<Product> getAllProductsByPriceRangePaginated(java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, Pageable pageable);
    public Page<Product> getProductsByCategoryAndPricePaginated(String category, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, Pageable pageable);
    public Page<Product> getProductsByNameAndPricePaginated(String name, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, Pageable pageable);
    public Product addProduct(Product product, MultipartFile imageFile);
    public void deleteProduct(Long productId);
    public Product updateProduct(Long id, Product product, MultipartFile imageFile);
    public Product updateProductImage(Long id, MultipartFile imageFile);
    public Product updateProductImages(Long id, MultipartFile[] imageFiles);
    public boolean deductProductInventory(Long id, int quantity);
    public boolean addProductInventory(Long id, int quantity);
}
