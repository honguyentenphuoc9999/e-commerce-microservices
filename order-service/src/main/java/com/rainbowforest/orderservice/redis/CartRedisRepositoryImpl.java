package com.rainbowforest.orderservice.redis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.orderservice.domain.Item;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

@Repository
public class CartRedisRepositoryImpl implements CartRedisRepository {

    private ObjectMapper objectMapper = new ObjectMapper();
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    public void addItemToCart(String key, Object item) {
        try {
            // Chuyển đổi object sang Item một cách an toàn bằng ObjectMapper
            Item cartItem = objectMapper.convertValue(item, Item.class);
            String productId = String.valueOf(cartItem.getProduct().getId());
            String jsonObject = objectMapper.writeValueAsString(cartItem);
            // Sử dụng HASH để quản lý sản phẩm theo productId
            redisTemplate.opsForHash().put(key, productId, jsonObject);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public Collection<Object> getCart(String key, Class type) {
        Collection<Object> cart = new ArrayList<>();
        try {
            // Kiểm tra kiểu dữ liệu trong Redis để tránh xung đột Set/Hash
            Map<Object, Object> entries = redisTemplate.opsForHash().entries(key);
            if (entries != null) {
                for (Object value : entries.values()) {
                    try {
                        cart.add(objectMapper.readValue(value.toString(), type));
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        } catch (Exception e) {
            // Nếu lỗi (có thể do Key đang là kiểu Set cũ), hãy xóa đi để Reset lại theo kiểu Hash
            redisTemplate.delete(key);
        }
        return cart;
    }

    @Override
    public void deleteItemFromCart(String key, Object item) {
        try {
            Item cartItem = objectMapper.convertValue(item, Item.class);
            String productId = String.valueOf(cartItem.getProduct().getId());
            // Xóa field productId khỏi HASH
            redisTemplate.opsForHash().delete(key, productId);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void deleteCart(String key) {
        redisTemplate.delete(key);
    }
}
