package com.rainbowforest.apigateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;

@Component
public class JwtUtils {

    private static final String SECRET = "A_VERY_STRONG_SECRET_KEY_FOR_JWT_THAT_IS_LONG_ENOUGH_FOR_HMAC_SHA256";
    private final Key key;

    public JwtUtils() {
        this.key = Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }

    public boolean validateToken(String token) {
        try {
            getAllClaimsFromToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        try {
            return getAllClaimsFromToken(token).getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public Integer extractTokenVersion(String token) {
        try {
            Object version = getAllClaimsFromToken(token).get("tokenVersion");
            if (version instanceof Number) {
                return ((Number) version).intValue();
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
