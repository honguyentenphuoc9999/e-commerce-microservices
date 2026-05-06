package com.rainbowforest.orderservice.domain;

import lombok.Data;

@Data
public class Category {
    private Long id;
    private String categoryName;
    private String description;
}
