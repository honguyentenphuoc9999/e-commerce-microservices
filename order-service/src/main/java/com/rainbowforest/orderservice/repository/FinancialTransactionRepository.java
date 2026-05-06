package com.rainbowforest.orderservice.repository;

import com.rainbowforest.orderservice.domain.FinancialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, Long> {
    List<FinancialTransaction> findByOrderIdOrderByCreatedAtDesc(Long orderId);
}
