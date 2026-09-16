# AGENTS.md

Wuzy: a social app. Expo (SDK 57) + React Native in `frontend/`. FastAPI backend in `backend/`, still early, work in progress.

## Stack

Expo ~57, expo-router ~57, React 19.2, React Native 0.86, TypeScript, NativeWind 4 (Tailwind 3.4), Reanimated 4. Fonts: Bebas Neue and Poppins via `@expo-google-fonts`.

Expo HAS CHANGED. Read the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing Expo code. Do not trust training-data Expo patterns.

## Commands
add
Run from `frontend/`:

```
npm install
npx expo start        # dev server
npx expo start --android
npm run lint
# release APK, debug-signed, talks to the backend at EXPO_PUBLIC_API_URL
EXPO_PUBLIC_API_URL=http://<lan-ip>:8000 sh -c 'npx expo prebuild --platform android --no-install && cd android && ./gradlew assembleRelease'
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
# after adding a migration, re-apply it: `docker compose restart api` re-runs
# `alembic upgrade head` at startup; uvicorn --reload only swaps code, never DB
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
- **Post**: id, media_url, caption, save_to_profile (bool, indexed), user_id (FK), created_at. `save_to_profile=False` = ephemeral (disappears after the viewing app session ends), `True` = permanent (stays on profile grid).
- **PostView**: id, user_id (FK), post_id (FK), session_id, viewed_at. Logs views keyed by the app session that recorded them. Pure tracking table, no relationships.

### API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Health check |
| `POST` | `/users/` | No | Create user |
| `GET` | `/users/` | No | List all users |
| `GET` | `/users/{id}` | No | Get user by ID |
| `GET` | `/users/by-username/{username}` | No | Resolve a user by username (from a scanned QR) |
| `POST` | `/users/{id}/connect` | Yes | Connect with a user: mutual follow, idempotent (increments the Connections count) |
| `GET` | `/users/{id}/connections` | No | A user's Connections (mutual follows), used to filter the refer list |
| `POST` | `/posts/` | Yes | Create post (X-User-Id header) |
| `POST` | `/posts/{id}/pin-to-profile` | Yes | Promote ephemeral to permanent (author only) |
| `POST` | `/posts/{id}/like` | Yes | Toggle my like; notifies the author on like |
| `GET` | `/notifications` | Yes | My notification rows, newest first |
| `POST` | `/notifications/read` | Yes | Mark all my notifications read (204) |
| `GET` | `/feed/discover` | Yes | Ephemeral posts alive for this session (X-Session-Id) + all permanent posts |
| `POST` | `/feed/{id}/view` | Yes | Record a view tagged with X-Session-Id (idempotent 204) |
| `GET` | `/feed/profile/{user_id}` | No | Permanent posts for a user's profile |
| `PATCH` | `/users/me` | Yes | Edit profile; a full profile completes the Complete Profile quest |
| `GET` | `/quests/` | Yes | Quest dashboard: xp and rank, badge deck, every quest with tiers |
| `GET` | `/quests/user/{id}` | No | Any user's quest dashboard (profiles) |
| `POST` | `/quests/{key}/claim` | Yes | Claim the active tier; XP per tier, badge on the last |
| `POST` | `/quests/daily-login` | Yes | Count today toward the streak (server dedupes by date) |
| `POST` | `/tickets/purchase` | Yes | Buy 1..10 tickets, optionally for an event |
| `POST` | `/tickets/{id}/share` | Yes | Count a share of your own ticket (204) |
| `POST` | `/tickets/gift` | Yes | Gift a ticket to a connection; they get a notification |
| `GET` | `/tickets/` | Yes | My tickets with their event slice |
| `GET` | `/awards/` | Yes | My XP ledger rows; rows with badge_id are profile stickers |
| `GET` | `/awards/user/{id}` | No | Any user's awards |

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
- Follow `frontend/DESIGN.md` strictly. It defines the design tokens (`constants/wuzy-theme.ts`: colors, type ratios, layout) and the shared shell: `Screen`, `ScreenHeader`, `GlassNavButton`, `Fab`, `Chip`, `CategoryFilter`, `TagSection`, `SearchBar`. Use those components, never rebuild lookalikes.
- UI consistency is a hard requirement: same gaps and spacing tokens, same font faces (Bebas Neue for display/titles, Poppins for everything else), same font-size ratios, same colors. If a value is not in DESIGN.md, match the nearest existing screen instead of inventing one.
- Font sizes scale with screen width (`screenWidth * ratio`). Never hardcode pixel font sizes for text that DESIGN.md defines by ratio.
- New reusable UI pattern? Document it in `frontend/DESIGN.md` in the same change.
- A page must be a page: every screen is a route file in `app/`, never a component in `components/`. The route file owns layout and state; its visual pieces are reusable components in `components/`, and its static data lives in `constants/`. See `app/notifications.tsx` for the reference pattern. Pushed full-screen routes live at the root of `app/`; only tab roots live in `app/(tabs)/`.

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
