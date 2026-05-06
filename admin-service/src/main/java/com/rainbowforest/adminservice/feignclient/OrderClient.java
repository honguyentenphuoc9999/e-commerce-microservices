package com.rainbowforest.adminservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "order-service")
public interface OrderClient {

    @GetMapping("/orders")
    Object getAllOrders(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("sort") String sort,
            @RequestHeader(value = "Authorization", required = false) String token);

    @GetMapping("/orders/{orderId}")
    Object getOrderById(@PathVariable("orderId") Long orderId, @RequestHeader("Authorization") String token);

    @PutMapping("/orders/{orderId}/status")
    Object updateOrderStatus(
            @PathVariable("orderId") Long orderId, 
            @RequestParam("status") String status,
            @RequestParam(value = "reason", required = false) String reason);

    @GetMapping("/orders/user/{userId}")
    Object getOrdersByUserId(
            @PathVariable("userId") Long userId,
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestHeader(value = "Authorization", required = false) String token);

    @PutMapping("/orders/{orderId}")
    Object updateOrder(@PathVariable("orderId") Long orderId, @RequestBody Object order, @RequestHeader("Authorization") String token);

}
