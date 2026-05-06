package com.rainbowforest.orderservice.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "payment_configs")
@Data
public class PaymentConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bankId;     // Ví dụ: VIB, MB, VCB
    private String accountNo;  // Số tài khoản
    private String accountName;// Tên chủ tài khoản
    private String template;   // Giao diện QR (compact, qr_only...)
    
    private boolean active;    // Đang sử dụng hay không
}
