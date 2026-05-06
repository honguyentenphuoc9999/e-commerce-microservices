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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import com.rainbowforest.orderservice.service.PaymentService;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

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

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private com.rainbowforest.orderservice.repository.FinancialTransactionRepository financialTransactionRepository;

    @Value("${app.frontend_url:http://localhost:3000}")
    private String frontendUrl;

    private String resolveCartId(String cookieHeader, String directCartId, Long userId) {
        // ƯU TIÊN 1: Nếu người dùng đã đăng nhập, luôn dùng giỏ hàng theo USER_ID
        if (userId != null) {
            return "USER_" + userId;
        }
        
        // ƯU TIÊN 2: Nếu là khách, dùng cartId trực tiếp từ Header (GUEST_xxx)
        if (directCartId != null && !directCartId.isEmpty()) {
            return directCartId;
        }
        
        // DỰ PHÒNG: Dùng cookie hoặc ID mặc định
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
            @RequestParam(value = "shippingMethod", defaultValue = "standard") String shippingMethod,
            @RequestParam(value = "shippingAddress", required = false) String shippingAddress,
            @RequestParam(value = "itemIds", required = false) java.util.List<Long> itemIds,
            @RequestHeader(value = "Cookie", required = false) String cookieHeader,
            @RequestHeader(value = "cartId", required = false) String directCartId,
            @RequestHeader(value = "X-Auth-UserId", required = false) String xAuthUserId,
            HttpServletRequest request) {

        try {
            Long authUserId = (xAuthUserId != null && !"null".equals(xAuthUserId)) ? Long.parseLong(xAuthUserId)
                    : userId;
            String cartId = resolveCartId(cookieHeader, directCartId, authUserId);

            List<Item> cart = cartService.getAllItemsFromCart(cartId);

            if (cart == null || cart.isEmpty()) {
                return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
            }

            // Lọc sản phẩm theo itemIds nếu có
            List<Item> itemsToOrder = cart;
            if (itemIds != null && !itemIds.isEmpty()) {
                itemsToOrder = cart.stream()
                        .filter(item -> itemIds.contains(item.getId())
                                || (item.getProduct() != null && itemIds.contains(item.getProduct().getId())))
                        .collect(java.util.stream.Collectors.toList());
            }

            if (itemsToOrder.isEmpty()) {
                return new ResponseEntity<>("Không tìm thấy sản phẩm được chọn trong giỏ hàng",
                        headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
            }

            User user = null;
            try {
                user = userClient.getUserById(userId);
            } catch (feign.FeignException.Forbidden e) {
                return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.FORBIDDEN);
            } catch (Exception e) {
                return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.SERVICE_UNAVAILABLE);
            }

            if (user != null) {
                if (user.getActive() != null && user.getActive() != 1) {
                    return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.FORBIDDEN);
                }

                try {
                    for (Item item : itemsToOrder) {
                        productClient.deductProductInventory(item.getProduct().getId(), item.getQuantity());
                    }
                } catch (feign.FeignException.BadRequest borderEx) {
                    return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.CONFLICT);
                } catch (Exception ex) {
                    return new ResponseEntity<Order>(headerGenerator.getHeadersForError(),
                            HttpStatus.SERVICE_UNAVAILABLE);
                }

                Order order = this.createOrder(itemsToOrder, user);

                if (voucherCodes != null && !voucherCodes.isEmpty()) {
                    String error = voucherService.validateAndApplyVouchers(order, voucherCodes);
                    if (error != null) {
                        return new ResponseEntity<>(error, headerGenerator.getHeadersForError(),
                                HttpStatus.BAD_REQUEST);
                    }
                }

                BigDecimal subtotalAfterDiscount = order.getTotal();
                BigDecimal tax = subtotalAfterDiscount.multiply(new BigDecimal("0.08"));
                BigDecimal shippingFee = shippingMethod.equalsIgnoreCase("express") ? new BigDecimal("50000")
                        : new BigDecimal("20000");
                BigDecimal finalShippingFee = shippingFee.subtract(order.getShippingDiscount());
                if (finalShippingFee.compareTo(BigDecimal.ZERO) < 0)
                    finalShippingFee = BigDecimal.ZERO;

                BigDecimal finalTotal = subtotalAfterDiscount.add(tax).add(finalShippingFee);
                order.setTotal(finalTotal);
                order.setShippingAddress(shippingAddress);
                order.setShippingMethod(shippingMethod);

                orderService.saveOrder(order);

                // Chỉ xóa những sản phẩm đã đặt khỏi giỏ hàng thay vì xóa toàn bộ cart
                for (Item item : itemsToOrder) {
                    cartService.deleteItemFromCart(cartId, item.getProduct().getId());
                }

                if (voucherCodes != null && !voucherCodes.isEmpty()) {
                    voucherService.markVouchersAsUsed(order);
                }

                return new ResponseEntity<>(order,
                        headerGenerator.getHeadersForSuccessPostMethod(request, order.getId()), HttpStatus.CREATED);
            }
        } catch (Exception ex) {
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
        order.setOrderStatus("PENDING_PAYMENT");
        return order;
    }

    @GetMapping(value = "/orders")
    public ResponseEntity<?> getAllOrders(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sort", defaultValue = "id,desc") String sort) {
        try {
            String[] sortParts = sort.split(",");
            Sort sortObj = Sort.by(
                    sortParts[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                    sortParts[0]);
            Pageable pageable = PageRequest.of(page, size, sortObj);

            Page<Order> orders = orderService.getAllOrdersPaginated(pageable);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(value = "/orders/user/{userId}")
    public ResponseEntity<?> getOrdersByUserId(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            Pageable pageable = PageRequest.of(page, size,
                    Sort.by("orderedDate").descending().and(Sort.by("id").descending()));
            Page<Order> orders = orderService.getOrdersByUserIdPaginated(userId, pageable);
            return new ResponseEntity<>(orders, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/orders/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable("orderId") Long orderId,
            @RequestParam("status") String status,
            @RequestParam(value = "reason", required = false) String reason) {
        Order order = orderService.getOrderById(orderId);
        if (order != null) {
            String oldStatus = order.getOrderStatus();
            String oldPaymentStatus = order.getPaymentStatus();

            if ("CANCELLED".equalsIgnoreCase(status)) {
                order.setCancellationReason(reason != null ? reason : "Cửa hàng không thể đáp ứng đơn hàng vào lúc này.");
                
                // Nếu đơn hàng đã thanh toán -> Chuyển sang CHỜ HOÀN TIỀN
                if ("PAID".equalsIgnoreCase(oldPaymentStatus)) {
                    status = "REFUND_PENDING";
                    order.setPaymentStatus("REFUND_PENDING");
                } else {
                    // Nếu chưa thanh toán -> Hủy ngay và hoàn kho
                    if (!"CANCELLED".equalsIgnoreCase(oldStatus)) {
                        this.restoreInventory(order);
                    }
                }
                // Gửi mail thông báo
                orderService.sendOrderCancellationEmail(orderId, order.getCancellationReason());
            } else if ("REFUNDED".equalsIgnoreCase(status)) {
                // Khi nhấn hoàn tiền xong -> Đưa đơn về trạng thái HỦY và hoàn kho
                status = "CANCELLED";
                order.setPaymentStatus("REFUNDED");
                if (!"CANCELLED".equalsIgnoreCase(oldStatus)) {
                    this.restoreInventory(order);
                }
                // Ghi lại lịch sử biến động tài chính
                financialTransactionRepository.save(new com.rainbowforest.orderservice.domain.FinancialTransaction(
                    orderId, "REFUND", order.getTotal(), "Hoàn tiền thành công cho khách hàng"
                ));
                // Gửi mail xác nhận hoàn tiền thành công
                orderService.sendRefundConfirmationEmail(orderId);
            }

            order.setOrderStatus(status);

            if ("PAID".equalsIgnoreCase(status)) {
                order.setPaymentStatus("PAID");
                if (!"PAID".equalsIgnoreCase(oldPaymentStatus)) {
                    // Ghi lại lịch sử biến động tài chính
                    financialTransactionRepository.save(new com.rainbowforest.orderservice.domain.FinancialTransaction(
                        orderId, "PAYMENT", order.getTotal(), "Xác nhận thanh toán thủ công bởi Admin"
                    ));
                    orderService.sendOrderEmail(orderId); // Gửi hóa đơn khi thanh toán
                }
            }
            
            orderService.saveOrder(order);

            // Gửi email cảm ơn khi giao xong
            if (("COMPLETED".equalsIgnoreCase(status) || "DELIVERED".equalsIgnoreCase(status)) &&
                (!"COMPLETED".equalsIgnoreCase(oldStatus) && !"DELIVERED".equalsIgnoreCase(oldStatus))) {
                orderService.sendOrderCompletionEmail(orderId);
            }

            return new ResponseEntity<Order>(order, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        }
        return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
    }

    @PutMapping(value = "/orders/{orderId}")
    public ResponseEntity<Order> updateOrder(
            @PathVariable("orderId") Long orderId,
            @RequestBody Order order) {
        try {
            Order existingOrder = orderService.getOrderById(orderId);
            if (existingOrder != null) {
                if (order.getOrderStatus() != null) {
                    existingOrder.setOrderStatus(order.getOrderStatus());
                }
                orderService.saveOrder(existingOrder);
                return new ResponseEntity<Order>(existingOrder, headerGenerator.getHeadersForSuccessGetMethod(),
                        HttpStatus.OK);
            }
            return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(value = "/orders/{orderId}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable("orderId") Long orderId) {
        try {
            Order order = orderService.getOrderById(orderId);
            if (order != null) {
                return new ResponseEntity<Order>(order, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
            }
            return new ResponseEntity<Order>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(value = "/api/payment/vnpay-return")
    public void handleVNPayReturn(
            @RequestParam Map<String, String> params,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        int result = paymentService.verifyCallback(params);
        String vnp_TxnRef = params.get("vnp_TxnRef");
        String orderIdStr = (vnp_TxnRef != null && vnp_TxnRef.contains("_"))
                ? vnp_TxnRef.split("_")[0]
                : vnp_TxnRef;

        // Ưu tiên dùng frontendUrl đã cấu hình, fallback về header detection
        // Ưu tiên detect từ proxy headers để tránh "dính" URL cũ từ config
        String rawForwardedHost = request.getHeader("X-Forwarded-Host");
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        String forwardedHost = null;
        if (rawForwardedHost != null && !rawForwardedHost.isEmpty()) {
            forwardedHost = rawForwardedHost.split(",")[0].trim();
            if (forwardedHost.contains("://")) {
                forwardedHost = forwardedHost.substring(forwardedHost.indexOf("://") + 3);
            }
        }

        String proto = "https";
        if (forwardedProto != null && !forwardedProto.isEmpty()) {
            proto = forwardedProto.split(",")[0].trim();
        }

        String baseUrl;
        // Ưu tiên 1: Địa chỉ từ Proxy/Tunnel (X-Forwarded-Host)
        if (forwardedHost != null && !forwardedHost.isEmpty()) {
            baseUrl = proto + "://" + forwardedHost;
        } 
        // Ưu tiên 2: Cấu hình frontendUrl trong application.properties
        else if (frontendUrl != null && !frontendUrl.isEmpty()) {
            baseUrl = frontendUrl;
        } 
        // Dự phòng: Tự detect theo request hiện tại
        else {
            baseUrl = request.getScheme() + "://" + request.getServerName();
            if (request.getServerPort() != 80 && request.getServerPort() != 443) {
                baseUrl += ":" + request.getServerPort();
            }
        }

        if (orderIdStr == null || orderIdStr.isBlank()) {
            response.sendRedirect(baseUrl + "/payment-result?status=failed");
            return;
        }

        String vnp_ResponseCode = params.get("vnp_ResponseCode");

        if (result == 1) {
            try {
                Long orderId = Long.parseLong(orderIdStr);
                Order order = orderService.getOrderById(orderId);
                if (order != null) {
                    order.setOrderStatus("PAID");
                    order.setPaymentStatus("PAID");
                    orderService.saveOrder(order);
                    
                    // Ghi lại lịch sử biến động tài chính
                    financialTransactionRepository.save(new com.rainbowforest.orderservice.domain.FinancialTransaction(
                        orderId, "PAYMENT", order.getTotal(), "Xác nhận thanh toán thành công qua VNPay"
                    ));
                    
                    orderService.sendOrderEmail(orderId);
                }
            } catch (Exception e) {
            }
            response.sendRedirect(baseUrl + "/payment-result?status=success&orderId=" + orderIdStr);
        } else {
            // Trường hợp thanh toán thất bại HOẶC người dùng hủy (mã 24)
            try {
                Long orderId = Long.parseLong(orderIdStr);
                Order order = orderService.getOrderById(orderId);
                if (order != null) {
                    // Hoàn lại kho khi thanh toán thất bại/hủy
                    if (!"CANCELLED".equalsIgnoreCase(order.getOrderStatus())) {
                        this.restoreInventory(order);
                    }
                    order.setOrderStatus("CANCELLED"); // Chuyển sang trạng thái Hủy
                    order.setPaymentStatus("FAILED");
                    orderService.saveOrder(order);
                    orderService.sendPaymentFailedEmail(orderId, "Thanh toán không thành công hoặc bị người dùng hủy.");
                }
            } catch (Exception e) {
            }

            // Unify all non-success cases into 'failed' as requested by USER
            response.sendRedirect(baseUrl + "/payment-result?status=failed&orderId=" + orderIdStr);
        }
    }

    private void restoreInventory(Order order) {
        if (order.getItems() != null) {
            for (Item item : order.getItems()) {
                try {
                    productClient.addProductInventory(item.getProduct().getId(), item.getQuantity());
                } catch (Exception e) {
                    System.err.println(
                            "Lỗi khi hoàn trả kho cho sản phẩm " + item.getProduct().getId() + ": " + e.getMessage());
                }
            }
        }
    }
}
