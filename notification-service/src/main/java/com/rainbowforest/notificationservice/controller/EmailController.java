package com.rainbowforest.notificationservice.controller;

import com.rainbowforest.notificationservice.service.EmailService;
import com.rainbowforest.notificationservice.feignclient.UserClient;
import com.rainbowforest.notificationservice.repository.EmailLogRepository;
import com.rainbowforest.notificationservice.entity.EmailLog;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class EmailController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserClient userClient;

    @Autowired
    private EmailLogRepository emailLogRepository;

    // DTO để nhận dữ liệu từ JSON
    public static class EmailRequest {
        private String toEmail;
        private String userName;
        private Long orderId;
        private Double totalAmount;
        private String resetToken;
        private String voucherCode;
        private String discount;
        private String frontendUrl;
        private List<OrderItemDTO> items;
        private String shippingAddress;
        private String paymentMethod;
        private String status;
        private String reason;

        // Getters and Setters
        public String getToEmail() { return toEmail; }
        public void setToEmail(String toEmail) { this.toEmail = toEmail; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        public Double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
        public String getResetToken() { return resetToken; }
        public void setResetToken(String resetToken) { this.resetToken = resetToken; }
        public String getVoucherCode() { return voucherCode; }
        public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }
        public String getDiscount() { return discount; }
        public void setDiscount(String discount) { this.discount = discount; }
        public String getFrontendUrl() { return frontendUrl; }
        public void setFrontendUrl(String frontendUrl) { this.frontendUrl = frontendUrl; }
        public List<OrderItemDTO> getItems() { return items; }
        public void setItems(List<OrderItemDTO> items) { this.items = items; }
        public String getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class OrderItemDTO {
        private String productName;
        private Integer quantity;
        private Double price;

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
    }

    @PostMapping("/send-order-email")
    public ResponseEntity<String> sendConfirmationEmail(@RequestBody EmailRequest request) {
        try {
            System.out.println("DEBUG: NotificationService received order email request for: " + request.getToEmail());
            validateUser(request.getUserName(), request.getToEmail());
            emailService.sendOrderConfirmation(
                request.getToEmail(), 
                request.getUserName(), 
                request.getOrderId(), 
                request.getTotalAmount(), 
                request.getFrontendUrl(),
                request.getItems(),
                request.getShippingAddress(),
                request.getPaymentMethod(),
                request.getStatus()
            );
            return ResponseEntity.ok("Thành công! Mail xác nhận đơn hàng đã được gửi.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/send-payment-failed")
    public ResponseEntity<String> sendPaymentFailed(@RequestBody EmailRequest request) {
        try {
            validateUser(request.getUserName(), request.getToEmail());
            emailService.sendPaymentFailed(
                request.getToEmail(), 
                request.getUserName(), 
                request.getOrderId(), 
                request.getTotalAmount(), 
                request.getReason()
            );
            return ResponseEntity.ok("Thành công! Mail báo lỗi thanh toán đã được gửi.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/send-forgot-password")
    public ResponseEntity<String> sendForgotPassword(@RequestBody EmailRequest request) {
        try {
            validateUser(request.getUserName(), request.getToEmail());
            emailService.sendForgotPassword(request.getToEmail(), request.getUserName(), request.getResetToken(), request.getFrontendUrl());
            return ResponseEntity.ok("Thành công! Mail đặt lại mật khẩu đã được gửi.");
        } catch (Exception e) {
            System.err.println("ERROR: sendForgotPassword failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email Error: " + e.getMessage());
        }
    }

    @PostMapping("/send-promotion")
    public ResponseEntity<String> sendPromotion(@RequestBody EmailRequest request) {
        try {
            validateUser(request.getUserName(), request.getToEmail());
            emailService.sendPromotion(request.getToEmail(), request.getUserName(), request.getVoucherCode(), request.getDiscount(), request.getFrontendUrl());
            return ResponseEntity.ok("Thành công! Mail khuyến mãi đã được gửi.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/send-account-recovery")
    public ResponseEntity<String> sendAccountRecovery(@RequestBody EmailRequest request) {
        try {
            validateUser(request.getUserName(), request.getToEmail());
            emailService.sendAccountRecovery(request.getToEmail(), request.getUserName(), request.getFrontendUrl());
            return ResponseEntity.ok("Thành công! Mail khôi phục tài khoản đã được gửi.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/send-order-completion")
    public ResponseEntity<String> sendOrderCompletion(@RequestBody EmailRequest request) {
        try {
            validateUser(request.getUserName(), request.getToEmail());
            emailService.sendOrderCompletion(
                request.getToEmail(), 
                request.getUserName(), 
                request.getOrderId(), 
                request.getFrontendUrl()
            );
            return ResponseEntity.ok("Thành công! Mail báo hoàn tất đơn hàng đã được gửi.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/send-order-cancellation")
    public ResponseEntity<String> sendOrderCancellation(@RequestBody EmailRequest request) {
        try {
            validateUser(request.getUserName(), request.getToEmail());
            emailService.sendOrderCancellation(
                request.getToEmail(), 
                request.getUserName(), 
                request.getOrderId(), 
                request.getReason(),
                request.getFrontendUrl()
            );
            return ResponseEntity.ok("Thành công! Mail báo hủy đơn hàng đã được gửi.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/send-refund-confirmation")
    public ResponseEntity<String> sendRefundConfirmation(@RequestBody EmailRequest request) {
        try {
            validateUser(request.getUserName(), request.getToEmail());
            emailService.sendRefundConfirmation(
                request.getToEmail(), 
                request.getUserName(), 
                request.getOrderId(), 
                request.getFrontendUrl()
            );
            return ResponseEntity.ok("Thành công! Mail báo hoàn tiền đã được gửi.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/email-logs")
    public ResponseEntity<Page<EmailLog>> getEmailLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(emailLogRepository.findAll(
                PageRequest.of(page, size, Sort.by("sentAt").descending())
        ));
    }

    @GetMapping("/email-logs/{id}")
    public ResponseEntity<EmailLog> getEmailLog(@PathVariable("id") Long id) {
        return emailLogRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private void validateUser(String userName, String email) throws Exception {
        try {
            if (userName != null) userClient.getUserByName(userName);
            if (email != null) userClient.getUserByEmail(email);
        } catch (Exception e) {
            // Không chặn nếu validate fail (có thể là email mới cho promotion)
        }
    }
}
