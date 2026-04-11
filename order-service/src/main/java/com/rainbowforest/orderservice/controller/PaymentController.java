package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.PaymentConfig;
import com.rainbowforest.orderservice.repository.PaymentConfigRepository;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentConfigRepository paymentConfigRepository;

    @PostMapping("/create-vietqr-payment/{orderId}")
    public ResponseEntity<Map<String, String>> createPayment(@PathVariable Long orderId, HttpServletRequest request) {
        Order order = orderService.getOrderById(orderId);
        if (order == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Order not found");
            return ResponseEntity.status(404).body(error);
        }

        long amount = order.getTotal().longValue();
        String paymentUrl = paymentService.createPaymentUrl(orderId, amount, request);

        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", paymentUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vietqr-callback")
    public ResponseEntity<Map<String, Object>> vietqrCallback(@RequestParam Long orderId) {
        Order order = orderService.getOrderById(orderId);
        if (order != null) {
            order.setPaymentStatus("PAID");
            orderService.updateOrder(orderId, order);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Thanh toán VietQR đã ghi nhận!");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/config")
    public ResponseEntity<Map<String, String>> updateConfig(@RequestBody Map<String, String> configData) {
        PaymentConfig config = paymentConfigRepository.findFirstByActiveTrue()
                .orElse(new PaymentConfig());
        
        config.setBankId(configData.getOrDefault("bankId", config.getBankId()));
        config.setAccountNo(configData.getOrDefault("accountNo", config.getAccountNo()));
        config.setAccountName(configData.getOrDefault("accountName", config.getAccountName()));
        config.setTemplate(configData.getOrDefault("template", "compact2"));
        config.setActive(true);
        
        paymentConfigRepository.save(config);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Đã cập nhật tài khoản nhận tiền: " + config.getBankId());
        return ResponseEntity.ok(response);
    }
}
