package com.rainbowforest.orderservice.service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

public interface PaymentService {
    String createPaymentUrl(Long orderId, long amount, HttpServletRequest request);
    int verifyCallback(Map<String, String> queryParams);
}
