package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service")
public interface NotificationClient {

    @PostMapping("/send-order-email")
    void sendOrderConfirmation(@RequestBody Object request);

    @PostMapping("/send-promotion")
    void sendPromotion(@RequestBody Object request);

    @PostMapping("/send-payment-failed")
    void sendPaymentFailed(@RequestBody Object request);

    @PostMapping("/send-order-cancellation")
    void sendOrderCancellation(@RequestBody Object request);

    @PostMapping("/send-order-completion")
    void sendOrderCompletion(@RequestBody Object request);

    @PostMapping("/send-refund-confirmation")
    void sendRefundConfirmation(@RequestBody Object request);
}
