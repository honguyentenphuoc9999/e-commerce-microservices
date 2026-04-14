package com.rainbowforest.orderservice.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table (name = "products")
public class Product {

    @Id
    private Long id;

    @Column (name = "product_name")
    @NotNull
    private String productName;

    @Column (name = "price")
    @NotNull
    private BigDecimal price;

    @Column (name = "image")
    private String image;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> images;

    @Transient
    private Category category;

    @OneToMany (mappedBy = "product", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Item> items;

    @Transient // We don't save this in order's DB, just read it via Feign
    private Integer availability;

    public Integer getAvailability() {
        return availability;
    }

    public void setAvailability(Integer availability) {
        this.availability = availability;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}
