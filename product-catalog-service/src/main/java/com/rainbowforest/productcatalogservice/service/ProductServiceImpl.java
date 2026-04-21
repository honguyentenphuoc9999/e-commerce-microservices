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
        Product existingProduct = productRepository.findById(id).orElse(null);
        if (existingProduct == null) {
            return null;
        }

        // 1. Tính tổng số lượng (Ảnh hiện tại + Ảnh mới chuẩn bị upload)
        int currentImageCount = existingProduct.getImages() != null ? existingProduct.getImages().size() : 0;
        int newImageCount = imageFiles != null ? imageFiles.length : 0;
        int totalCount = currentImageCount + newImageCount;

        // 2. Kiểm tra giới hạn tổng từ 3 đến 9
        if (totalCount < 3 || totalCount > 9) {
            throw new IllegalArgumentException("Tổng số lượng hình ảnh (hiện có: " + currentImageCount + " + mới: " + newImageCount + ") phải từ 3 đến 9 ảnh!");
        }

        handleImagesUpload(existingProduct, imageFiles);
        return productRepository.save(existingProduct);
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
                        
                        // Lấy danh sách hiện tại
                        java.util.List<String> currentImages = product.getImages();
                        if (currentImages == null) {
                            currentImages = new java.util.ArrayList<>();
                        }
                        
                        // CỘNG DỒN ảnh mới vào ảnh cũ
                        currentImages.addAll(imageUrls);
                        product.setImages(currentImages);

                        // Cập nhật ảnh đại diện nếu chưa có
                        if (product.getImage() == null || product.getImage().isEmpty()) {
                            product.setImage(currentImages.get(0));
                        }
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
