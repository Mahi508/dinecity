package com.dinecity.wall;

public enum AreaStatus {
    /** Temporarily held during checkout (Stage 4). */
    HELD,
    /** Paid or granted: the area is taken. */
    CONFIRMED,
    RELEASED,
    EXPIRED
}
