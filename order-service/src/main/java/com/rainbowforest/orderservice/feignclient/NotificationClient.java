package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "notification-service")
public interface NotificationClient {

    @PostMapping("/send-order-email")
    void sendConfirmationEmail(@RequestBody java.util.Map<String, Object> request);
}
