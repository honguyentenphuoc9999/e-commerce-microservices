package com.rainbowforest.orderservice.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "vouchers")
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    private VoucherType type;

    private BigDecimal discountAmount;
    private BigDecimal minOrderValue;
    
    private int usageLimit;
    private int usedCount;
    
    private LocalDate expirationDate;
    private boolean active;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<UserVoucher> userVouchers;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public VoucherType getType() { return type; }
    public void setType(VoucherType type) { this.type = type; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public BigDecimal getMinOrderValue() { return minOrderValue; }
    public void setMinOrderValue(BigDecimal minOrderValue) { this.minOrderValue = minOrderValue; }
    public int getUsageLimit() { return usageLimit; }
    public void setUsageLimit(int usageLimit) { this.usageLimit = usageLimit; }
    public int getUsedCount() { return usedCount; }
    public void setUsedCount(int usedCount) { this.usedCount = usedCount; }
    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public List<UserVoucher> getUserVouchers() { return userVouchers; }
    public void setUserVouchers(List<UserVoucher> userVouchers) { this.userVouchers = userVouchers; }
}
