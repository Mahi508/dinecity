package com.dinecity.wall;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "pixel_orders")
public class PixelOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_id", nullable = false, updatable = false)
    private Long businessId;

    @Column(name = "city_id", nullable = false, updatable = false)
    private Long cityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(name = "total_paise", nullable = false)
    private long totalPaise;

    @Column(name = "paid_at")
    private Instant paidAt;

    protected PixelOrder() {
    }

    public PixelOrder(Long businessId, Long cityId, OrderStatus status, long totalPaise, Instant paidAt) {
        this.businessId = businessId;
        this.cityId = cityId;
        this.status = status;
        this.totalPaise = totalPaise;
        this.paidAt = paidAt;
    }

    public Long getId() { return id; }
    public Long getBusinessId() { return businessId; }
    public Long getCityId() { return cityId; }
    public OrderStatus getStatus() { return status; }
    public long getTotalPaise() { return totalPaise; }
    public Instant getPaidAt() { return paidAt; }
}
