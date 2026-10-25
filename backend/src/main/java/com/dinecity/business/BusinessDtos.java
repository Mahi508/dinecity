package com.dinecity.business;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;

public final class BusinessDtos {

    private BusinessDtos() {
    }

    /** Only http(s) links are accepted, so a "javascript:" link can never be stored and rendered. */
    private static final String HTTP_URL = "^https?://\\S+$";

    public record BusinessRequest(
            @NotNull Long cityId,
            @NotBlank @Size(max = 200) String name,
            @NotNull BusinessCategory category,
            @Size(max = 100) String cuisine,
            @Size(max = 5000) String description,
            @NotBlank @Size(max = 300) String address,
            @DecimalMin("-90") @DecimalMax("90") BigDecimal latitude,
            @DecimalMin("-180") @DecimalMax("180") BigDecimal longitude,
            @Size(max = 30) String phone,
            @Size(max = 300) @Pattern(regexp = HTTP_URL, message = "must start with http:// or https://") String websiteUrl,
            Map<@Size(max = 40) String, @Size(max = 300) String> socialLinks,
            Map<@Size(max = 40) String, @Size(max = 300) String> openingHours,
            @Size(max = 500) @Pattern(regexp = HTTP_URL, message = "must start with http:// or https://") String logoUrl) {
    }

    public record BusinessResponse(
            Long id,
            Long cityId,
            String cityName,
            Long ownerId,
            String name,
            BusinessCategory category,
            String cuisine,
            String description,
            String address,
            BigDecimal latitude,
            BigDecimal longitude,
            String phone,
            String websiteUrl,
            Map<String, String> socialLinks,
            Map<String, String> openingHours,
            String logoUrl,
            BusinessStatus status) {

        public static BusinessResponse from(Business b) {
            return new BusinessResponse(
                    b.getId(),
                    b.getCity().getId(),
                    b.getCity().getName(),
                    b.getOwnerId(),
                    b.getName(),
                    b.getCategory(),
                    b.getCuisine(),
                    b.getDescription(),
                    b.getAddress(),
                    b.getLatitude(),
                    b.getLongitude(),
                    b.getPhone(),
                    b.getWebsiteUrl(),
                    b.getSocialLinks(),
                    b.getOpeningHours(),
                    b.getLogoUrl(),
                    b.getStatus());
        }
    }

    public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {
        public static <T> PageResponse<T> from(Page<T> p) {
            return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
        }
    }

    public record StatusRequest(@NotNull BusinessStatus status) {
    }
}
