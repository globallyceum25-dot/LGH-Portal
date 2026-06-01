# Lyceum Global Holdings — Futuristic Portal

A modernised, **app-style portal** for a diversified international holding company.
Users enter a futuristic command centre and drill in: **sector → company →
full business profile**, including each company's **connected applications**
(launchable by URL, with auto-generated thumbnails). An authenticated **admin
CMS** manages all content.

### Highlights
- **3D network mesh portal home** — entering `/portal` renders the entire group as
  an interactive **WebGL 3D graph** (Holding → Sectors → Companies → Applications,
  ~81 nodes / 80 links). Drag to rotate, scroll to zoom, click a company node to
  open an **in-scene floating glass panel** with its full profile and connected
  apps, click an app node to launch its URL. A toggle flips to the classic 2D grid.
  Powered by `react-force-graph-3d` + Three.js with optional bloom glow; lazy-loaded
  so only the network view pays the engine bundle cost.
- **Portal flow:** 3D mesh (or grid) → sector → company detail, with sidebar
  + breadcrumb stepper.
- **Connected applications:** every company lists the apps it runs; each is a
  launchable tile with a favicon-on-gradient thumbnail (no third-party service —
  private/offline-friendly). Connect new apps by URL in the admin.
- **4 switchable futuristic themes** via a live theme switcher (persisted):
  **Neon Cyber**, **Aurora Glass**, **Holographic Mesh**, **Mono Futurism** —
  animated backgrounds, glass surfaces, generated artwork, motion (respects
  `prefers-reduced-motion`). The 3D mesh recolors with the theme.

Built to international web standards: responsive, accessible (WCAG-minded,
semantic HTML, keyboard focus, skip links), secure auth with hashed passwords
and signed tokens, and a clean REST API.

---

## Tech stack

| Layer       | Choice                                            |
| ----------- | ------------------------------------------------- |
| Runtime     | **Bun** 1.3                                       |
| Frontend    | **React 19** + **React Router 7** + **TypeScript**|
| Styling     | **Tailwind CSS v4** (via `@tailwindcss/vite`)     |
| Build/dev   | **Vite 6**                                        |
| Backend API | **Bun.serve** (zero-framework router)             |
| Database    | **SQLite** (`bun:sqlite`, built in)               |
| Auth        | Signed HS256 tokens + bcrypt (`Bun.password`)     |

No Node.js required.

---

## Project structure

```
.
├── index.html              # Vite entry
├── vite.config.ts          # Dev server + /api proxy to the Bun backend
├── shared/types.ts         # Domain types shared by client & server
├── server/                 # Bun API + SQLite
│   ├── index.ts            # HTTP router (public + admin) + static serving
│   ├── db.ts               # DB connection + schema migration (sectors, companies, applications, users)
│   ├── auth.ts             # Token signing/verification + password hashing
│   └── seed.ts             # Seed sectors, companies, applications & admin user
├── src/                    # React application
│   ├── components/         # Cards, AppThumbnail, GeneratedArt, ThemeBackground/Switcher, states
│   ├── lib/                # API client, auth context, theme context, helpers, useTilt
│   └── pages/
│       ├── portal/         # Landing, PortalShell, sector/company/detail flow
│       └── admin/          # Auth-gated CMS (sectors, companies, applications)
├── scripts/dev.ts          # Runs API + Vite together
└── data/portal.sqlite      # Created on first run (git-ignored)
```

---

## Getting started

```bash
bun install          # install dependencies
bun run seed         # create & seed the database (run once)
bun run dev          # start API (:3001) + Vite dev server (:5173)
```

Open <http://localhost:5173>.

**Admin login** (change in production):

```
Email:    admin@lyceumglobal.com
Password: ChangeMe!2026
```

The admin area is at `/admin`.

### Reseed / reset data

```bash
bun run seed --force        # wipe and reseed
```

Customise the seed credentials via env vars:

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='S3cret!' bun run seed --force
```

---

## Production

```bash
bun run build        # build the React app to dist/
bun run start        # Bun serves the API AND the built frontend on :3001
```

In production a single Bun process serves the API under `/api/*` and the static
SPA (with client-side routing fallback) for everything else.

### Environment variables

| Variable         | Default                  | Purpose                          |
| ---------------- | ------------------------ | -------------------------------- |
| `PORT`           | `3001`                   | API / production server port     |
| `API_PORT`       | `3001`                   | API port in `bun run dev`        |
| `DB_PATH`        | `data/portal.sqlite`     | SQLite file location             |
| `JWT_SECRET`     | dev placeholder          | **Set a strong secret in prod**  |
| `ADMIN_EMAIL`    | `admin@lyceumglobal.com` | Seed admin email                 |
| `ADMIN_PASSWORD` | `ChangeMe!2026`          | Seed admin password              |

---

## API reference

### Public

| Method | Path                   | Description                          |
| ------ | ---------------------- | ------------------------------------ |
| GET    | `/api/health`          | Health check                         |
| GET    | `/api/stats`           | Counts (sectors, companies, countries) |
| GET    | `/api/sectors`         | List sectors (+ company counts)      |
| GET    | `/api/sectors/:slug`   | Sector + its companies               |
| GET    | `/api/companies`       | List/search companies. Query: `q`, `sector`, `status`, `featured` |
| GET    | `/api/companies/:slug` | Single company profile **+ connected `applications[]`** |
| GET    | `/api/graph`           | Full hierarchical graph for the 3D mesh (nodes + links) |

### Auth

| Method | Path              | Description                |
| ------ | ----------------- | -------------------------- |
| POST   | `/api/auth/login` | `{ email, password }` → token |
| GET    | `/api/auth/me`    | Current admin (Bearer token)  |

### Admin (Bearer token required)

| Method | Path                       | Description        |
| ------ | -------------------------- | ------------------ |
| POST   | `/api/admin/sectors`       | Create sector      |
| PUT    | `/api/admin/sectors/:id`   | Update sector      |
| DELETE | `/api/admin/sectors/:id`   | Delete (blocked if it has companies) |
| POST   | `/api/admin/companies`     | Create company     |
| PUT    | `/api/admin/companies/:id` | Update company     |
| DELETE | `/api/admin/companies/:id` | Delete company     |
| POST   | `/api/admin/applications`     | Connect an app by URL (name auto-derives from host) |
| PUT    | `/api/admin/applications/:id` | Update an application |
| DELETE | `/api/admin/applications/:id` | Disconnect an application |

---

## Replacing the placeholder content

The seed data in `server/seed.ts` is illustrative. To load your real data:

1. Edit the `SECTORS` and `COMPANIES` arrays in `server/seed.ts`, **or**
2. Use the **admin CMS** to add/edit sectors and companies through the UI.

---

## Notes on standards & hardening for production

- Set a strong `JWT_SECRET` and rotate the seeded admin password.
- Put the Bun server behind TLS (reverse proxy) and enable HSTS.
- Consider rate-limiting the login endpoint and adding audit logging.
- The contact form is a front-end demo; wire it to an email/CRM service.
- For higher write concurrency, the SQLite layer can be swapped for Postgres
  with minimal changes (the query layer is isolated in `server/index.ts`).
