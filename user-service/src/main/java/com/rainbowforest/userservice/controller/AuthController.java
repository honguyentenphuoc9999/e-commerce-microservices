package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.payload.LoginRequest;
import com.rainbowforest.userservice.payload.LoginResponse;
import com.rainbowforest.userservice.security.JwtUtils;
import com.rainbowforest.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        User user = userService.getUserByName(loginRequest.getUserName());
        
        // Use passwordEncoder.matches to compare hashed password
        if (user != null && user.getUserPassword() != null && passwordEncoder.matches(loginRequest.getUserPassword(), user.getUserPassword())) {
            
            // SECURITY CHECK: Check if account is locked
            if (user.getActive() == 0) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Account is locked by Administrator");
            }

            // Generate token with current version
            String roleName = user.getRole() != null ? user.getRole().getRoleName() : "ROLE_USER";
            String token = jwtUtils.generateToken(user.getId(), user.getUserName(), roleName, user.getTokenVersion());
            
            // Đồng bộ Redis để Gateway có thông tin mới nhất
            redisTemplate.opsForValue().set("user:status:" + user.getUserName(), user.getActive() + ":" + user.getTokenVersion());
            
            String firstName = user.getUserDetails() != null ? user.getUserDetails().getFirstName() : "";
            String lastName = user.getUserDetails() != null ? user.getUserDetails().getLastName() : "";

            return ResponseEntity.ok(new LoginResponse(token, user.getId(), user.getUserName(), roleName, firstName, lastName));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
    }
}
