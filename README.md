# DevLog — Monorepo

A team developer journal where engineers log their daily work, blockers, and learnings.

## Repository structure

```
DevLog/
├── backend/      NestJS API (TypeScript, MongoDB, JWT, WebSockets)
├── frontend/     React + Vite SPA (TypeScript, Redux, Socket.io)
└── README.md
```

---

## Backend (NestJS)

### Quick start

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET etc.
npm run start:dev
```

| URL | Description |
|-----|-------------|
| `http://localhost:5001/api` | REST base URL |
| `http://localhost:5001/api/docs` | Swagger / OpenAPI UI |

### Module overview

| Module | Path | Responsibility |
|--------|------|----------------|
| `UsersModule` | `src/modules/users` | User persistence (CRUD abstraction) |
| `AuthModule` | `src/modules/auth` | JWT register / login, Passport strategy |
| `EntriesModule` | `src/modules/entries` | Daily log entries CRUD |
| `ProfileModule` | `src/modules/profile` | Read/update own profile |
| `AnalyticsModule` | `src/modules/analytics` | Stats & team overview |
| `ChatModule` | `src/modules/chat` | Socket.io chat + WebRTC signalling |

### Architecture — SOLID principles

- **Single Responsibility** — every service owns exactly one domain; controllers contain zero business logic
- **Open/Closed** — `UpdateEntryDto` extends `CreateEntryDto` via `PartialType`; `UserRole` enum lets you add roles without touching guards
- **Liskov Substitution** — `JwtStrategy` safely extends `PassportStrategy` without altering the contract
- **Interface Segregation** — `JwtPayload` interface is minimal; each module only imports what it needs
- **Dependency Inversion** — services depend on injected abstractions, not on Mongoose models directly

### Other backend features

- **Swagger UI** — full OpenAPI docs at `/api/docs`
- **Global `ValidationPipe`** — all DTOs validated, unknown properties stripped automatically
- **Global `HttpExceptionFilter`** — every error returns `{ statusCode, timestamp, path, message }`
- **Enums** — `UserRole`, `SortOrder` shared across modules without magic strings

### Required environment variables

| Variable | Example |
|----------|---------|
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | random 32-char string |
| `JWT_EXPIRY` | `3600s` |
| `PORT` | `5001` |
| `CORS_ORIGINS` | `http://localhost:5173,https://yourapp.netlify.app` |

---

## Frontend (React + Vite)

### Quick start

```bash
cd frontend
npm install
cp .env.example .env   # fill in VITE_API_BASE_URL, VITE_SOCKET_URL
npm run dev
```

### Required environment variables

| Variable | Example |
|----------|---------|
| `VITE_API_BASE_URL` | `http://localhost:5001/api` |
| `VITE_SOCKET_URL` | `http://localhost:5001` |

---

## Running both together

```bash
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
cd frontend && npm run dev
```
