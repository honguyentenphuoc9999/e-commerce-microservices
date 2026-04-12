package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Category;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface CategoryService {
    List<Category> getAllCategories();
    Category getCategoryById(Long id);
    Category saveCategory(Category category);
    void deleteCategory(Long id);
    Category updateCategory(Long id, Category category);
    Category updateCategoryImage(Long id, MultipartFile imageFile);
    Category getCategoryByName(String name);
}
