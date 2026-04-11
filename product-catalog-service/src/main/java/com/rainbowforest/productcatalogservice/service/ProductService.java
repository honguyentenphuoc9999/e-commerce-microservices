package com.rainbowforest.productcatalogservice.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;
import com.rainbowforest.productcatalogservice.entity.Product;

public interface ProductService {
    public List<Product> getAllProduct();
    public List<Product> getAllProductByCategory(String category);
    public Product getProductById(Long id);
    public List<Product> getAllProductsByName(String name);
    public Product addProduct(Product product, MultipartFile imageFile);
    public void deleteProduct(Long productId);
    public Product updateProduct(Long id, Product product, MultipartFile imageFile);
    public Product updateProductImage(Long id, MultipartFile imageFile);
    public boolean deductProductInventory(Long id, int quantity);
}
