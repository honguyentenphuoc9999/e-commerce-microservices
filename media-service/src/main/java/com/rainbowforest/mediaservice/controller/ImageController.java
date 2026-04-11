package com.rainbowforest.mediaservice.controller;

import com.rainbowforest.mediaservice.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/media")
public class ImageController {

    @Autowired
    private ImageService imageService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Lỗi: File hình ảnh trống!");
            }
            Map<String, Object> result = imageService.upload(file);
            // Trả về Link URL của Cloud cùng mã Public ID
            return ResponseEntity.ok(Map.of(
                    "status", "Thành công!",
                    "url", result.get("url"),
                    "public_id", result.get("public_id")
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tải ảnh lên Cloud: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{publicId}")
    public ResponseEntity<?> deleteImage(@PathVariable String publicId) {
        try {
            imageService.delete("rainbow-forest/products/" + publicId);
            return ResponseEntity.ok("Thành công! Hình ảnh đã được gỡ bỏ khỏi Cloud.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xóa ảnh: " + e.getMessage());
        }
    }
}
