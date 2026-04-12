package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Category;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin")
public class AdminCategoryController {

    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @PostMapping(value = "/categories/upload-image/{id}", consumes = "multipart/form-data")
    public ResponseEntity<Category> uploadCategoryImage(
            @PathVariable("id") Long id,
            @RequestPart("image") MultipartFile imageFile){
        try {
            Category updatedCategory = categoryService.updateCategoryImage(id, imageFile);
            if (updatedCategory != null) {
                return new ResponseEntity<Category>(
                        updatedCategory,
                        headerGenerator.getHeadersForSuccessGetMethod(),
                        HttpStatus.OK);
            }
            return new ResponseEntity<Category>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<Category>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
