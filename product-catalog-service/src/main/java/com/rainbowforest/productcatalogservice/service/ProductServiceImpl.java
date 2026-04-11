package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.feignclient.MediaClient;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MediaClient mediaClient;

    @Override
    public List<Product> getAllProduct() {
        return productRepository.findAll();
    }

    @Override
    public List<Product> getAllProductByCategory(String category) {
        return productRepository.findAllByCategoryCategoryName(category);
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    @Override
    public List<Product> getAllProductsByName(String name) {
        return productRepository.findAllByProductNameContainingIgnoreCase(name);
    }

    @Override
    public Product addProduct(Product product, MultipartFile imageFile) {
        handleImageUpload(product, imageFile);
        return productRepository.save(product);
    }

    @Override
    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }

    @Override
    public Product updateProduct(Long id, Product product, MultipartFile imageFile) {
        Product existingProduct = productRepository.findById(id).orElse(null);
        if (existingProduct != null) {
            existingProduct.setProductName(product.getProductName());
            existingProduct.setPrice(product.getPrice());
            existingProduct.setDiscription(product.getDiscription());
            existingProduct.setCategory(product.getCategory());
            existingProduct.setAvailability(product.getAvailability());
            
            handleImageUpload(existingProduct, imageFile);
            
            return productRepository.save(existingProduct);
        }
        return null;
    }

    @Override
    public Product updateProductImage(Long id, MultipartFile imageFile) {
        Product existingProduct = productRepository.findById(id).orElse(null);
        if (existingProduct != null && imageFile != null) {
            handleImageUpload(existingProduct, imageFile);
            return productRepository.save(existingProduct);
        }
        return null;
    }

    private void handleImageUpload(Product product, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                Map<String, Object> uploadResult = mediaClient.uploadImage(imageFile);
                if (uploadResult != null && uploadResult.containsKey("url")) {
                    product.setImage(uploadResult.get("url").toString());
                }
            } catch (Exception e) {
                System.err.println("Lỗi upload ảnh: " + e.getMessage());
                // Tiếp tục lưu sản phẩm mà không có ảnh nếu upload lỗi, hoặc throw lỗi nếu cần
            }
        }
    }

    @Override
    public boolean deductProductInventory(Long id, int quantity) {
        Product existingProduct = productRepository.findById(id).orElse(null);
        if (existingProduct != null && existingProduct.getAvailability() >= quantity) {
            existingProduct.setAvailability(existingProduct.getAvailability() - quantity);
            productRepository.save(existingProduct);
            return true;
        }
        return false;
    }
}
