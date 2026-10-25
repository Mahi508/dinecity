-- DineCity initial schema (Stage 1)
-- Needed so the exclusion constraint can combine box overlap with time-range overlap.
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE cities (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    state       VARCHAR(100),
    country     VARCHAR(100) NOT NULL DEFAULT 'India',
    grid_width  INT NOT NULL DEFAULT 1000 CHECK (grid_width > 0),
    grid_height INT NOT NULL DEFAULT 1000 CHECK (grid_height > 0),
    price_per_pixel_paise BIGINT NOT NULL DEFAULT 1000 CHECK (price_per_pixel_paise >= 0), -- 1000 paise = INR 10
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (name, state)
);

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(150) NOT NULL,
    role          VARCHAR(20) NOT NULL CHECK (role IN ('CUSTOMER', 'OWNER', 'ADMIN')),
    enabled       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE businesses (
    id            BIGSERIAL PRIMARY KEY,
    owner_id      BIGINT NOT NULL REFERENCES users(id),
    city_id       BIGINT NOT NULL REFERENCES cities(id),
    name          VARCHAR(200) NOT NULL,
    category      VARCHAR(20) NOT NULL CHECK (category IN ('CAFE', 'RESTAURANT', 'PUB')),
    cuisine       VARCHAR(100),
    description   TEXT,
    address       VARCHAR(300) NOT NULL,
    latitude      NUMERIC(9, 6),
    longitude     NUMERIC(9, 6),
    phone         VARCHAR(30),
    website_url   VARCHAR(300),
    social_links  JSONB NOT NULL DEFAULT '{}'::jsonb,
    opening_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
    logo_url      VARCHAR(500),
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_businesses_city_category ON businesses (city_id, category) WHERE status = 'APPROVED';
CREATE INDEX idx_businesses_owner ON businesses (owner_id);

CREATE TABLE business_photos (
    id          BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    url         VARCHAR(500) NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE offers (
    id          BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    valid_from  DATE,
    valid_to    DATE
);

-- One purchase transaction. An order may contain one or more areas.
CREATE TABLE pixel_orders (
    id           BIGSERIAL PRIMARY KEY,
    business_id  BIGINT NOT NULL REFERENCES businesses(id),
    city_id      BIGINT NOT NULL REFERENCES cities(id),
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT'
                 CHECK (status IN ('PENDING_PAYMENT', 'PAID', 'CANCELLED', 'EXPIRED', 'REFUNDED')),
    total_paise  BIGINT NOT NULL CHECK (total_paise >= 0),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at      TIMESTAMPTZ
);
CREATE INDEX idx_pixel_orders_business ON pixel_orders (business_id);

-- Each rectangular area. ends_at NULL = permanent placement.
-- The exclusion constraint makes overlapping HELD/CONFIRMED areas in the same city
-- with overlapping time ranges impossible, even under concurrent purchases.
CREATE TABLE order_areas (
    id            BIGSERIAL PRIMARY KEY,
    order_id      BIGINT NOT NULL REFERENCES pixel_orders(id) ON DELETE CASCADE,
    city_id       BIGINT NOT NULL REFERENCES cities(id),
    x             INT NOT NULL CHECK (x >= 0),
    y             INT NOT NULL CHECK (y >= 0),
    width         INT NOT NULL CHECK (width > 0),
    height        INT NOT NULL CHECK (height > 0),
    purchase_type VARCHAR(20) NOT NULL CHECK (purchase_type IN ('PERMANENT', 'TIMED')),
    starts_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at       TIMESTAMPTZ,
    status        VARCHAR(20) NOT NULL DEFAULT 'HELD' CHECK (status IN ('HELD', 'CONFIRMED', 'RELEASED', 'EXPIRED')),
    CHECK (x + width <= 1000 AND y + height <= 1000),
    CHECK ((purchase_type = 'PERMANENT' AND ends_at IS NULL)
        OR (purchase_type = 'TIMED' AND ends_at IS NOT NULL AND ends_at > starts_at)),
    EXCLUDE USING gist (
        city_id WITH =,
        box(point(x, y), point(x + width - 1, y + height - 1)) WITH &&,
        tstzrange(starts_at, ends_at, '[)') WITH &&
    ) WHERE (status IN ('HELD', 'CONFIRMED'))
);
CREATE INDEX idx_order_areas_order ON order_areas (order_id);

-- Tracks the checkout hold window. A scheduled job releases expired holds
-- (sets order_areas.status = 'EXPIRED' and the order to 'EXPIRED').
CREATE TABLE pixel_reservations (
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT NOT NULL UNIQUE REFERENCES pixel_orders(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pixel_reservations_expiry ON pixel_reservations (expires_at);

CREATE TABLE payments (
    id                BIGSERIAL PRIMARY KEY,
    order_id          BIGINT NOT NULL REFERENCES pixel_orders(id),
    provider          VARCHAR(30) NOT NULL DEFAULT 'RAZORPAY',
    provider_order_id VARCHAR(100),
    provider_payment_id VARCHAR(100) UNIQUE,       -- UNIQUE makes webhook processing idempotent
    amount_paise      BIGINT NOT NULL CHECK (amount_paise >= 0),
    status            VARCHAR(20) NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'SUCCEEDED', 'FAILED', 'REFUNDED')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_order ON payments (order_id);

-- Records processed webhook events so replays are ignored.
CREATE TABLE payment_events (
    event_id    VARCHAR(100) PRIMARY KEY,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE advertisements (
    id             BIGSERIAL PRIMARY KEY,
    business_id    BIGINT NOT NULL REFERENCES businesses(id),
    image_url      VARCHAR(500) NOT NULL,
    headline       VARCHAR(150),
    destination_business_id BIGINT NOT NULL REFERENCES businesses(id),
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    rejection_reason VARCHAR(300),
    reviewed_by    BIGINT REFERENCES users(id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Links a purchased area to the advertisement displayed in it.
CREATE TABLE ad_placements (
    id         BIGSERIAL PRIMARY KEY,
    area_id    BIGINT NOT NULL UNIQUE REFERENCES order_areas(id) ON DELETE CASCADE,
    ad_id      BIGINT NOT NULL REFERENCES advertisements(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ad_events (
    id         BIGSERIAL PRIMARY KEY,
    ad_id      BIGINT NOT NULL REFERENCES advertisements(id) ON DELETE CASCADE,
    event_type VARCHAR(10) NOT NULL CHECK (event_type IN ('IMPRESSION', 'CLICK')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ad_events_ad_time ON ad_events (ad_id, created_at);
