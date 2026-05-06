package com.rainbowforest.adminservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping("/users")
    Object getAllUsers(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("sort") String sort,
            @RequestHeader(value = "Authorization", required = false) String token);

    @GetMapping("/users/{id}")
    Object getUserById(@PathVariable("id") Long id, @RequestHeader(value = "Authorization", required = false) String token);

    @PutMapping("/users/{id}")
    Object updateUser(@PathVariable("id") Long id, @RequestBody Object user, @RequestHeader("Authorization") String token);

    @DeleteMapping("/users/{id}")
    Object deleteUser(@PathVariable("id") Long id, @RequestHeader("Authorization") String token);

}
