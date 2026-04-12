package com.rainbowforest.recommendationservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "recommendation", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "product_id"})
})
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rating")
    private int rating;

    // Chỉ lưu ID và tên — không dùng @ManyToOne để tránh xung đột JPA giữa các service
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "comment", length = 1000)
    private String comment;

    @Column(name = "admin_response", length = 1000)
    private String adminResponse;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    public Recommendation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getAdminResponse() { return adminResponse; }
    public void setAdminResponse(String adminResponse) { this.adminResponse = adminResponse; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Compatibility methods for tests
    public void setUser(User user) {
        if (user != null) {
            this.userId = user.getId();
            this.userName = user.getUserName();
        }
    }

    @JsonIgnore
    public User getUser() {
        User user = new User();
        user.setId(this.userId);
        user.setUserName(this.userName);
        return user;
    }

    public void setProduct(Product product) {
        if (product != null) {
            this.productId = product.getId();
            this.productName = product.getProductName();
        }
    }

    @JsonIgnore
    public Product getProduct() {
        Product product = new Product();
        product.setId(this.productId);
        product.setProductName(this.productName);
        return product;
    }
}
