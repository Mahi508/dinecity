# DineCity

A city-based restaurant discovery platform combined with a one-million-pixel advertising wall (1,000 × 1,000 grid) where cafes, restaurants and pubs buy permanent or time-limited ad space.

Full concept: [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)

## Tech stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Frontend   | Angular (HTML Canvas for the pixel wall)                |
| Backend    | Spring Boot 3, Spring Security, Spring Data JPA, Flyway |
| Database   | PostgreSQL 16                                           |
| Payments   | Razorpay (planned, Stage 4)                             |

## Repository layout

```
dinecity/
├── backend/            Spring Boot REST API
├── frontend/           Angular app
├── docs/               Project overview and design notes
├── docker-compose.yml  Local PostgreSQL
└── .env.example        Environment variable template
```

## Getting started

Prerequisites: Java 21, Maven 3.9+, Node 20+, Docker.

```bash
# 1. Database
cp .env.example .env
docker compose up -d

# 2. Backend (http://localhost:8080)
cd backend
mvn spring-boot:run

# 3. Frontend (http://localhost:4200)
cd frontend
npm install
npm start
```

Check the backend: `curl http://localhost:8080/api/health`

## Roadmap

- [x] Stage 1: Project setup (this scaffold: schema, health endpoint, Angular shell)
- [ ] Stage 2: Authentication and business directory
- [ ] Stage 3: Pixel wall (canvas, selection, zoom, pricing)
- [ ] Stage 4: Orders and payments (reservations, checkout, idempotent webhooks)
- [ ] Stage 5: Advertising management (uploads, admin approval, campaign expiry)
- [ ] Stage 6: Dashboards and analytics
- [ ] Stage 7: Testing and deployment

## Git workflow

- `main` is always deployable; work happens on `feature/<name>` branches and merges via pull request.
- Commit style: `feat:`, `fix:`, `docs:`, `chore:`, `test:`.
- Never commit `.env` or secrets.
