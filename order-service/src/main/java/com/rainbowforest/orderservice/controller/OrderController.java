package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.User;
import com.rainbowforest.orderservice.feignclient.UserClient;
import com.rainbowforest.orderservice.feignclient.ProductClient;
import com.rainbowforest.orderservice.feignclient.NotificationClient;
import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import com.rainbowforest.orderservice.service.CartService;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.service.VoucherService;
import com.rainbowforest.orderservice.utilities.OrderUtilities;
import com.rainbowforest.orderservice.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;

@RestController
public class OrderController {

    @Autowired
    private UserClient userClient;

    @Autowired
    private ProductClient productClient;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private NotificationClient notificationClient;

    private String resolveCartId(String cookieHeader, String directCartId) {
        if (directCartId != null && !directCartId.isEmpty()) {
            return directCartId;
        }
        if (cookieHeader == null || cookieHeader.isEmpty()) {
            return "12345678";
        }
        String id = cookieHeader.replace("cartId=", "").trim();
        return id.matches("\\d+") ? id : "12345678";
    }

    @PostMapping(value = "/order/{userId}")
    public ResponseEntity<?> saveOrder(
    		@PathVariable("userId") Long userId,
            @RequestParam(value = "voucherCodes", required = false) String voucherCodes,
    		@RequestHeader(value = "Cookie", required = false) String cookieHeader,
            @RequestHeader(value = "cartId", required = false) String directCartId,
    		HttpServletRequest request){
    	
        try {
            String cartId = resolveCartId(cookieHeader, directCartId);
            List<Item> cart = cartService.getAllItemsFromCart(cartId);
            
            if(cart == null || cart.isEmpty()){
                System.out.println("DEBUG: Cart is empty for cartId: " + cartId);
                return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
            }

            // Gọi User Service qua Feign
            User user = null;
            try {
                user = userClient.getUserById(userId);
            } catch (feign.FeignException.Forbidden e) {
                System.out.println("ERROR: Account is LOCKED/UNAUTHORIZED for userId: " + userId);
                return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.FORBIDDEN);
            } catch (Exception e) {
                System.out.println("ERROR: Could not fetch user from user-service: " + e.getMessage());
                return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.SERVICE_UNAVAILABLE);
            }

            if(user != null) {
                if(user.getActive() != null && user.getActive() != 1) {
                    return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.FORBIDDEN);
                }

                // Check and deduct inventory for all items
                try {
                    for (Item item : cart) {
                        productClient.deductProductInventory(item.getProduct().getId(), item.getQuantity());
                    }
                } catch (feign.FeignException.BadRequest borderEx) {
                    System.out.println("ERROR: Insufficient inventory for product in cart.");
                    return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.CONFLICT); // 409 Conflict if out of stock
                } catch (Exception ex) {
                    System.out.println("ERROR: Could not communicate with product-catalog-service: " + ex.getMessage());
                    return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.SERVICE_UNAVAILABLE);
                }

                Order order = this.createOrder(cart, user);

                // Apply Vouchers
                if (voucherCodes != null && !voucherCodes.isEmpty()) {
                    String error = voucherService.validateAndApplyVouchers(order, voucherCodes);
                    if (error != null) {
                        return new ResponseEntity<>(error, headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
                    }
                }

                orderService.saveOrder(order);
                cartService.deleteCart(cartId);

                // Mark vouchers as used
                if (voucherCodes != null && !voucherCodes.isEmpty()) {
                    voucherService.markVouchersAsUsed(order);
                }
                // Send Email Notification (Async style via separate service call)
                try {
                    User fullUser = userClient.getUserById(user.getId());
                    if (fullUser != null && fullUser.getEmail() != null) {
                        java.util.Map<String, Object> emailRequest = new java.util.HashMap<>();
                        emailRequest.put("toEmail", fullUser.getEmail());
                        emailRequest.put("userName", fullUser.getUserName());
                        emailRequest.put("orderId", order.getId());
                        emailRequest.put("totalAmount", order.getTotal());
                        
                        notificationClient.sendConfirmationEmail(emailRequest);
                    }
                } catch (Exception e) {
                    System.out.println("Warning: Could not send email notification: " + e.getMessage());
                }
                return new ResponseEntity<>(
                    order, 
                    headerGenerator.getHeadersForSuccessPostMethod(request, order.getId()),
                    HttpStatus.CREATED);
            }
        } catch (Exception ex) {
            System.out.println("CRITICAL ERROR in Order Placement: " + ex.getMessage());
            ex.printStackTrace();
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
  
        return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
    }
    
    private Order createOrder(List<Item> cart, User user) {
        Order order = new Order();
        order.setItems(cart);
        order.setUser(user);
        order.setTotal(OrderUtilities.countTotalPrice(cart));
        order.setOrderedDate(LocalDate.now());
        order.setOrderStatus("PAYMENT_EXPECTED");
        return order;
    }

    // Các hàm sau giữ nguyên...
    @GetMapping(value = "/orders")
    public ResponseEntity<List<Order>> getAllOrders(@RequestHeader(value = "Authorization") String token) {
        try {
            String jwt = token.replace("Bearer ", "");
            String role = jwtUtils.extractRole(jwt);
            if (role == null || !role.equals("ROLE_ADMIN")) {
                return new ResponseEntity<List<Order>>(headerGenerator.getHeadersForError(), HttpStatus.FORBIDDEN);
            }
            List<Order> orders = orderService.getAllOrders();
            return new ResponseEntity<List<Order>>(orders, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<List<Order>>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(value = "/orders/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(
            @PathVariable("userId") Long userId,
            @RequestHeader(value = "Authorization") String token) {
        try {
            String jwt = token.replace("Bearer ", "");
            String username = jwtUtils.extractUsername(jwt);
            User requestingUser = userClient.getUserByName(username);
            List<Order> orders = orderService.getOrdersByUserId(userId);
            return new ResponseEntity<List<Order>>(orders, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<List<Order>>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/orders/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable("orderId") Long orderId,
            @RequestParam("status") String status) {
        Order order = orderService.updateOrderStatus(orderId, status);
        return new ResponseEntity<Order>(order, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @PutMapping(value = "/orders/{orderId}")
    public ResponseEntity<Order> updateOrder(
            @PathVariable("orderId") Long orderId,
            @RequestBody Order order,
            @RequestHeader(value = "Authorization") String token) {
        try {
            // Kiểm tra quyền (Chỉ cho phép ADMIN)
            String jwt = token.replace("Bearer ", "");
            String role = jwtUtils.extractRole(jwt);
            if (role == null || !role.equals("ROLE_ADMIN")) {
                return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.FORBIDDEN);
            }
            
            Order existingOrder = orderService.getOrderById(orderId);
            if (existingOrder != null) {
                // Chỉ cập nhật trạng thái nếu form chỉ có trạng thái
                if (order.getOrderStatus() != null) {
                    existingOrder.setOrderStatus(order.getOrderStatus());
                }
                orderService.saveOrder(existingOrder);
                return new ResponseEntity<Order>(existingOrder, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
            }
            return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<Order>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(value = "/orders/{orderId}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable("orderId") Long orderId,
            @RequestHeader(value = "Authorization") String token) {
        try {
            // Kiểm tra quyền (Chỉ cho phép ADMIN)
            String jwt = token.replace("Bearer ", "");
            String role = jwtUtils.extractRole(jwt);
            if (role == null || !role.equals("ROLE_ADMIN")) {
                return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.FORBIDDEN);
            }
            
            Order order = orderService.getOrderById(orderId);
            if (order != null) {
                return new ResponseEntity<Order>(order, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
            }
            return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<Order>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
