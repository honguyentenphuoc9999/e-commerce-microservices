package com.rainbowforest.orderservice.redis;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Set;

@Repository
public class CartRedisRepositoryImpl implements CartRedisRepository{

    private ObjectMapper objectMapper = new ObjectMapper();
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    public void addItemToCart(String key, Object item) {
        try {
            String jsonObject = objectMapper.writeValueAsString(item);
            redisTemplate.opsForSet().add(key, jsonObject);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    @Override
    public Collection<Object> getCart(String key, Class type) {
        Collection<Object> cart = new ArrayList<>();
        Set<Object> members = redisTemplate.opsForSet().members(key);
        if (members != null) {
            for (Object member : members) {
                try {
                    cart.add(objectMapper.readValue(member.toString(), type));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return cart;
    }

    @Override
    public void deleteItemFromCart(String key, Object item) {
        try {
            String itemCart = objectMapper.writeValueAsString(item);
            redisTemplate.opsForSet().remove(key, itemCart);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void deleteCart(String key) {
        redisTemplate.delete(key);
    }
}
