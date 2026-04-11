package com.rainbowforest.orderservice.repository;

import com.rainbowforest.orderservice.domain.PaymentConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentConfigRepository extends JpaRepository<PaymentConfig, Long> {
    // Lấy cấu hình đầu tiên đang ở trạng thái Active
    Optional<PaymentConfig> findFirstByActiveTrue();
}
