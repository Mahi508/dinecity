package com.dinecity.wall;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class WallMathTest {

    @Test
    void permanentPriceMatchesTheExampleInTheProjectOverview() {
        // 20 x 20 = 400 pixels at INR 10 (1000 paise) = INR 4,000 = 400,000 paise
        assertEquals(400_000L, WallMath.permanentPrice(WallMath.pixels(20, 20), 1000));
    }

    @Test
    void timedPriceScalesWithDaysAndRoundsUp() {
        long pixels = WallMath.pixels(20, 20);
        // 10% of the permanent price per 30 days: 40,000 paise for 30 days
        assertEquals(40_000L, WallMath.timedPrice(pixels, 1000, new BigDecimal("0.10"), 30));
        // 7 days: 40,000 * 7 / 30 = 9,333.33 -> rounded up to 9,334
        assertEquals(9_334L, WallMath.timedPrice(pixels, 1000, new BigDecimal("0.10"), 7));
    }

    @Test
    void validateAcceptsAreasInsideTheGrid() {
        assertNull(WallMath.validate(0, 0, 10, 10, 1000, 1000, 10));
        assertNull(WallMath.validate(990, 990, 10, 10, 1000, 1000, 10));
    }

    @Test
    void validateRejectsOutOfBoundsAndTooSmallAreas() {
        assertNotNull(WallMath.validate(-1, 0, 10, 10, 1000, 1000, 10));
        assertNotNull(WallMath.validate(995, 0, 10, 10, 1000, 1000, 10));
        assertNotNull(WallMath.validate(0, 0, 9, 20, 1000, 1000, 10));
        assertNotNull(WallMath.validate(Integer.MAX_VALUE, 0, 10, 10, 1000, 1000, 10));
    }

    @Test
    void overlapDetectsSharedPixelsButNotTouchingEdges() {
        assertTrue(WallMath.overlaps(10, 10, 20, 20, 25, 25, 10, 10));
        assertTrue(WallMath.overlaps(10, 10, 20, 20, 10, 10, 20, 20));
        assertFalse(WallMath.overlaps(10, 10, 20, 20, 30, 10, 10, 10));
        assertFalse(WallMath.overlaps(10, 10, 20, 20, 10, 30, 10, 10));
        assertFalse(WallMath.overlaps(0, 0, 10, 10, 500, 500, 10, 10));
    }
}
