package com.rainbowforest.orderservice.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table (name = "orders")
public class Order {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (name = "ordered_date")
    @NotNull
    private LocalDate orderedDate;

    @Column(name = "status")
    @NotNull
    private String orderStatus;

    @Column (name = "total")
    private BigDecimal total;

    // VOUCHER WALLET INTEGRATION
    @Column(name = "discount_voucher_code")
    private String discountVoucherCode;
    
    @Column(name = "freeship_voucher_code")
    private String freeshipVoucherCode;
    
    @Column(name = "discount_amount")
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    @Column(name = "shipping_discount")
    private BigDecimal shippingDiscount = BigDecimal.ZERO;

    @Column(name = "payment_status")
    private String paymentStatus = "UNPAID";

    @ManyToMany (cascade = CascadeType.ALL)
    @JoinTable (name = "cart" , joinColumns = @JoinColumn(name = "order_id"), inverseJoinColumns = @JoinColumn (name = "item_id"))
    private List<Item> items;

    @ManyToOne
    @JoinColumn (name = "user_id")
    private User user;
    
	public Order() {
		
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public LocalDate getOrderedDate() {
		return orderedDate;
	}

	public void setOrderedDate(LocalDate orderedDate) {
		this.orderedDate = orderedDate;
	}

	public String getOrderStatus() {
		return orderStatus;
	}
 
	public void setOrderStatus(String orderStatus) {
		this.orderStatus = orderStatus;
	}

	public BigDecimal getTotal() {
		return total;
	}

	public void setTotal(BigDecimal total) {
		this.total = total;
	}

	public List<Item> getItems() {
		return items;
	}

	public void setItems(List<Item> items) {
		this.items = items;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getDiscountVoucherCode() {
		return discountVoucherCode;
	}

	public void setDiscountVoucherCode(String discountVoucherCode) {
		this.discountVoucherCode = discountVoucherCode;
	}

	public String getFreeshipVoucherCode() {
		return freeshipVoucherCode;
	}

	public void setFreeshipVoucherCode(String freeshipVoucherCode) {
		this.freeshipVoucherCode = freeshipVoucherCode;
	}

	public BigDecimal getDiscountAmount() {
		return discountAmount;
	}

	public void setDiscountAmount(BigDecimal discountAmount) {
		this.discountAmount = discountAmount;
	}

	public BigDecimal getShippingDiscount() {
		return shippingDiscount;
	}

	public void setShippingDiscount(BigDecimal shippingDiscount) {
		this.shippingDiscount = shippingDiscount;
	}

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}
