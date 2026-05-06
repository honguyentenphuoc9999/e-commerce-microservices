package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.service.PaymentService;
import com.rainbowforest.orderservice.feignclient.NotificationClient;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
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
    private NotificationClient notificationClient;


    @PostMapping("/create-vnpay-payment/{orderId}")
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

    @GetMapping("/vnpay-callback")
    public ResponseEntity<Map<String, String>> vnpayCallback(@RequestParam Map<String, String> queryParams) {
        String vnp_TxnRef = queryParams.get("vnp_TxnRef");
        Map<String, String> result = new HashMap<>();

        if (vnp_TxnRef == null || vnp_TxnRef.isBlank()) {
            result.put("RspCode", "01");
            result.put("Message", "Missing vnp_TxnRef");
            return ResponseEntity.badRequest().body(result);
        }

        Long orderId;
        try {
            orderId = Long.parseLong(vnp_TxnRef.contains("_") ? vnp_TxnRef.split("_")[0] : vnp_TxnRef);
        } catch (NumberFormatException ex) {
            result.put("RspCode", "01");
            result.put("Message", "Invalid vnp_TxnRef");
            return ResponseEntity.badRequest().body(result);
        }

        int verifyResult = paymentService.verifyCallback(queryParams);

        if (verifyResult == 1) {
            Order order = orderService.getOrderById(orderId);
            if (order != null) {
                order.setPaymentStatus("PAID");
                orderService.updateOrder(orderId, order);
                orderService.sendOrderEmail(orderId);

                result.put("RspCode", "00");
                result.put("Message", "Confirm Success");
                return ResponseEntity.ok(result);
            }

            result.put("RspCode", "01");
            result.put("Message", "Order not found");
            return ResponseEntity.badRequest().body(result);
        }

        result.put("RspCode", "97");
        result.put("Message", "Invalid signature or payment failed");
        
        // Send failure email
        orderService.sendPaymentFailedEmail(orderId, "Giao dịch không thành công hoặc chữ ký không hợp lệ.");
        
        return ResponseEntity.badRequest().body(result);
    }
}
