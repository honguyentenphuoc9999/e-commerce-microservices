package com.rainbowforest.orderservice.repository;

import com.rainbowforest.orderservice.domain.UserVoucher;
import com.rainbowforest.orderservice.domain.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, Long> {
    List<UserVoucher> findByUserId(Long userId);
    List<UserVoucher> findByUserIdAndIsUsedFalse(Long userId);
    Optional<UserVoucher> findByUserIdAndVoucher(Long userId, Voucher voucher);
    Optional<UserVoucher> findByUserIdAndVoucherId(Long userId, Long voucherId);
}
