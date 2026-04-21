package com.rainbowforest.adminservice.controller;

import com.rainbowforest.adminservice.feignclient.OrderClient;
import com.rainbowforest.adminservice.feignclient.ProductClient;
import com.rainbowforest.adminservice.feignclient.UserClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class AdminBffController {

    @Autowired
    private UserClient userClient;

    @Autowired
    private ProductClient productClient;

    @Autowired
    private OrderClient orderClient;

    @Autowired
    private com.rainbowforest.adminservice.feignclient.CategoryClient categoryClient;

    @Autowired
    private com.rainbowforest.adminservice.feignclient.ReviewClient reviewClient;

    // --- USER MANAGEMENT ---
    @GetMapping("/users")
    public Object getAllUsers(@RequestHeader("Authorization") String token) {
        return userClient.getAllUsers(token);
    }

    @GetMapping("/users/{id}")
    public Object getUser(@PathVariable("id") Long id, @RequestHeader("Authorization") String token) {
        Object userObj = userClient.getUserById(id, token);
        if (userObj instanceof java.util.Map) {
            java.util.Map<String, Object> userMap = (java.util.Map<String, Object>) userObj;
            java.util.Map<String, Object> details = (java.util.Map<String, Object>) userMap.get("userDetails");
            if (details != null) {
                // Đưa tất cả các trường từ userDetails ra ngoài userMap
                userMap.putAll(details);
            }
        }
        return userObj;
    }

    @PutMapping("/users/{id}")
    public Object updateUser(@PathVariable("id") Long id, @RequestBody Object user, @RequestHeader("Authorization") String token) {
        return userClient.updateUser(id, user, token);
    }

    @DeleteMapping("/users/{id}")
    public Object deleteUser(@PathVariable("id") Long id, @RequestHeader("Authorization") String token) {
        return userClient.deleteUser(id, token);
    }

    // --- PRODUCT MANAGEMENT ---
    @GetMapping("/products")
    public Object getAllProducts() {
        return productClient.getAllProducts();
    }

    @GetMapping("/products/{id}")
    public Object getProduct(@PathVariable("id") String id) {
        String cleanId = id.contains(":") ? id.split(":")[0] : id;
        return productClient.getProductById(Long.valueOf(cleanId));
    }

    @PostMapping("/products")
    public Object addProduct(@RequestBody Object product) {
        return productClient.addProduct(product);
    }

    @PutMapping("/products/{id}")
    public Object updateProduct(@PathVariable("id") String id, @RequestBody Object product) {
        String cleanId = id.contains(":") ? id.split(":")[0] : id;
        return productClient.updateProduct(Long.valueOf(cleanId), product);
    }

    @DeleteMapping("/products/{id}")
    public Object deleteProduct(@PathVariable("id") String id) {
        String cleanId = id.contains(":") ? id.split(":")[0] : id;
        return productClient.deleteProduct(Long.valueOf(cleanId));
    }

    @PostMapping(value = "/products/upload-image/{id}", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public Object uploadProductImage(@PathVariable("id") Long id, @RequestPart("image") org.springframework.web.multipart.MultipartFile imageFile) {
        return productClient.uploadProductImage(id, imageFile);
    }

    @PostMapping(value = "/uploads/gallery/{id}", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public Object uploadProductImages(@PathVariable("id") String id, @RequestPart("images") org.springframework.web.multipart.MultipartFile[] imageFiles) {
        String cleanId = id.contains(":") ? id.split(":")[0] : id;
        return productClient.uploadProductImages(cleanId, imageFiles);
    }

    // --- CATEGORY MANAGEMENT ---
    @GetMapping("/categories")
    public Object getAllCategories() {
        return categoryClient.getAllCategories();
    }

    @GetMapping("/categories/{id}")
    public Object getCategory(@PathVariable("id") Long id) {
        return categoryClient.getCategoryById(id);
    }

    @PostMapping("/categories")
    public Object addCategory(@RequestBody Object category) {
        return categoryClient.addCategory(category);
    }

    @PutMapping("/categories/{id}")
    public Object updateCategory(@PathVariable("id") Long id, @RequestBody Object category) {
        return categoryClient.updateCategory(id, category);
    }

    @DeleteMapping("/categories/{id}")
    public Object deleteCategory(@PathVariable("id") Long id) {
        return categoryClient.deleteCategory(id);
    }

    @PostMapping(value = "/categories/upload-image/{id}", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public Object uploadCategoryImage(@PathVariable("id") Long id, @RequestPart("image") org.springframework.web.multipart.MultipartFile imageFile) {
        return categoryClient.uploadCategoryImage(id, imageFile);
    }

    // --- REVIEW MANAGEMENT ---
    @GetMapping("/reviews")
    public Object getAllReviews() {
        return reviewClient.getAllReviews();
    }

    @PostMapping("/reviews/{id}/respond")
    public Object respondToReview(@PathVariable("id") Long id, @RequestParam("response") String response) {
        return reviewClient.respondToReview(id, response);
    }

    // --- ORDER MANAGEMENT ---
    @GetMapping("/orders")
    public Object getAllOrders(@RequestHeader("Authorization") String token) {
        Object ordersObj = orderClient.getAllOrders(token);
        
        try {
            if (ordersObj instanceof java.util.List) {
                java.util.List<java.util.Map<String, Object>> orders = (java.util.List<java.util.Map<String, Object>>) ordersObj;
                
                for (java.util.Map<String, Object> order : orders) {
                    java.util.Map<String, Object> userInOrder = (java.util.Map<String, Object>) order.get("user");
                    if (userInOrder != null && userInOrder.get("id") != null) {
                        Long userId = Long.valueOf(userInOrder.get("id").toString());
                        
                        // Lấy chi tiết user từ user-service
                        try {
                            Object userFullObj = userClient.getUserById(userId, token);
                            if (userFullObj instanceof java.util.Map) {
                                java.util.Map<String, Object> userFull = (java.util.Map<String, Object>) userFullObj;
                                java.util.Map<String, Object> details = (java.util.Map<String, Object>) userFull.get("userDetails");
                                if (details != null) {
                                    userInOrder.put("email", details.get("email"));
                                }
                            }
                        } catch (Exception e) {
                            // Bỏ qua nếu không lấy được user cụ thể
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return ordersObj;
    }

    @GetMapping("/orders/{id}")
    public Object getOrder(@PathVariable("id") Long id, @RequestHeader("Authorization") String token) {
        // 1. Lấy thông tin đơn hàng từ order-service
        Object orderObj = orderClient.getOrderById(id, token);
        
        try {
            if (orderObj instanceof java.util.Map) {
                java.util.Map<String, Object> orderMap = (java.util.Map<String, Object>) orderObj;
                
                // 2. Lấy thông tin User từ Map (đã được order-service trả về phần cơ bản)
                java.util.Map<String, Object> userInOrder = (java.util.Map<String, Object>) orderMap.get("user");
                if (userInOrder != null) {
                    Long userId = Long.valueOf(userInOrder.get("id").toString());
                    
                    // 3. Gọi user-service để lấy thông tin chi tiết (Email, Address...)
                    Object userFullObj = userClient.getUserById(userId, token);
                    if (userFullObj instanceof java.util.Map) {
                        java.util.Map<String, Object> userFull = (java.util.Map<String, Object>) userFullObj;
                        java.util.Map<String, Object> details = (java.util.Map<String, Object>) userFull.get("userDetails");
                        
                        if (details != null) {
                            // Cập nhật Email và các thông tin khác vào userInOrder (cho Frontend dễ dùng)
                            userInOrder.put("email", details.get("email"));
                            userInOrder.put("phoneNumber", details.get("phoneNumber"));
                            userInOrder.put("firstName", details.get("firstName"));
                            userInOrder.put("lastName", details.get("lastName"));
                            
                            // 4. Xây dựng địa chỉ nếu đơn hàng chưa có (đơn cũ)
                            if (orderMap.get("shippingAddress") == null || orderMap.get("shippingAddress").toString().isEmpty()) {
                                StringBuilder fullAddress = new StringBuilder();
                                if (details.get("streetNumber") != null) fullAddress.append(details.get("streetNumber")).append(" ");
                                if (details.get("street") != null) fullAddress.append(details.get("street")).append(", ");
                                if (details.get("ward") != null) fullAddress.append(details.get("ward")).append(", ");
                                if (details.get("district") != null) fullAddress.append(details.get("district")).append(", ");
                                if (details.get("locality") != null) fullAddress.append(details.get("locality"));
                                
                                orderMap.put("shippingAddress", fullAddress.toString());
                                orderMap.put("shippingMethod", "standard"); // Fallback cho đơn cũ
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return orderObj;
    }

    @PutMapping("/orders/{id}")
    public Object updateOrder(@PathVariable("id") Long id, @RequestBody Object order, @RequestHeader("Authorization") String token) {
        return orderClient.updateOrder(id, order, token);
    }

    @PutMapping("/orders/{id}/status")
    public Object updateOrderStatus(@PathVariable("id") Long id, @RequestParam("status") String status) {
        return orderClient.updateOrderStatus(id, status);
    }

    // --- PAYMENT CONFIG MANAGEMENT ---
    @GetMapping("/payments/config")
    public Object getPaymentConfig() {
        return orderClient.getPaymentConfig();
    }

    @PutMapping("/payments/config")
    public Object updatePaymentConfig(@RequestBody Object configData) {
        return orderClient.updatePaymentConfig(configData);
    }
}
