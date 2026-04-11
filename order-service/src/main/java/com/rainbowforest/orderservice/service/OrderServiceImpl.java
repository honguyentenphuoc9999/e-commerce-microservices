package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private com.rainbowforest.orderservice.repository.UserRepository userRepository;

    @Autowired
    private com.rainbowforest.orderservice.repository.ProductRepository productRepository;

    @Override
    public Order saveOrder(Order order) {
        // SYNCHRONIZE USER: Check if user exists in local DB
        if (order.getUser() != null) {
            if (!userRepository.existsById(order.getUser().getId())) {
                userRepository.save(order.getUser());
            }
        }
        
        // SYNCHRONIZE PRODUCTS: Check each product in items
        if(order.getItems() != null){
            for(com.rainbowforest.orderservice.domain.Item item : order.getItems()){
                if(item.getProduct() != null){
                    if(!productRepository.existsById(item.getProduct().getId())){
                        productRepository.save(item.getProduct());
                    }
                }
            }
        }
        
        return orderRepository.save(order);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null) {
            order.setOrderStatus(status);
            return orderRepository.save(order);
        }
        return null;
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    @Override
    public Order updateOrder(Long orderId, Order order) {
        if (orderRepository.existsById(orderId)) {
            order.setId(orderId);
            return orderRepository.save(order);
        }
        return null;
    }
}
