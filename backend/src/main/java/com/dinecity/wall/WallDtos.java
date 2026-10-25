package com.dinecity.wall;

import com.dinecity.business.BusinessCategory;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;

public final class WallDtos {

    private WallDtos() {
    }

    /**
     * A rectangle the visitor is looking at. Limits here only stop absurd numbers;
     * the real rules (inside the wall, minimum size) are enforced by WallService.
     */
    public record QuoteRequest(
            @NotNull @Min(-100000) @Max(100000) Integer x,
            @NotNull @Min(-100000) @Max(100000) Integer y,
            @NotNull @Min(0) @Max(100000) Integer width,
            @NotNull @Min(0) @Max(100000) Integer height,
            @NotNull PurchaseType purchaseType,
            @Min(1) @Max(365) Integer days) {
    }

    public record QuoteResponse(
            boolean available,
            long pixels,
            long totalPaise,
            String message) {
    }

    /** One taken rectangle. businessId/businessName are only filled for approved businesses. */
    public record AreaView(
            Long id,
            int x,
            int y,
            int width,
            int height,
            PurchaseType purchaseType,
            AreaStatus status,
            Instant endsAt,
            Long businessId,
            String businessName,
            BusinessCategory category,
            String logoUrl) {
    }

    public record WallResponse(
            Long cityId,
            String cityName,
            int gridWidth,
            int gridHeight,
            long pricePerPixelPaise,
            int minSize,
            List<AreaView> areas) {
    }

    public record GrantRequest(
            @NotNull Long businessId,
            @NotNull @Min(0) @Max(100000) Integer x,
            @NotNull @Min(0) @Max(100000) Integer y,
            @NotNull @Min(0) @Max(100000) Integer width,
            @NotNull @Min(0) @Max(100000) Integer height,
            @NotNull PurchaseType purchaseType,
            @Min(1) @Max(365) Integer days) {
    }
}
