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
