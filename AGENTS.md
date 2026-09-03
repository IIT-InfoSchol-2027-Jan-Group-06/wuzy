# AGENTS.md

Wuzy: a social app. Expo (SDK 54) + React Native in `frontend/`. FastAPI backend in `backend/`, still early, work in progress.

## Stack

Expo ~54, expo-router ~6, React 19.1, React Native 0.81, TypeScript, NativeWind 4 (Tailwind 3.4), Reanimated 4. Fonts: Bebas Neue and Poppins via `@expo-google-fonts`.

Expo HAS CHANGED. Read the versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing Expo code. Do not trust training-data Expo patterns.

## Commands

Run from `frontend/`:

```
npm install
npx expo start        # dev server
npx expo start --android
npm run lint
```

No test suite exists. Do not add one unless asked.

## Backend

FastAPI + SQLModel + PostgreSQL. Sync only (no async). Python 3.11.

### Commands

Run from `backend/`:

```
docker compose up --build    # starts api + postgres, runs migrations + seed
docker compose down -v       # tear down (no volume persists)
alembic upgrade head         # apply migrations manually
alembic revision --autogenerate -m "msg"  # new migration
```

### Structure

```
backend/
├── docker-compose.yml      # api + db (postgres:16-alpine)
├── Dockerfile              # python:3.11-slim, uvicorn dev server
├── seed.py                 # idempotent demo data seeder (runs at startup)
├── alembic/                # migrations (single initial migration so far)
├── app/
│   ├── main.py             # FastAPI app, lifespan, router mounts
│   ├── api/v1/
│   │   ├── users.py        # /users CRUD
│   │   ├── posts.py        # /posts create + pin-to-profile
│   │   └── feed.py         # /feed discover, view recording, profile feed
│   ├── core/
│   │   ├── config.py       # pydantic-settings, loads .env
│   │   └── auth.py         # X-User-Id header dependency
│   ├── db/
│   │   └── session.py      # SQLAlchemy engine, Session dependency, init_db()
│   ├── models/
│   │   ├── user.py         # User SQLModel table
│   │   ├── post.py         # Post SQLModel table (save_to_profile = ephemeral vs permanent)
│   │   └── post_view.py    # PostView tracking table
│   └── schemas/
│       └── post.py         # PostCreate, PostRead request/response schemas
```

### Models

- **User**: id, email (unique), username (unique), hashed_password, is_active, created_at. Has `posts` relationship.
- **Post**: id, media_url, caption, save_to_profile (bool, indexed), user_id (FK), created_at. `save_to_profile=False` = ephemeral (disappears after viewed), `True` = permanent (stays on profile grid).
- **PostView**: id, user_id (FK), post_id (FK), viewed_at. Pure tracking table, no relationships.

### API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Health check |
| `POST` | `/users/` | No | Create user |
| `GET` | `/users/` | No | List all users |
| `GET` | `/users/{id}` | No | Get user by ID |
| `POST` | `/posts/` | Yes | Create post (X-User-Id header) |
| `POST` | `/posts/{id}/pin-to-profile` | Yes | Promote ephemeral to permanent (author only) |
| `GET` | `/feed/discover` | Yes | Ephemeral unseen + all permanent posts |
| `POST` | `/feed/{id}/view` | Yes | Record a view (idempotent 204) |
| `GET` | `/feed/profile/{user_id}` | No | Permanent posts for a user's profile |

### Conventions

- All endpoints are sync `def`, not `async def`.
- Auth is a simple `X-User-Id` header (no JWT yet, despite config placeholders).
- Pydantic schemas live in `app/schemas/`, one file per domain.
- Business logic lives directly in routers (no service layer yet).
- `seed.py` is idempotent: skips if any users exist. Creates demo users (alice, bob) and sample posts.
- Migrations via Alembic. Docker startup runs `alembic upgrade head` then `seed.py`.
- Config via `.env` loaded by pydantic-settings. See `.env.example` for variables.
- Ruff linter: Python 3.11 target, 100 char line, rules E/F/I/UP/W.

## Philosophy: lazy first (YAGNI)

Write the least code that solves the actual problem. In order:

1. Does it need to exist at all? Speculative need means skip it and say so.
2. Reuse what is already in this repo. Check `components/`, `hooks/`, `constants/` before writing anything new. Re-implementing a helper that lives three files away is the most common failure.
3. Platform or stdlib feature covers it? Use it. NativeWind class over StyleSheet, existing Expo module over a new dependency.
4. Only then write new code, and the minimum of it.

- NEVER add a dependency for something a few lines can do.
- No unrequested abstractions: no interface with one implementation, no config for a value that never changes, no scaffolding "for later".
- Bug fix means root cause. Grep every caller before patching one path.
- Deletion beats addition. Boring beats clever.

## Frontend / UI

- ALWAYS load the frontend design skills before any frontend/UI work, when available.
- Follow `frontend/DESIGN.md` strictly. It defines the design tokens (colors, typography ratios, spacing) and the shared components: `GlassNavButton`, `CategoryFilter`, `TagSection`. Use those components, never rebuild lookalikes.
- UI consistency is a hard requirement: same gaps and spacing tokens, same font faces (Bebas Neue for display/titles, Poppins for everything else), same font-size ratios, same colors. If a value is not in DESIGN.md, match the nearest existing screen instead of inventing one.
- Font sizes scale with screen width (`screenWidth * ratio`). Never hardcode pixel font sizes for text that DESIGN.md defines by ratio.
- New reusable UI pattern? Document it in `frontend/DESIGN.md` in the same change.
- A page must be a page: every screen is a route file in `app/`, never a component in `components/`. The route file owns layout and state; its visual pieces are reusable components in `components/`, and its static data lives in `constants/`. See `app/(tabs)/home/notifications.tsx` for the reference pattern.

## Comments

- Comments are humane: short, plain sentences, only where the code cannot say it.
- No long comment blocks. No ASCII banners or divider comments (`====`, `----`).
- No em-dashes anywhere: not in comments, not in strings, not in docs.

## Git

- Commit messages: short, meaningful, and single-line.
- 1 feature, 1 commit. Commit immediately once a feature is complete.
- Working on a new feature while on `main`? Always branch off `main` first before starting work.
- Fix a bug in the previous commit? Always `git commit --amend --no-edit` instead of creating a fixup commit.
- Use `git rebase` instead of merge when syncing branches.
- NEVER add `Co-authored-by` or any AI and tool trailers to commits.
