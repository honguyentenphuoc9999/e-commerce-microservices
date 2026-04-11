package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.UserVoucher;
import com.rainbowforest.orderservice.domain.Voucher;
import com.rainbowforest.orderservice.repository.UserVoucherRepository;
import com.rainbowforest.orderservice.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/vouchers")
public class VoucherController {

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private UserVoucherRepository userVoucherRepository;

    // ADMIN: Tạo mới 1 Voucher
    @PostMapping("/admin/create")
    public ResponseEntity<?> createVoucher(@RequestBody Voucher voucher) {
        if (voucherRepository.findByCode(voucher.getCode()).isPresent()) {
            return new ResponseEntity<>("Voucher code already exists!", HttpStatus.CONFLICT);
        }
        voucher.setActive(true);
        Voucher saved = voucherRepository.save(voucher);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // USER: Khách hàng click "Lưu" Voucher vào Ví
    @PostMapping("/wallet/save")
    public ResponseEntity<String> saveVoucherToWallet(
            @RequestParam("userId") Long userId,
            @RequestParam("code") String code) {

        Optional<Voucher> optVoucher = voucherRepository.findByCode(code);
        if (optVoucher.isEmpty()) {
            return new ResponseEntity<>("Voucher does not exist", HttpStatus.NOT_FOUND);
        }

        Voucher voucher = optVoucher.get();
        if (!voucher.isActive() || voucher.getExpirationDate().isBefore(LocalDate.now())) {
            return new ResponseEntity<>("Voucher is expired or inactive", HttpStatus.BAD_REQUEST);
        }

        if (voucher.getUsedCount() >= voucher.getUsageLimit()) {
            return new ResponseEntity<>("Voucher usage limit reached", HttpStatus.BAD_REQUEST);
        }

        Optional<UserVoucher> existing = userVoucherRepository.findByUserIdAndVoucherId(userId, voucher.getId());
        if (existing.isPresent()) {
            return new ResponseEntity<>("You have already saved this voucher", HttpStatus.CONFLICT);
        }

        UserVoucher userVoucher = new UserVoucher(userId, voucher);
        userVoucherRepository.save(userVoucher);

        return new ResponseEntity<>("Voucher saved to your wallet successfully", HttpStatus.OK);
    }

    // USER: Mở Ví xem rổ Voucher đang có
    @GetMapping("/wallet/{userId}")
    public ResponseEntity<List<UserVoucher>> getMyVouchers(@PathVariable("userId") Long userId) {
        List<UserVoucher> list = userVoucherRepository.findByUserIdAndIsUsedFalse(userId);
        return new ResponseEntity<>(list, HttpStatus.OK);
    }
}
