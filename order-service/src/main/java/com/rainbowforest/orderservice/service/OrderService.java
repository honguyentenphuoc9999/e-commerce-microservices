package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Order;

import java.util.List;

public interface OrderService {
    public Order saveOrder(Order order);
    public List<Order> getAllOrders();
    public List<Order> getOrdersByUserId(Long userId);
    public Order getOrderById(Long id);
    public Order updateOrderStatus(Long orderId, String status);
    public Order updateOrder(Long orderId, Order order);
}
