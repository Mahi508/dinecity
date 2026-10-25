package com.dinecity.business;

import com.dinecity.city.City;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "businesses")
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false, updatable = false)
    private Long ownerId;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BusinessCategory category;

    private String cuisine;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false)
    private String address;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String phone;

    @Column(name = "website_url")
    private String websiteUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "social_links", nullable = false, columnDefinition = "jsonb")
    private Map<String, String> socialLinks = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "opening_hours", nullable = false, columnDefinition = "jsonb")
    private Map<String, String> openingHours = new HashMap<>();

    @Column(name = "logo_url")
    private String logoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BusinessStatus status = BusinessStatus.PENDING;

    protected Business() {
    }

    public Business(Long ownerId) {
        this.ownerId = ownerId;
    }

    public Long getId() { return id; }
    public Long getOwnerId() { return ownerId; }
    public City getCity() { return city; }
    public String getName() { return name; }
    public BusinessCategory getCategory() { return category; }
    public String getCuisine() { return cuisine; }
    public String getDescription() { return description; }
    public String getAddress() { return address; }
    public BigDecimal getLatitude() { return latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public String getPhone() { return phone; }
    public String getWebsiteUrl() { return websiteUrl; }
    public Map<String, String> getSocialLinks() { return socialLinks; }
    public Map<String, String> getOpeningHours() { return openingHours; }
    public String getLogoUrl() { return logoUrl; }
    public BusinessStatus getStatus() { return status; }

    public void setCity(City city) { this.city = city; }
    public void setName(String name) { this.name = name; }
    public void setCategory(BusinessCategory category) { this.category = category; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }
    public void setDescription(String description) { this.description = description; }
    public void setAddress(String address) { this.address = address; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }
    public void setSocialLinks(Map<String, String> socialLinks) { this.socialLinks = socialLinks; }
    public void setOpeningHours(Map<String, String> openingHours) { this.openingHours = openingHours; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public void setStatus(BusinessStatus status) { this.status = status; }
}
