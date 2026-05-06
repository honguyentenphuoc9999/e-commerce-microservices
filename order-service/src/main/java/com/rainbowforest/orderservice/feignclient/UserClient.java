package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.rainbowforest.orderservice.domain.User;

@FeignClient(name = "user-service", configuration = com.rainbowforest.orderservice.config.FeignClientConfig.class)
public interface UserClient {

    @GetMapping(value = "/users/{id}")
    public User getUserById(@PathVariable("id") Long id);

    @GetMapping(value = "/users/user/{userName}")
    public User getUserByName(@PathVariable("userName") String userName);
}
