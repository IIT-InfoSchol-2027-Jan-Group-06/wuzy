# Wuzy Backend - Quick Start

## Prerequisites
- Docker & Docker Compose installed

## Run the Project

```bash
cd /home/abhiruk/Desktop/wuzy/wuzy/backend
docker-compose up --build
```

Wait for:
1. `db` container: "database system is ready to accept connections"
2. `api` container: "Uvicorn running on http://0.0.0.0:8000"

## Verify It Works

### Health Check
```bash
curl http://localhost:8000/health
# {"status": "ok"}
```

### API Docs (Swagger UI)
Open: http://localhost:8000/docs

### Test Endpoints

```bash
# List users (seeded data)
curl http://localhost:8000/users/

# Get specific user
curl http://localhost:8000/users/1

# Create new user
curl -X POST http://localhost:8000/users/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","hashed_password":"hash","is_active":true}'
```

## Demo Credentials
- alice / password123
- bob / password123

## Useful Commands

```bash
# Stop containers
docker-compose down

# Stop + remove volumes (full reset)
docker-compose down -v

# View logs
docker-compose logs -f api
docker-compose logs -f db

# Create new migration (after changing models)
docker-compose exec api alembic revision --autogenerate -m "description"

# Run migrations manually
docker-compose exec api alembic upgrade head

# Run seed manually (tables must exist - run migration first)
docker-compose exec api python seed.py

# Access DB directly
docker-compose exec db psql -U postgres -d wuzy
```

## Project Structure
```
backend/
├── app/
│   ├── api/v1/users.py      # REST endpoints
│   ├── core/config.py       # Settings (.env)
│   ├── db/session.py        # DB engine + session
│   ├── models/              # SQLModel models
│   └── main.py              # FastAPI app
├── alembic/                 # Migrations
├── seed.py                  # Demo data
├── docker-compose.yml       # API + Postgres
├── Dockerfile
└── requirements.txt
```

## Notes
- DB data resets on `docker-compose down -v` (no persistent volume)
- Hot reload enabled - code changes auto-restart server
- Migrations run automatically on startup via `alembic upgrade head`