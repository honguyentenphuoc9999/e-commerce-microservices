package com.rainbowforest.orderservice.utilities;

import java.math.BigDecimal;
import java.util.List;

import com.rainbowforest.orderservice.domain.Item;

public class OrderUtilities {

    public static BigDecimal countTotalPrice(List<Item> cart){
        BigDecimal total = BigDecimal.ZERO;
        for(Item item : cart){
            BigDecimal sub = item.getSubTotal();
            if (sub == null && item.getProduct() != null) {
               sub = item.getProduct().getPrice().multiply(new BigDecimal(item.getQuantity()));
            }
            if (sub != null) total = total.add(sub);
        }
        return total;
    }
}
