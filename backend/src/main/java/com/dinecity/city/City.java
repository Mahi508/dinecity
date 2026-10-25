package com.dinecity.city;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Grid size and pricing columns exist in the table but are used from Stage 3 on. */
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
    public boolean isActive() { return active; }
}
