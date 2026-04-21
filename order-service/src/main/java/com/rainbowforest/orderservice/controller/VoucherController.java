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

    // USER: Kiểm tra nhanh 1 voucher để hiện thị giảm giá trên UI
    @GetMapping("/validate")
    public ResponseEntity<?> validateVoucher(
            @RequestParam("code") String code,
            @RequestParam("amount") java.math.BigDecimal amount) {
        
        Optional<Voucher> optV = voucherRepository.findByCode(code);
        if (optV.isEmpty()) return new ResponseEntity<>("Voucher không tồn tại", HttpStatus.NOT_FOUND);

        Voucher v = optV.get();
        if (!v.isActive() || v.getExpirationDate().isBefore(LocalDate.now())) {
            return new ResponseEntity<>("Voucher đã hết hạn hoặc không hoạt động", HttpStatus.BAD_REQUEST);
        }
        if (v.getUsedCount() >= v.getUsageLimit()) {
            return new ResponseEntity<>("Voucher đã hết lượt sử dụng", HttpStatus.BAD_REQUEST);
        }
        if (amount.compareTo(v.getMinOrderValue()) < 0) {
            return new ResponseEntity<>("Đơn hàng chưa đủ giá trị tối thiểu: " + v.getMinOrderValue() + "đ", HttpStatus.BAD_REQUEST);
        }

        // Trả về thông tin giảm giá
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("code", v.getCode());
        response.put("discountAmount", v.getDiscountAmount());
        response.put("type", v.getType());
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // PUBLIC: Lấy tất cả các voucher đang hoạt động để gợi ý cho người dùng
    @GetMapping("/available")
    public ResponseEntity<List<Voucher>> getAvailableVouchers() {
        List<Voucher> all = voucherRepository.findAll();
        List<Voucher> available = all.stream()
                .filter(v -> v.isActive() 
                        && v.getExpirationDate().isAfter(LocalDate.now().minusDays(1))
                        && v.getUsedCount() < v.getUsageLimit())
                .toList();
        return new ResponseEntity<>(available, HttpStatus.OK);
    }

    // ADMIN: Lấy tất cả voucher (không lọc)
    @GetMapping("/admin/all")
    public ResponseEntity<List<Voucher>> getAllVouchers() {
        return new ResponseEntity<>(voucherRepository.findAll(), HttpStatus.OK);
    }

    // ADMIN: Cập nhật Voucher
    @PutMapping("/admin/{id}")
    public ResponseEntity<?> updateVoucher(@PathVariable Long id, @RequestBody Voucher voucherDetails) {
        return voucherRepository.findById(id).map(v -> {
            v.setCode(voucherDetails.getCode());
            v.setType(voucherDetails.getType());
            v.setDiscountAmount(voucherDetails.getDiscountAmount());
            v.setMinOrderValue(voucherDetails.getMinOrderValue());
            v.setUsageLimit(voucherDetails.getUsageLimit());
            v.setExpirationDate(voucherDetails.getExpirationDate());
            v.setActive(voucherDetails.isActive());
            return new ResponseEntity<>(voucherRepository.save(v), HttpStatus.OK);
        }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // ADMIN: Xóa Voucher
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
        if (voucherRepository.existsById(id)) {
            voucherRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
