package com.rainbowforest.apigateway.security;

import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpStatus;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ReactiveStringRedisTemplate redisTemplate;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        String path = request.getPath().toString();
        String method = request.getMethod().name();

        // 1. Define Public routes (No login required)
        if (path.contains("/api/accounts/login") 
            || (path.contains("/api/accounts/users") && method.equals("POST")) // Register is public
            || (path.contains("/api/accounts/registration") && method.equals("POST"))
            || (path.contains("/api/catalog/products") && method.equals("GET")) // Read products is public
            || (path.contains("/api/review/recommendations") && method.equals("GET"))) { // Read reviews is public
            return chain.filter(exchange);
        }

        // 2. Token extraction & validation
        if (!request.getHeaders().containsKey("Authorization")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String authHeader = request.getHeaders().getOrEmpty("Authorization").get(0);
        String token;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        if (!jwtUtils.validateToken(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        final String finalToken = token;
        String username = jwtUtils.extractUsername(finalToken);
        Integer tokenVersionInJwt = jwtUtils.extractTokenVersion(finalToken);

        if (username == null) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // 3. Kiểm tra trạng thái từ Redis (Real-time check)
        // Dùng defaultIfEmpty để tránh switchIfEmpty kích hoạt sau khi đã setComplete (vì setComplete trả về Mono<Void> rỗng)
        return redisTemplate.opsForValue().get("user:status:" + username)
            .defaultIfEmpty("SKIP_CHECK") 
            .flatMap(statusStr -> {
                try {
                    // Nếu không có dữ liệu trong Redis, cho phép đi tiếp (tương thích ngược)
                    if ("SKIP_CHECK".equals(statusStr) || !statusStr.contains(":")) {
                        return proceedWithFilter(exchange, chain, finalToken);
                    }

                    String[] parts = statusStr.split(":");
                    int active = Integer.parseInt(parts[0]);
                    int currentVersion = Integer.parseInt(parts[1]);

                    // A. Kiểm tra Active status (Khóa tài khoản) - ƯU TIÊN để báo 403 Forbidden cho các lệnh ghi
                    if (active == 0 && !method.equals("GET")) {
                        logger.warn("Locked user {} tried to perform {} on {}", username, method, path);
                        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                        return exchange.getResponse().setComplete(); // Dừng tại đây, không đi tiếp!
                    }

                    // B. Kiểm tra Version (Invalidate Token cũ) - Để hủy token cũ (401)
                    if (tokenVersionInJwt == null || tokenVersionInJwt != currentVersion) {
                        logger.warn("Token version mismatch for user {}: JWT={}, Redis={}", username, tokenVersionInJwt, currentVersion);
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        return exchange.getResponse().setComplete(); // Dừng tại đây!
                    }

                    return proceedWithFilter(exchange, chain, finalToken);
                } catch (Exception e) {
                    logger.error("Error processing Redis status for user {}: {}", username, e.getMessage());
                    return proceedWithFilter(exchange, chain, finalToken);
                }
            })
            .onErrorResume(e -> {
                logger.error("Global error in JwtAuthenticationFilter: {}", e.getMessage());
                exchange.getResponse().setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
                return exchange.getResponse().setComplete();
            });
    }

    private Mono<Void> proceedWithFilter(ServerWebExchange exchange, GatewayFilterChain chain, String token) {
        try {
            // 4. Role-Based Access Control (RBAC) Logic
            Claims claims = jwtUtils.getAllClaimsFromToken(token);
            String role = claims.get("role", String.class);
            String path = exchange.getRequest().getPath().toString();
            String method = exchange.getRequest().getMethod().name();

            if (isAdminEndpoint(path, method) && !"ROLE_ADMIN".equals(role)) {
                exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                return exchange.getResponse().setComplete();
            }

            // 5. Mutate headers to pass downstream
            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header("X-Auth-Username", claims.getSubject())
                .header("X-Auth-Role", role)
                .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        } catch (Exception e) {
            logger.error("Error in proceedWithFilter: {}", e.getMessage());
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    private boolean isAdminEndpoint(String path, String method) {
        if (path.startsWith("/api/catalog/products") && !method.equals("GET")) {
            return true; 
        }
        if (path.startsWith("/api/admin-bff")) {
            return true; 
        }
        if (path.startsWith("/api/shop/vouchers/admin")) {
            return true;
        }
        if (path.startsWith("/api/notification/send-order-email")) {
            return true; // Only Admin can trigger manual emails
        }
        return false;
    }

    @Override
    public int getOrder() {
        return -1; // Run before RewritePath
    }
}
