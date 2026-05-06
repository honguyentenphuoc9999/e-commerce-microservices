package com.rainbowforest.orderservice.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "user_vouchers")
public class UserVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @ManyToOne
    @JoinColumn(name = "voucher_id", nullable = false)
    private Voucher voucher;

    private boolean isUsed;

    public UserVoucher() {}

    public UserVoucher(Long userId, Voucher voucher) {
        this.userId = userId;
        this.voucher = voucher;
        this.isUsed = false;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Voucher getVoucher() { return voucher; }
    public void setVoucher(Voucher voucher) { this.voucher = voucher; }
    public boolean isUsed() { return isUsed; }
    public void setUsed(boolean used) { isUsed = used; }
}
