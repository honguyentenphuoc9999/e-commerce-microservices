package com.rainbowforest.adminservice.controller;

import com.rainbowforest.adminservice.feignclient.NotificationClient;
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
    private NotificationClient notificationClient;

    @Autowired
    private com.rainbowforest.adminservice.feignclient.CategoryClient categoryClient;

    @Autowired
    private com.rainbowforest.adminservice.feignclient.ReviewClient reviewClient;

    // --- USER MANAGEMENT ---
    @GetMapping("/users")
    public Object getAllUsers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader("Authorization") String token) {
        Object usersObj = userClient.getAllUsers(page, size, "id,desc", token);
        
        try {
            if (usersObj instanceof java.util.Map) {
                java.util.Map<String, Object> pageMap = (java.util.Map<String, Object>) usersObj;
                if (pageMap.get("content") instanceof java.util.List) {
                    java.util.List<java.util.Map<String, Object>> content = 
                        (java.util.List<java.util.Map<String, Object>>) pageMap.get("content");
                    
                    for (java.util.Map<String, Object> user : content) {
                        Long userId = Long.valueOf(user.get("id").toString());
                        try {
                            Object ordersPage = orderClient.getOrdersByUserId(userId, 0, 1000, token);
                            if (ordersPage instanceof java.util.Map) {
                                java.util.Map<String, Object> oPage = (java.util.Map<String, Object>) ordersPage;
                                user.put("orders", oPage.get("content"));
                            }
                        } catch (Exception e) {}
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return usersObj;
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

            // LẤY DANH SÁCH ĐƠN HÀNG CỦA USER ĐỂ FRONTEND ĐẾM
            try {
                Object ordersPage = orderClient.getOrdersByUserId(id, 0, 1000, token); // Lấy tối đa 1000 đơn
                if (ordersPage instanceof java.util.Map) {
                    java.util.Map<String, Object> pageMap = (java.util.Map<String, Object>) ordersPage;
                    userMap.put("orders", pageMap.get("content"));
                }
            } catch (Exception e) {
                System.err.println("BFF: Failed to fetch orders for user " + id + ": " + e.getMessage());
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
    public Object getAllProducts(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return productClient.getAllProducts(page, size, "id,desc");
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
    public Object getAllCategories(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return categoryClient.getAllCategories(page, size);
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
    public Object getAllReviews(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "rating", required = false) String rating) {
        Object reviewsObj = reviewClient.getAllReviews(page, size, "id,desc", rating);
        
        try {
            if (reviewsObj instanceof java.util.Map) {
                java.util.Map<String, Object> pageMap = (java.util.Map<String, Object>) reviewsObj;
                if (pageMap.get("content") instanceof java.util.List) {
                    java.util.List<java.util.Map<String, Object>> content = 
                        (java.util.List<java.util.Map<String, Object>>) pageMap.get("content");
                    
                    for (java.util.Map<String, Object> review : content) {
                        if (review.get("productId") != null) {
                            try {
                                Long pId = Long.valueOf(review.get("productId").toString());
                                Object product = productClient.getProductById(pId);
                                if (product instanceof java.util.Map) {
                                    java.util.Map<String, Object> pMap = (java.util.Map<String, Object>) product;
                                    review.put("productImage", pMap.get("image"));
                                    if (pMap.get("category") instanceof java.util.Map) {
                                        java.util.Map<String, Object> catMap = (java.util.Map<String, Object>) pMap.get("category");
                                        review.put("categoryName", catMap.get("categoryName"));
                                    }
                                }
                            } catch (Exception e) {}
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return reviewsObj;
    }

    @PostMapping("/reviews/{id}/respond")
    public Object respondToReview(@PathVariable("id") Long id, @RequestParam("response") String response) {
        return reviewClient.respondToReview(id, response);
    }

    // --- ORDER MANAGEMENT ---
    @GetMapping("/orders")
    public Object getAllOrders(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            Object ordersObj = orderClient.getAllOrders(page, size, "id,desc", token);
            
            try {
                java.util.List<java.util.Map<String, Object>> content = null;
                if (ordersObj instanceof java.util.Map) {
                    java.util.Map<String, Object> pageMap = (java.util.Map<String, Object>) ordersObj;
                    if (pageMap.get("content") instanceof java.util.List) {
                        content = (java.util.List<java.util.Map<String, Object>>) pageMap.get("content");
                    }
                } else if (ordersObj instanceof java.util.List) {
                    content = (java.util.List<java.util.Map<String, Object>>) ordersObj;
                }

                if (content != null) {
                    for (java.util.Map<String, Object> order : content) {
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
        } catch (Exception e) {
            e.printStackTrace();
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("error", e.getMessage());
            return org.springframework.http.ResponseEntity.status(400).body(error);
        }
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
    public Object updateOrderStatus(
            @PathVariable("id") Long id, 
            @RequestParam("status") String status,
            @RequestParam(value = "reason", required = false) String reason) {
        return orderClient.updateOrderStatus(id, status, reason);
    }

    // --- EMAIL LOGS ---
    @GetMapping("/emails")
    public Object getEmailLogs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return notificationClient.getEmailLogs(page, size);
    }

    @GetMapping("/emails/{id}")
    public Object getEmail(@PathVariable("id") Long id) {
        return notificationClient.getEmailLog(id);
    }

    // --- PAYMENT CONFIG MANAGEMENT ---
    @GetMapping("/payments/config")
    public Object getPaymentConfig() {
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("status", "INFO");
        response.put("message", "VNPay config is managed via application.properties");
        return response;
    }

    @PutMapping("/payments/config")
    public Object updatePaymentConfig(@RequestBody Object configData) {
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("status", "INFO");
        response.put("message", "VNPay config is managed via application.properties");
        return response;
    }
}
