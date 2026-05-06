package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
        if (order.getItems() != null) {
            for (com.rainbowforest.orderservice.domain.Item item : order.getItems()) {
                if (item.getProduct() != null) {
                    if (!productRepository.existsById(item.getProduct().getId())) {
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
    public Page<Order> getAllOrdersPaginated(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public Page<Order> getOrdersByUserIdPaginated(Long userId, Pageable pageable) {
        return orderRepository.findAllByUserId(userId, pageable);
    }

    @Override
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null) {
            // KIỂM TRA BẢO MẬT: Không cho phép giao hàng nếu chưa trả tiền
            if (("SHIPPED".equalsIgnoreCase(status) || "DELIVERED".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) 
                && !"PAID".equalsIgnoreCase(order.getPaymentStatus())) {
                throw new RuntimeException("LỖI BẢO MẬT: Không thể xuất kho/giao hàng khi đơn chưa được thanh toán!");
            }

            order.setOrderStatus(status);
            Order savedOrder = orderRepository.save(order);
            
            // Tự động gửi email khi đơn hoàn thành
            if ("COMPLETED".equalsIgnoreCase(status) || "DELIVERED".equalsIgnoreCase(status)) {
                sendOrderCompletionEmail(orderId);
            }
            
            return savedOrder;
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

    @Autowired
    private com.rainbowforest.orderservice.feignclient.UserClient userClient;

    @Autowired
    private com.rainbowforest.orderservice.feignclient.NotificationClient notificationClient;

    @Override
    public void sendOrderEmail(Long orderId) {
        try {
            System.out.println("DEBUG: Preparing to send email for Order ID: " + orderId);
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null && order.getUser() != null) {
                // Thử lấy thông tin User qua ID trước, nếu không được thì thử qua UserName
                com.rainbowforest.orderservice.domain.User fullUser = null;
                try {
                    fullUser = userClient.getUserById(order.getUser().getId());
                } catch (Exception e) {
                    System.out.println("DEBUG: Failed to fetch by ID, trying by Name...");
                    fullUser = userClient.getUserByName(order.getUser().getUserName());
                }

                if (fullUser != null && fullUser.getEmail() != null) {
                    System.out.println("DEBUG: Found recipient email: " + fullUser.getEmail());
                    java.util.Map<String, Object> emailReq = new java.util.HashMap<>();
                    emailReq.put("toEmail", fullUser.getEmail());
                    emailReq.put("userName", fullUser.getUserName());
                    emailReq.put("orderId", orderId);
                    emailReq.put("totalAmount", order.getTotal().doubleValue());
                    emailReq.put("shippingAddress", order.getShippingAddress());
                    emailReq.put("paymentMethod", "PAID".equalsIgnoreCase(order.getPaymentStatus()) ? "Thanh toán trực tuyến (VNPay)" : "Thanh toán khi nhận hàng (COD)");

                    // Prepare items list
                    java.util.List<java.util.Map<String, Object>> itemsList = new java.util.ArrayList<>();
                    if (order.getItems() != null) {
                        for (com.rainbowforest.orderservice.domain.Item item : order.getItems()) {
                            java.util.Map<String, Object> itemData = new java.util.HashMap<>();
                            itemData.put("productName", item.getProduct() != null ? item.getProduct().getProductName() : "Sản phẩm");
                            itemData.put("quantity", item.getQuantity());
                            itemData.put("price", item.getSubTotal().doubleValue() / item.getQuantity());
                            itemsList.add(itemData);
                        }
                    }
                    emailReq.put("items", itemsList);
                    emailReq.put("status", order.getPaymentStatus());

                    notificationClient.sendOrderConfirmation(emailReq);
                    System.out.println("DEBUG: Email request sent to notification-service");
                } else {
                    System.out.println("DEBUG: Could not find user email for order " + orderId);
                }
            } else {
                System.out.println("DEBUG: Order or User is null for ID: " + orderId);
            }
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR: Failed to send order email for order " + orderId);
            e.printStackTrace();
        }
    }

    @Override
    public void sendPaymentFailedEmail(Long orderId, String reason) {
        try {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null && order.getUser() != null) {
                com.rainbowforest.orderservice.domain.User fullUser = null;
                try {
                    fullUser = userClient.getUserById(order.getUser().getId());
                } catch (Exception e) {
                    fullUser = userClient.getUserByName(order.getUser().getUserName());
                }

                if (fullUser != null && fullUser.getEmail() != null) {
                    java.util.Map<String, Object> emailReq = new java.util.HashMap<>();
                    emailReq.put("toEmail", fullUser.getEmail());
                    emailReq.put("userName", fullUser.getUserName());
                    emailReq.put("orderId", orderId);
                    emailReq.put("totalAmount", order.getTotal().doubleValue());
                    emailReq.put("reason", reason);
                    notificationClient.sendPaymentFailed(emailReq);
                    System.out.println("DEBUG: Payment failure email request sent to notification-service");
                }
            }
        } catch (Exception e) {
            System.err.println("ERROR: Failed to send payment failed email for order " + orderId);
        }
    }

    @Override
    public void sendOrderCancellationEmail(Long orderId, String reason) {
        try {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null && order.getUser() != null) {
                com.rainbowforest.orderservice.domain.User fullUser = null;
                try {
                    fullUser = userClient.getUserById(order.getUser().getId());
                } catch (Exception e) {
                    fullUser = userClient.getUserByName(order.getUser().getUserName());
                }

                if (fullUser != null && fullUser.getEmail() != null) {
                    java.util.Map<String, Object> emailReq = new java.util.HashMap<>();
                    emailReq.put("toEmail", fullUser.getEmail());
                    emailReq.put("userName", fullUser.getUserName());
                    emailReq.put("orderId", orderId);
                    emailReq.put("reason", reason);
                    notificationClient.sendOrderCancellation(emailReq);
                    System.out.println("DEBUG: Order cancellation email request sent to notification-service");
                }
            }
        } catch (Exception e) {
            System.err.println("ERROR: Failed to send order cancellation email for order " + orderId);
        }
    }

    @Override
    public void sendOrderCompletionEmail(Long orderId) {
        try {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null && order.getUser() != null) {
                com.rainbowforest.orderservice.domain.User fullUser = null;
                try {
                    fullUser = userClient.getUserById(order.getUser().getId());
                } catch (Exception e) {
                    fullUser = userClient.getUserByName(order.getUser().getUserName());
                }

                if (fullUser != null && fullUser.getEmail() != null) {
                    java.util.Map<String, Object> emailReq = new java.util.HashMap<>();
                    emailReq.put("toEmail", fullUser.getEmail());
                    emailReq.put("userName", fullUser.getUserName());
                    emailReq.put("orderId", orderId);
                    notificationClient.sendOrderCompletion(emailReq);
                    System.out.println("DEBUG: Order completion email request sent to notification-service for order " + orderId);
                }
            }
        } catch (Exception e) {
            System.err.println("ERROR: Failed to send order completion email for order " + orderId);
        }
    }

    @Override
    public void sendRefundConfirmationEmail(Long orderId) {
        try {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null && order.getUser() != null) {
                com.rainbowforest.orderservice.domain.User fullUser = null;
                try {
                    fullUser = userClient.getUserById(order.getUser().getId());
                } catch (Exception e) {
                    fullUser = userClient.getUserByName(order.getUser().getUserName());
                }

                if (fullUser != null && fullUser.getEmail() != null) {
                    java.util.Map<String, Object> emailReq = new java.util.HashMap<>();
                    emailReq.put("toEmail", fullUser.getEmail());
                    emailReq.put("userName", fullUser.getUserName());
                    emailReq.put("orderId", orderId);
                    notificationClient.sendRefundConfirmation(emailReq);
                    System.out.println("DEBUG: Refund confirmation email request sent to notification-service for order " + orderId);
                }
            }
        } catch (Exception e) {
            System.err.println("ERROR: Failed to send refund confirmation email for order " + orderId);
        }
    }
}
