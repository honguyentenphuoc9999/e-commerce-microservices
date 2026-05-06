package com.rainbowforest.notificationservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping("/users/user/{userName}")
    Object getUserByName(@PathVariable("userName") String userName);

    @GetMapping("/users/email/{email}")
    Object getUserByEmail(@PathVariable("email") String email);
}
