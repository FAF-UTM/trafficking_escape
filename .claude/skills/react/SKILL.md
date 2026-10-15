---
name: react
description: Conventions for the React/TypeScript frontend in client/ (Vite, MUI, react-router, i18next, CSS modules). Use when creating or editing components, pages, mini-games, contexts, translations or styles under client/.
---

# React frontend (client/)

## Stack
- React 18 + TypeScript 5.6, Vite 7 (`@vitejs/plugin-react-swc`), Yarn 1 (`yarn`, never npm).
- UI: MUI v6 (`@mui/material`, `@mui/icons-material`, Emotion). Theme in `client/src/theme/theme.ts`.
- Routing: `react-router-dom` v7. Auth state in `client/src/context/AuthContext.tsx` (asks `GET /api/v1/auth/session`).
- i18n: `react-i18next`; strings in `client/src/lang/en.json` and `nl.json`.
- Deploy: Cloudflare Pages via `wrangler` (`yarn deploy`).

## Layout
- `src/pages/<name>/` – routed pages (`Admin.tsx` + `admin.module.css` pattern).
- `src/game/<snake_case_game>/` – mini-games, usually with a `*Wrapper.tsx` that fetches data from the backend.
- `src/components/` – shared UI (character, sounds, notification).
- `src/context/` – React contexts (Auth, Audio).
- `src/chat/` – chat + minigame orchestration.

## Rules
- Function components + hooks only; type props with an explicit `interface`/`type`.
- Call the backend only through `api()` / `sendBeaconJson()` in `src/lib/api.ts` (relative `/api/...` paths; Vite proxies to :8080 in dev, `VITE_BACKEND` only for a same-site API origin).
- Auth is an **HttpOnly session cookie** set by the backend. Never store, decode or send tokens from JS, never use `localStorage` for anything auth-related, never add `Authorization` headers.
- `api()` sends `credentials: 'include'` and the in-memory CSRF token (`X-XSRF-TOKEN`) on non-GET requests, retries once on a CSRF 403, and fires `auth:expired` on 401.
- Sign-out must `await` the logout request before navigating (navigation cancels the request and the cookie would survive).
- Every user-visible string goes through `t('key')` from `useTranslation()`. Add the key to **both** `en.json` and `nl.json`.
- Styling: follow the surrounding file — CSS modules (`*.module.css`) or MUI `sx`/theme. Don't introduce new styling libraries.
- Keep effects clean: abort fetches / clear timers in `useEffect` cleanup; complete dependency arrays (eslint `react-hooks` is enabled).
- Assets live in `client/public/` (`images`, `fonts`, `json`) and are referenced by absolute path (`/images/...`).

## Verify before finishing
```bash
cd client
yarn lint
yarn check-format   # or `yarn format` to fix
yarn build          # runs tsc -b, catches type errors
```
Run `yarn dev` to check UI changes in the browser when the change is visual.
