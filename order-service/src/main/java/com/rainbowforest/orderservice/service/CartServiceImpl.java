package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Product;
import com.rainbowforest.orderservice.feignclient.ProductClient;
import com.rainbowforest.orderservice.redis.CartRedisRepository;
import com.rainbowforest.orderservice.utilities.CartUtilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private ProductClient productClient;

    @Autowired
    private CartRedisRepository cartRedisRepository;

    @Override
    public void addItemToCart(String cartId, Long productId, Integer quantity) {
        List<Item> cart = (List)cartRedisRepository.getCart(cartId, Item.class);
        Item existingItem = null;
        for(Item item : cart){
            if((item.getProduct().getId()).equals(productId)){
                existingItem = item;
                break;
            }
        }

        if (existingItem != null) {
            // Trường hợp đã có SP trong giỏ: Xóa cũ, cộng dồn số lượng, thêm mới
            cartRedisRepository.deleteItemFromCart(cartId, existingItem);
            
            int newQuantity = existingItem.getQuantity() + quantity;
            int maxAllowed = Math.min(20, existingItem.getProduct().getAvailability());
            int finalQuantity = Math.min(newQuantity, maxAllowed);
            if (finalQuantity <= 0) finalQuantity = 1;
            
            existingItem.setQuantity(finalQuantity);
            existingItem.setSubTotal(CartUtilities.getSubTotalForItem(existingItem.getProduct(), finalQuantity));
            cartRedisRepository.addItemToCart(cartId, existingItem);
        } else {
            // Trường hợp chưa có SP: Thêm bình thường
            Product product = productClient.getProductById(productId);
            int maxAllowed = Math.min(20, product.getAvailability());
            int finalQuantity = Math.min(quantity, maxAllowed);
            if (finalQuantity <= 0) finalQuantity = 1;
            
            Item newItem = new Item(finalQuantity, product, CartUtilities.getSubTotalForItem(product, finalQuantity));
            cartRedisRepository.addItemToCart(cartId, newItem);
        }
    }

    @Override
    public List<Object> getCart(String cartId) {
        return (List<Object>)cartRedisRepository.getCart(cartId, Item.class);
    }

    @Override
    public void changeItemQuantity(String cartId, Long productId, Integer quantity) {
        List<Item> cart = (List)cartRedisRepository.getCart(cartId, Item.class);
        for(Item item : cart){
            if((item.getProduct().getId()).equals(productId)){
                cartRedisRepository.deleteItemFromCart(cartId, item);
                
                // Capping logic: Max 20, or whatever is left in stock
                int maxAllowed = Math.min(20, item.getProduct().getAvailability());
                int finalQuantity = Math.min(quantity, maxAllowed);
                if (finalQuantity <= 0) finalQuantity = 1;
                
                item.setQuantity(finalQuantity);
                item.setSubTotal(CartUtilities.getSubTotalForItem(item.getProduct(), finalQuantity));
                cartRedisRepository.addItemToCart(cartId, item);
            }
        }
    }

    @Override
    public void deleteItemFromCart(String cartId, Long productId) {
        List<Item> cart = (List) cartRedisRepository.getCart(cartId, Item.class);
        for(Item item : cart){
            if((item.getProduct().getId()).equals(productId)){
                cartRedisRepository.deleteItemFromCart(cartId, item);
            }
        }
    }

    @Override
    public boolean checkIfItemIsExist(String cartId, Long productId) {
        List<Item> cart = (List) cartRedisRepository.getCart(cartId, Item.class);
        for(Item item : cart){
            if((item.getProduct().getId()).equals(productId)){
                return true;
            }
        }
        return false;
    }

    @Override
    public List<Item> getAllItemsFromCart(String cartId) {
        List<Item> items = (List)cartRedisRepository.getCart(cartId, Item.class);
        return items;
    }

    @Override
    public void deleteCart(String cartId) {
        cartRedisRepository.deleteCart(cartId);
    }
}
