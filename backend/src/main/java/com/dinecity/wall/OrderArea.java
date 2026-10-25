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

/**
 * One rectangle on the wall. endsAt == null means permanent.
 * The database also refuses overlapping HELD/CONFIRMED rectangles (exclusion constraint in V1),
 * so even two simultaneous purchases can never both succeed.
 */
@Entity
@Table(name = "order_areas")
public class OrderArea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, updatable = false)
    private Long orderId;

    @Column(name = "city_id", nullable = false, updatable = false)
    private Long cityId;

    @Column(nullable = false, updatable = false)
    private int x;

    @Column(nullable = false, updatable = false)
    private int y;

    @Column(nullable = false, updatable = false)
    private int width;

    @Column(nullable = false, updatable = false)
    private int height;

    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_type", nullable = false, updatable = false)
    private PurchaseType purchaseType;

    @Column(name = "starts_at", nullable = false, updatable = false)
    private Instant startsAt;

    @Column(name = "ends_at", updatable = false)
    private Instant endsAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AreaStatus status;

    protected OrderArea() {
    }

    public OrderArea(Long orderId, Long cityId, int x, int y, int width, int height,
                     PurchaseType purchaseType, Instant startsAt, Instant endsAt, AreaStatus status) {
        this.orderId = orderId;
        this.cityId = cityId;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.purchaseType = purchaseType;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.status = status;
    }

    public Long getId() { return id; }
    public Long getOrderId() { return orderId; }
    public Long getCityId() { return cityId; }
    public int getX() { return x; }
    public int getY() { return y; }
    public int getWidth() { return width; }
    public int getHeight() { return height; }
    public PurchaseType getPurchaseType() { return purchaseType; }
    public Instant getStartsAt() { return startsAt; }
    public Instant getEndsAt() { return endsAt; }
    public AreaStatus getStatus() { return status; }

    public void setStatus(AreaStatus status) { this.status = status; }
}
