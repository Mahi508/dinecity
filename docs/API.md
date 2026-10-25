# DineCity API (Stage 2)

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

## Security notes

- Passwords are stored as BCrypt hashes. Tokens are HS256 JWTs that expire after 120 minutes (`JWT_TTL_MINUTES`).
- Set `JWT_SECRET` (32+ random characters) outside local development. The built-in default is for development only.
- Roles are checked on the server for every call. The Angular route guards only hide pages.
- Not yet done (later stages): login rate limiting, email verification, password reset, refresh tokens.
