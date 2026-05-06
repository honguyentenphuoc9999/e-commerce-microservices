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
import feign.FeignException;

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
        User user = userService.getUserByIdentifier(loginRequest.getUserName());

        System.out.println("DEBUG LOGIN: Attempt for user: " + (loginRequest != null ? loginRequest.getUserName() : "NULL"));
        if (user != null) {
            boolean matches = passwordEncoder.matches(loginRequest.getUserPassword(), user.getUserPassword());
            System.out.println("DEBUG LOGIN: User found in DB: " + user.getUserName());
            System.out.println("DEBUG LOGIN: Password matches: " + matches);
            System.out.println("DEBUG LOGIN: Active status: " + user.getActive());
        } else {
            System.out.println("DEBUG LOGIN: User NOT found in DB: " + (loginRequest != null ? loginRequest.getUserName() : "NULL"));
        }

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

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        try {
            // Detect dynamic URL from headers (Cloudflare/Ngrok)
            String forwardedHost = httpRequest.getHeader("X-Forwarded-Host");
            String forwardedProto = httpRequest.getHeader("X-Forwarded-Proto");
            String baseUrl = "http://localhost:3000"; // Fallback

            if (forwardedHost != null && !forwardedHost.isEmpty()) {
                String proto = (forwardedProto != null && !forwardedProto.isEmpty()) ? forwardedProto.split(",")[0].trim() : "https";
                baseUrl = proto + "://" + forwardedHost.split(",")[0].trim();
            } else {
                // Fallback to current request URL if no proxy headers
                String scheme = httpRequest.getScheme();
                String serverName = httpRequest.getServerName();
                int serverPort = httpRequest.getServerPort();
                baseUrl = scheme + "://" + serverName;
                if ((scheme.equals("http") && serverPort != 80) || (scheme.equals("https") && serverPort != 443)) {
                    baseUrl += ":" + serverPort;
                }
            }

            userService.forgotPassword(email, baseUrl);
            return ResponseEntity.ok("Password reset email sent successfully");
        } catch (feign.FeignException e) {
            String errorMsg = e.contentUTF8();
            return ResponseEntity.status(e.status() > 0 ? e.status() : 500)
                    .body(errorMsg != null && !errorMsg.isEmpty() ? errorMsg : "Lỗi từ dịch vụ Email: " + e.getMessage());
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("KHÔNG TÌM THẤY")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Token and new password are required");
        }
        try {
            userService.resetPassword(token, newPassword);
            return ResponseEntity.ok("Password reset successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
