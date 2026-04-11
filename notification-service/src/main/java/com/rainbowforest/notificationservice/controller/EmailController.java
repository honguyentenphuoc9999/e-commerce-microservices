package com.rainbowforest.notificationservice.controller;

import com.rainbowforest.notificationservice.service.EmailService;
import com.rainbowforest.notificationservice.feignclient.UserClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EmailController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserClient userClient;

    // DTO để nhận dữ liệu từ JSON
    public static class EmailRequest {
        private String toEmail;
        private String userName;
        private Long orderId;
        private Double totalAmount;
        private String resetToken;   // MỚI
        private String voucherCode;  // MỚI
        private String discount;     // MỚI

        // Getters and Setters
        public String getToEmail() { return toEmail; }
        public String getUserName() { return userName; }
        public Long getOrderId() { return orderId; }
        public Double getTotalAmount() { return totalAmount; }
        public String getResetToken() { return resetToken; }
        public String getVoucherCode() { return voucherCode; }
        public String getDiscount() { return discount; }
    }

    @PostMapping("/send-order-email")
    public ResponseEntity<String> sendConfirmationEmail(@RequestBody EmailRequest request) {
        try {
            validateUser(request.getUserName(), request.getToEmail());
            emailService.sendOrderConfirmation(request.getToEmail(), request.getUserName(), request.getOrderId(), request.getTotalAmount());
            return ResponseEntity.ok("Thành công! Mail xác nhận đơn hàng đã được gửi.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/send-forgot-password")
    public ResponseEntity<String> sendForgotPassword(@RequestBody EmailRequest request) {
        try {
            validateUser(request.getUserName(), request.getToEmail());
            emailService.sendForgotPassword(request.getToEmail(), request.getUserName(), request.getResetToken());
            return ResponseEntity.ok("Thành công! Mail đặt lại mật khẩu đã được gửi.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/send-promotion")
    public ResponseEntity<String> sendPromotion(@RequestBody EmailRequest request) {
        try {
            validateUser(request.getUserName(), request.getToEmail());
            emailService.sendPromotion(request.getToEmail(), request.getUserName(), request.getVoucherCode(), request.getDiscount());
            return ResponseEntity.ok("Thành công! Mail khuyến mãi đã được gửi.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    private void validateUser(String userName, String email) throws Exception {
        try {
            userClient.getUserByName(userName);
            userClient.getUserByEmail(email);
        } catch (Exception e) {
            throw new Exception("Xác thực thất bại: Tài khoản hoặc Email chưa được đăng ký!");
        }
    }
}
