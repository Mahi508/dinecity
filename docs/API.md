# DineCity API (Stages 2-3)

Base URL in development: `http://localhost:8080`. The Angular dev server forwards `/api/*` here.
Protected calls need the header `Authorization: Bearer <token>` (the token comes from login/register).
Errors are returned as JSON with a `message` field.

## Roles

| Role | How you get it | Can do |
|------|----------------|--------|
| CUSTOMER | Register | Browse the directory |
| OWNER | Register | Create and edit their own businesses |
| ADMIN | Created at startup from `DINECITY_ADMIN_EMAIL` / `DINECITY_ADMIN_PASSWORD` | Add cities, approve/reject/suspend businesses |

## Auth

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| POST | `/api/auth/register` | public | Body: `email`, `password` (8-72 chars), `fullName`, `role` (`CUSTOMER` or `OWNER`). Returns `{token, user}` |
| POST | `/api/auth/login` | public | Body: `email`, `password`. Returns `{token, user}`. Wrong credentials: 401 |
| GET | `/api/auth/me` | any logged-in user | Current user |

## Directory (public, read-only)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/cities` | Active cities |
| GET | `/api/businesses` | Query: `cityId`, `category` (`CAFE`/`RESTAURANT`/`PUB`), `q` (name, cuisine or address), `cuisine`, `page` (from 0), `size` (max 50). Only APPROVED businesses |
| GET | `/api/businesses/{id}` | APPROVED businesses are public. Others: only the owner or an admin, otherwise 404 |

## Owner (role OWNER)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/owner/businesses` | Your businesses, any status |
| POST | `/api/businesses` | Create. Status is APPROVED immediately when `DINECITY_AUTO_APPROVE=true` (default in development), otherwise PENDING |
| PUT | `/api/businesses/{id}` | Edit your own business. Someone else's business returns 404 |

Business body: `cityId`, `name`, `category`, `address` are required. Optional: `cuisine`, `description`, `latitude`, `longitude`, `phone`, `websiteUrl` and `logoUrl` (must start with http:// or https://), `socialLinks` (map, e.g. `{"instagram": "https://..."}`), `openingHours` (map, the web app uses `{"text": "Mon-Sun 9am-11pm"}`).

## Admin (role ADMIN)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/admin/cities` | Body: `name`, `state`, `country` |
| GET | `/api/admin/businesses?status=PENDING` | List by status |
| PUT | `/api/admin/businesses/{id}/status` | Body: `{"status": "APPROVED"}` (also `REJECTED`, `SUSPENDED`, `PENDING`) |

## Pixel wall (Stage 3)

The wall is a grid of 1,000 x 1,000 pixels per city. A rectangle is described by `x`, `y` (top-left corner, 0-based) and `width`, `height`. Rectangles that only touch along an edge do not overlap.

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/api/cities/{cityId}/wall` | public | Grid size, price per pixel (paise), minimum side length, and every area currently taken. Business name and id appear only for approved businesses |
| POST | `/api/cities/{cityId}/wall/quote` | public | Body: `x`, `y`, `width`, `height`, `purchaseType` (`PERMANENT` or `TIMED`), `days` (1-365, needed for `TIMED`). Returns `{available, pixels, totalPaise, message}` |
| POST | `/api/admin/wall/grants` | ADMIN | Gives an approved business a free placement: `businessId`, rectangle, `purchaseType`, `days`. 409 if any part is taken |
| DELETE | `/api/admin/wall/areas/{areaId}` | ADMIN | Releases a placement so the space is free again |

Pricing (the server is the only authority; the browser only previews it):
- Permanent = pixels x price per pixel. With the default 1000 paise (INR 10), a 20 x 20 area costs INR 4,000.
- Time-limited = permanent price x `timed-fraction-per-30-days` (default 0.10) x days / 30, rounded up to the next paisa. This rule is a placeholder, change it with `DINECITY_WALL_TIMED_FRACTION`.
- Minimum side length is 10 pixels (`DINECITY_WALL_MIN_SIZE`).
- Price per pixel is stored per city in `cities.price_per_pixel_paise`.

Overlaps are prevented twice: the availability check in `WallService`, and a PostgreSQL exclusion constraint on `order_areas` that makes overlapping held or confirmed rectangles impossible even if two requests arrive at the same moment.

## Security notes

- Passwords are stored as BCrypt hashes. Tokens are HS256 JWTs that expire after 120 minutes (`JWT_TTL_MINUTES`).
- Set `JWT_SECRET` (32+ random characters) outside local development. The built-in default is for development only.
- Roles are checked on the server for every call. The Angular route guards only hide pages.
- Not yet done (later stages): payments and online purchase (Stage 4), image upload (Stage 5), login rate limiting, email verification, password reset, refresh tokens.
