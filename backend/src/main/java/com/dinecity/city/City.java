package com.dinecity.city;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "cities")
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String state;

    @Column(nullable = false)
    private String country = "India";

    @Column(name = "grid_width", nullable = false)
    private int gridWidth = 1000;

    @Column(name = "grid_height", nullable = false)
    private int gridHeight = 1000;

    /** Permanent price of one pixel, in paise. 1000 paise = INR 10. */
    @Column(name = "price_per_pixel_paise", nullable = false)
    private long pricePerPixelPaise = 1000;

    @Column(nullable = false)
    private boolean active = true;

    protected City() {
    }

    public City(String name, String state, String country) {
        this.name = name;
        this.state = state;
        if (country != null && !country.isBlank()) {
            this.country = country;
        }
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getState() { return state; }
    public String getCountry() { return country; }
    public int getGridWidth() { return gridWidth; }
    public int getGridHeight() { return gridHeight; }
    public long getPricePerPixelPaise() { return pricePerPixelPaise; }
    public boolean isActive() { return active; }
}
