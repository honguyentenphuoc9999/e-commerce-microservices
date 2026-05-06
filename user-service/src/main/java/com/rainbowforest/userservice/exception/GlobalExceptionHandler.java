package com.rainbowforest.userservice.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Map<String, String> response = new HashMap<>();
        String message = ex.getMostSpecificCause().getMessage();
        
        // Cố gắng đoán trường bị trùng dựa trên nội dung lỗi của DB
        if (message != null && (message.contains("@") || message.toLowerCase().contains("email"))) {
            response.put("message", "Email này đã được sử dụng bởi một tài khoản khác. Vui lòng kiểm tra lại hoặc sử dụng thông tin khác.");
        } else if (message != null && (message.matches(".*['\"][0-9]+['\"].*") || message.toLowerCase().contains("phone"))) {
            response.put("message", "Số điện thoại này đã được sử dụng bởi một tài khoản khác. Vui lòng kiểm tra lại hoặc sử dụng thông tin khác.");
        } else {
            response.put("message", "Thông tin nhập vào đã tồn tại trong hệ thống (Email hoặc Số điện thoại).");
        }
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        // Trả về thẳng message từ Service ném ra (VD: "Email đã được sử dụng")
        response.put("message", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã xảy ra lỗi hệ thống: " + ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
