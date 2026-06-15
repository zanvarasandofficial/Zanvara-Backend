# Zanvara Backend

NestJS REST API for the Zanvara e-commerce platform. Built for local development and Vercel deployment.

## Tech Stack

- NestJS 11
- SQLite (local) / PostgreSQL (production)
- Prisma ORM
- JWT authentication
- Role-based admin protection (`USER` / `ADMIN`)

## Quick Start (Local)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
copy .env.example .env
```

Local setup uses SQLite (`file:./dev.db`) — no Docker or PostgreSQL install required.

### 3. Create database tables

```bash
npm run prisma:push
```

### 4. Run the API

```bash
npm run start:dev
```

API base URL: [http://localhost:4000/api](http://localhost:4000/api)

Frontend (separate folder): [http://localhost:3000](http://localhost:3000)

## API Routes

| Method | Route | Access |
|--------|-------|--------|
| GET | `/api` | Public |
| GET | `/api/health` | Public |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated (JWT) |
| GET | `/api/admin/dashboard` | **ADMIN only** |

## Admin Security

New users always register with role `USER`.

To make someone admin, update the role directly in the database:

```sql
UPDATE User
SET role = 'ADMIN'
WHERE email = 'your-admin@email.com';
```

You can run this with Prisma Studio:

```bash
npm run prisma:studio
```

Only users with `ADMIN` in the database can access `/api/admin/*` routes. The backend re-checks the role from the database on protected requests — changing the JWT alone is not enough if the DB role is still `USER`.

## Vercel Deployment

1. Create a PostgreSQL database (Neon, Supabase, Vercel Postgres, etc.)
2. In `prisma/schema.prisma`, change:
   - `provider = "sqlite"` → `provider = "postgresql"`
3. Import this project in Vercel
4. Set environment variables:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `JWT_SECRET` (long random string)
   - `JWT_EXPIRES_IN` (e.g. `7d`)
   - `FRONTEND_URL` (your live frontend URL)
5. Deploy

`vercel.json` routes all requests through the serverless NestJS handler in `api/index.ts`.

After first deploy, sync the schema:

```bash
npx prisma db push
```

## Frontend Connection

CORS is enabled for the URL in `FRONTEND_URL` (default `http://localhost:3000`).

## Scripts

- `npm run start:dev` — local development with hot reload
- `npm run build` — production build
- `npm run vercel-build` — build used by Vercel
- `npm run prisma:push` — sync schema to database
- `npm run prisma:studio` — open Prisma Studio
- `npm run db:up` / `npm run db:down` — optional Docker PostgreSQL (if Docker is installed)
