package com.dinecity.wall;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Pure rules for the pixel wall: bounds, overlap and price. No Spring or database code, so it is easy to test.
 * Prices are whole paise (1 rupee = 100 paise) to avoid floating point money errors.
 */
public final class WallMath {

    private WallMath() {
    }

    public static long pixels(int width, int height) {
        return (long) width * (long) height;
    }

    /** Returns null when the rectangle is allowed, otherwise a message that is safe to show to the user. */
    public static String validate(int x, int y, int width, int height, int gridWidth, int gridHeight, int minSize) {
        if (x < 0 || y < 0) {
            return "The area must start inside the wall.";
        }
        if (width < minSize || height < minSize) {
            return "The area must be at least " + minSize + " x " + minSize + " pixels.";
        }
        if ((long) x + width > gridWidth || (long) y + height > gridHeight) {
            return "The area goes outside the wall (" + gridWidth + " x " + gridHeight + ").";
        }
        return null;
    }

    /** Two rectangles overlap when they share at least one pixel. Touching edges do not overlap. */
    public static boolean overlaps(int ax, int ay, int aw, int ah, int bx, int by, int bw, int bh) {
        return ax < bx + bw && bx < ax + aw && ay < by + bh && by < ay + ah;
    }

    /** Permanent placement: pixels x price per pixel. */
    public static long permanentPrice(long pixels, long pricePerPixelPaise) {
        return Math.multiplyExact(pixels, pricePerPixelPaise);
    }

    /**
     * Time-limited placement: the permanent price scaled by fractionPer30Days for every 30 days,
     * rounded up to the next paisa so the platform never undercharges.
     */
    public static long timedPrice(long pixels, long pricePerPixelPaise, BigDecimal fractionPer30Days, int days) {
        BigDecimal permanent = BigDecimal.valueOf(permanentPrice(pixels, pricePerPixelPaise));
        return permanent
                .multiply(fractionPer30Days)
                .multiply(BigDecimal.valueOf(days))
                .divide(BigDecimal.valueOf(30), 0, RoundingMode.CEILING)
                .longValueExact();
    }
}
