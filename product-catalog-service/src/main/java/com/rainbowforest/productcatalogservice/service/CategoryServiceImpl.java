package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Category;
import com.rainbowforest.productcatalogservice.feignclient.MediaClient;
import com.rainbowforest.productcatalogservice.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MediaClient mediaClient;

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    @Override
    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public Category updateCategory(Long id, Category category) {
        Category existing = categoryRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setCategoryName(category.getCategoryName());
            existing.setDescription(category.getDescription());
            existing.setImage(category.getImage());
            return categoryRepository.save(existing);
        }
        return null;
    }

    @Override
    public Category updateCategoryImage(Long id, MultipartFile imageFile) {
        Category existing = categoryRepository.findById(id).orElse(null);
        if (existing != null && imageFile != null) {
            handleImageUpload(existing, imageFile);
            return categoryRepository.save(existing);
        }
        return null;
    }

    private void handleImageUpload(Category category, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                Map<String, Object> uploadResult = mediaClient.uploadImage(imageFile);
                if (uploadResult != null && uploadResult.containsKey("url")) {
                    category.setImage(uploadResult.get("url").toString());
                }
            } catch (Exception e) {
                System.err.println("Lỗi upload ảnh danh mục: " + e.getMessage());
            }
        }
    }

    @Override
    public Category getCategoryByName(String name) {
        return categoryRepository.findByCategoryName(name).orElse(null);
    }
}
