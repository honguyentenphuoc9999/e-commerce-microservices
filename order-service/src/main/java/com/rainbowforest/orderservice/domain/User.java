package com.rainbowforest.orderservice.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Entity
@Table (name = "users")
public class User {

    @Id
    private Long id;

    @Column (name = "user_name")
    @NotNull
    private String userName;

    @OneToMany (mappedBy = "user")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("user")
    private List<Order> orders;

    @Column(name = "active")
    private Integer active;

    @Transient
    private String email;

    @Transient
    private java.util.Map<String, Object> userDetails;

    public String getEmail() {
        if (email != null) return email;
        if (userDetails != null && userDetails.get("email") != null) {
            return userDetails.get("email").toString();
        }
        return null;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public java.util.Map<String, Object> getUserDetails() {
        return userDetails;
    }

    public void setUserDetails(java.util.Map<String, Object> userDetails) {
        this.userDetails = userDetails;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public List<Order> getOrders() {
        return orders;
    }

    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }

    public Integer getActive() {
        return active;
    }

    public void setActive(Integer active) {
        this.active = active;
    }
}
