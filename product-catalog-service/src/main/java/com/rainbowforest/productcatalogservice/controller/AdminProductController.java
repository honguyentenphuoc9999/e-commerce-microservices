package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/admin")
public class AdminProductController {

    @Autowired
    private ProductService productService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @PostMapping(value = "/products", consumes = "application/json")
    public ResponseEntity<Product> addProductJson(
            @RequestBody Product product,
            HttpServletRequest request){
    	if(product != null) {
    		try {
    			Product savedProduct = productService.addProduct(product, null);
    	        return new ResponseEntity<Product>(
    	        		savedProduct,
    	        		headerGenerator.getHeadersForSuccessPostMethod(request, savedProduct.getId()),
    	        		HttpStatus.CREATED);
    		}catch (Exception e) {
    			return new ResponseEntity<Product>(
    					headerGenerator.getHeadersForError(),
    					HttpStatus.INTERNAL_SERVER_ERROR);
    		}
    	}
    	return new ResponseEntity<Product>(
    			headerGenerator.getHeadersForError(),
    			HttpStatus.BAD_REQUEST);       
    }

    @PostMapping(value = "/products", consumes = "multipart/form-data")
    public ResponseEntity<Product> addProduct(
            @RequestPart("product") Product product,
            @RequestPart(value = "file", required = false) MultipartFile imageFile,
            HttpServletRequest request){
    	if(product != null) {
    		try {
    			Product savedProduct = productService.addProduct(product, imageFile);
    	        return new ResponseEntity<Product>(
    	        		savedProduct,
    	        		headerGenerator.getHeadersForSuccessPostMethod(request, savedProduct.getId()),
    	        		HttpStatus.CREATED);
    		}catch (Exception e) {
    			return new ResponseEntity<Product>(
    					headerGenerator.getHeadersForError(),
    					HttpStatus.INTERNAL_SERVER_ERROR);
    		}
    	}
    	return new ResponseEntity<Product>(
    			headerGenerator.getHeadersForError(),
    			HttpStatus.BAD_REQUEST);       
    }

    @PostMapping(value = "/products/upload-image/{id}", consumes = "multipart/form-data")
    public ResponseEntity<Product> uploadProductImage(
            @PathVariable("id") Long id,
            @RequestPart("image") MultipartFile imageFile){
        try {
            Product updatedProduct = productService.updateProductImage(id, imageFile);
            if (updatedProduct != null) {
                return new ResponseEntity<Product>(
                        updatedProduct,
                        headerGenerator.getHeadersForSuccessGetMethod(),
                        HttpStatus.OK);
            }
            return new ResponseEntity<Product>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<Product>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/uploads/gallery/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadProductImages(
            @PathVariable("id") String id,
            @RequestPart("images") MultipartFile[] imageFiles){
        try {
            // Xử lý trường hợp ID chứa version (ví dụ 1:1)
            String cleanId = id.contains(":") ? id.split(":")[0] : id;
            Product updatedProduct = productService.updateProductImages(Long.valueOf(cleanId), imageFiles);
            if (updatedProduct != null) {
                return new ResponseEntity<Product>(
                        updatedProduct,
                        headerGenerator.getHeadersForSuccessGetMethod(),
                        HttpStatus.OK);
            }
            return new ResponseEntity<Product>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<String>(e.getMessage(), headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<Product>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @DeleteMapping(value = "/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id){
    	Product product = productService.getProductById(id);
    	if(product != null) {
    		try {
    			productService.deleteProduct(id);
    	        return new ResponseEntity<Void>(
    	        		headerGenerator.getHeadersForSuccessGetMethod(),
    	        		HttpStatus.OK);
    		}catch (Exception e) {
    	        return new ResponseEntity<Void>(
    	        		headerGenerator.getHeadersForError(),
    	        		HttpStatus.INTERNAL_SERVER_ERROR);
    		}
    	}
    	return new ResponseEntity<Void>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);      
    }

    @PutMapping(value = "/products/{id}", consumes = "application/json")
    public ResponseEntity<Product> updateProductJson(
            @PathVariable("id") Long id,
            @RequestBody Product product){
        if(product != null) {
            try {
                Product updatedProduct = productService.updateProduct(id, product, null);
                if (updatedProduct != null) {
                    return new ResponseEntity<Product>(
                            updatedProduct,
                            headerGenerator.getHeadersForSuccessGetMethod(),
                            HttpStatus.OK);
                }
                return new ResponseEntity<Product>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.NOT_FOUND);
            } catch (Exception e) {
                return new ResponseEntity<Product>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return new ResponseEntity<Product>(
                headerGenerator.getHeadersForError(),
                HttpStatus.BAD_REQUEST);
    }

    @PutMapping(value = "/products/{id}", consumes = "multipart/form-data")
    public ResponseEntity<Product> updateProduct(
            @PathVariable("id") Long id,
            @RequestPart("product") Product product,
            @RequestPart(value = "file", required = false) MultipartFile imageFile){
        if(product != null) {
            try {
                Product updatedProduct = productService.updateProduct(id, product, imageFile);
                if (updatedProduct != null) {
                    return new ResponseEntity<Product>(
                            updatedProduct,
                            headerGenerator.getHeadersForSuccessGetMethod(),
                            HttpStatus.OK);
                }
                return new ResponseEntity<Product>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.NOT_FOUND);
            } catch (Exception e) {
                return new ResponseEntity<Product>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return new ResponseEntity<Product>(
                headerGenerator.getHeadersForError(),
                HttpStatus.BAD_REQUEST);
    }
}
