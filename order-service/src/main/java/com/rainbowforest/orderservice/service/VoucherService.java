package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.UserVoucher;
import com.rainbowforest.orderservice.domain.Voucher;
import com.rainbowforest.orderservice.domain.VoucherType;
import com.rainbowforest.orderservice.repository.UserVoucherRepository;
import com.rainbowforest.orderservice.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private UserVoucherRepository userVoucherRepository;

    public String validateAndApplyVouchers(Order order, String voucherCodesStr) {
        if (voucherCodesStr == null || voucherCodesStr.isEmpty()) return null;

        String[] codes = voucherCodesStr.split(",");
        if (codes.length > 2) return "Maximum 2 vouchers allowed";

        boolean hasDiscount = false;
        boolean hasFreeship = false;

        BigDecimal orderTotal = order.getTotal();

        for (String code : codes) {
            code = code.trim();
            Optional<Voucher> optV = voucherRepository.findByCode(code);
            if (optV.isEmpty()) return "Invalid voucher: " + code;

            Voucher v = optV.get();
            if (!v.isActive() || v.getExpirationDate().isBefore(LocalDate.now())) {
                return "Voucher expired or inactive: " + code;
            }
            if (v.getUsedCount() >= v.getUsageLimit()) {
                return "Voucher fully claimed: " + code;
            }
            if (orderTotal.compareTo(v.getMinOrderValue()) < 0) {
                return "Minimum order value not met for " + code + ". Min required: " + v.getMinOrderValue();
            }

            // Check collision
            if (v.getType() == VoucherType.DISCOUNT) {
                if (hasDiscount) return "Cannot stack multiple DISCOUNT vouchers";
                hasDiscount = true;
                order.setDiscountVoucherCode(code);
                order.setDiscountAmount(v.getDiscountAmount());
            } else if (v.getType() == VoucherType.FREESHIP) {
                if (hasFreeship) return "Cannot stack multiple FREESHIP vouchers";
                hasFreeship = true;
                order.setFreeshipVoucherCode(code);
                order.setShippingDiscount(v.getDiscountAmount());
            }

            // Optional: UserWallet strict checking
            // If we enforce that user must have saved it:
            if (order.getUser() != null && order.getUser().getId() != null) {
                Optional<UserVoucher> uv = userVoucherRepository.findByUserIdAndVoucherId(order.getUser().getId(), v.getId());
                if (uv.isEmpty() || uv.get().isUsed()) {
                    return "You do not own this voucher or it was already used: " + code;
                }
            }
        }

        // Apply deduction
        BigDecimal newTotal = orderTotal.subtract(order.getDiscountAmount());
        if (newTotal.compareTo(BigDecimal.ZERO) < 0) newTotal = BigDecimal.ZERO;
        order.setTotal(newTotal);

        return null; // OK
    }

    public void markVouchersAsUsed(Order order) {
        processUsage(order.getDiscountVoucherCode(), order);
        processUsage(order.getFreeshipVoucherCode(), order);
    }

    private void processUsage(String code, Order order) {
        if (code == null) return;
        Optional<Voucher> opt = voucherRepository.findByCode(code);
        if (opt.isPresent()) {
            Voucher v = opt.get();
            v.setUsedCount(v.getUsedCount() + 1);
            voucherRepository.save(v);

            if (order.getUser() != null) {
                Optional<UserVoucher> uv = userVoucherRepository.findByUserIdAndVoucherId(order.getUser().getId(), v.getId());
                if (uv.isPresent()) {
                    UserVoucher userVoucher = uv.get();
                    userVoucher.setUsed(true);
                    userVoucherRepository.save(userVoucher);
                }
            }
        }
    }
}
