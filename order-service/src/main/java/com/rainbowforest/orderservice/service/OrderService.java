package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Order;

import java.util.List;

public interface OrderService {
    public Order saveOrder(Order order);
    public List<Order> getAllOrders();
    public List<Order> getOrdersByUserId(Long userId);
    public org.springframework.data.domain.Page<Order> getAllOrdersPaginated(org.springframework.data.domain.Pageable pageable);
    public org.springframework.data.domain.Page<Order> getOrdersByUserIdPaginated(Long userId, org.springframework.data.domain.Pageable pageable);
    public Order getOrderById(Long id);
    public Order updateOrderStatus(Long orderId, String status);
    public Order updateOrder(Long orderId, Order order);
    public void sendOrderEmail(Long orderId);
    public void sendPaymentFailedEmail(Long orderId, String reason);
    public void sendOrderCancellationEmail(Long orderId, String reason);
    public void sendOrderCompletionEmail(Long orderId);
    public void sendRefundConfirmationEmail(Long orderId);
}
