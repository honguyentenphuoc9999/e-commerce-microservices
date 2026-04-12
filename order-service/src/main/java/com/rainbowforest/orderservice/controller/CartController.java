package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.User;
import com.rainbowforest.orderservice.feignclient.UserClient;
import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import com.rainbowforest.orderservice.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserClient userClient;

    @Autowired
    private HeaderGenerator headerGenerator;

    private String resolveCartId(String cookieHeader, String directCartId, String xAuthUserId) {
        // 1. Ưu tiên hàng đầu: Tài khoản đã đăng nhập (Dùng X-Auth-UserId từ Gateway)
        if (xAuthUserId != null && !xAuthUserId.isEmpty() && !"null".equals(xAuthUserId)) {
            return "USER_" + xAuthUserId;
        }
        
        // 2. Ưu tiên tiếp theo: Cart ID trực tiếp từ Header (Do Frontend quản lý cho khách)
        if (directCartId != null && !directCartId.isEmpty()) {
            return directCartId;
        }
        
        // 3. Cuối cùng: Kiểm tra Cookie (nếu có)
        if (cookieHeader != null && cookieHeader.contains("cartId=")) {
            String id = cookieHeader.split("cartId=")[1].split(";")[0].trim();
            if (!id.isEmpty()) return id;
        }
        
        // Fallback an toàn (Hạn chế tối đa dùng chung)
        return "GUEST_DEFAULT";
    }

    @PostMapping(params = {"productId", "quantity"})
    public ResponseEntity<List<Item>> addItemToCart(
            @RequestParam("productId") Long productId,
            @RequestParam("quantity") Integer quantity,
            @RequestHeader(value = "Cookie", required = false) String cookieHeader,
            @RequestHeader(value = "cartId", required = false) String directCartId,
            @RequestHeader(value = "X-Auth-UserId", required = false) String xAuthUserId,
            @RequestHeader(value = "userId", required = false) Long userId,
            HttpServletRequest request) {
        
        // KIỂM TRA TRẠNG THÁI TÀI KHOẢN
        if (userId != null) {
            try {
                User user = userClient.getUserById(userId);
                if (user != null && user.getActive() != 1) {
                    return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.FORBIDDEN);
                }
            } catch (Exception e) {
                System.out.println("DEBUG: User Service not reachable or User not found: " + userId);
            }
        }

        String cartId = resolveCartId(cookieHeader, directCartId, xAuthUserId);
        try {
            cartService.addItemToCart(cartId, productId, quantity);
        } catch (feign.FeignException.NotFound e) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        List<Item> items = cartService.getAllItemsFromCart(cartId);
        
        // Trả về headers an toàn (dùng GET Headers thay vì POST Headers để tránh lỗi URI null)
        return new ResponseEntity<>(items, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Item>> getCart(
            @RequestHeader(value = "Cookie", required = false) String cookieHeader,
            @RequestHeader(value = "X-Auth-UserId", required = false) String xAuthUserId,
            @RequestHeader(value = "cartId", required = false) String directCartId) {
        String cartId = resolveCartId(cookieHeader, directCartId, xAuthUserId);
        List<Item> items = cartService.getAllItemsFromCart(cartId);
        return new ResponseEntity<>(items, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @DeleteMapping(params = {"productId"})
    public ResponseEntity<Void> removeItemFromCart(
            @RequestParam("productId") Long productId,
            @RequestHeader(value = "Cookie", required = false) String cookieHeader,
            @RequestHeader(value = "cartId", required = false) String directCartId,
            @RequestHeader(value = "X-Auth-UserId", required = false) String xAuthUserId,
            @RequestHeader(value = "userId", required = false) Long userId) {
        
        if (userId != null) {
            try {
                User user = userClient.getUserById(userId);
                if (user != null && user.getActive() != 1) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
            } catch (Exception e) {}
        }

        String cartId = resolveCartId(cookieHeader, directCartId, xAuthUserId);
        cartService.deleteItemFromCart(cartId, productId);
        return new ResponseEntity<>(headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @PutMapping(params = {"productId", "quantity"})
    public ResponseEntity<List<Item>> updateItemQuantity(
            @RequestParam("productId") Long productId,
            @RequestParam("quantity") Integer quantity,
            @RequestHeader(value = "Cookie", required = false) String cookieHeader,
            @RequestHeader(value = "cartId", required = false) String directCartId,
            @RequestHeader(value = "X-Auth-UserId", required = false) String xAuthUserId) {
        String cartId = resolveCartId(cookieHeader, directCartId, xAuthUserId);
        cartService.changeItemQuantity(cartId, productId, quantity);
        List<Item> items = cartService.getAllItemsFromCart(cartId);
        return new ResponseEntity<>(items, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }
}
