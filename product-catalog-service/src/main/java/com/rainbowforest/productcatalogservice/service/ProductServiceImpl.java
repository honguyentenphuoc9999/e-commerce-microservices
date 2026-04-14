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

    @Override
    public Product updateProductImages(Long id, MultipartFile[] imageFiles) {
        if (imageFiles == null || imageFiles.length < 3 || imageFiles.length > 9) {
            throw new IllegalArgumentException("Số lượng hình ảnh cho Gallery phải từ 3 đến 9 ảnh!");
        }
        Product existingProduct = productRepository.findById(id).orElse(null);
        if (existingProduct != null) {
            handleImagesUpload(existingProduct, imageFiles);
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
            }
        }
    }

    private void handleImagesUpload(Product product, MultipartFile[] imageFiles) {
        if (imageFiles != null && imageFiles.length > 0) {
            System.out.println("Bắt đầu xử lý upload " + imageFiles.length + " ảnh cho sản phẩm: " + product.getProductName());
            try {
                List<Map<String, Object>> uploadResults = mediaClient.uploadImages(imageFiles);
                if (uploadResults != null && !uploadResults.isEmpty()) {
                    java.util.List<String> imageUrls = new java.util.ArrayList<>();
                    for (Map<String, Object> res : uploadResults) {
                        if (res.containsKey("url")) {
                            imageUrls.add(res.get("url").toString());
                        }
                    }
                    if (!imageUrls.isEmpty()) {
                        System.out.println("Upload thành công " + imageUrls.size() + " ảnh lên Cloudinary.");
                        product.setImages(imageUrls);
                        product.setImage(imageUrls.get(0));
                    }
                }
            } catch (Exception e) {
                System.err.println("CRITICAL ERROR - Lỗi upload loạt ảnh: " + e.getMessage());
                e.printStackTrace();
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
