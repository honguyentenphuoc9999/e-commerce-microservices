package com.rainbowforest.adminservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "notification-service")
public interface NotificationClient {

    @GetMapping("/email-logs")
    Object getEmailLogs(
            @RequestParam("page") int page,
            @RequestParam("size") int size);

    @GetMapping("/email-logs/{id}")
    Object getEmailLog(@org.springframework.web.bind.annotation.PathVariable("id") Long id);
}
