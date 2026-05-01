# Professional CRM — Vite + Node/Express + Prisma + PostgreSQL

A full-stack CRM starter ready to deploy on **Vercel** (frontend + serverless backend) with **Postgres** (Neon, Supabase, or Vercel Postgres).

## Features
- JWT authentication (register / login / me)
- Contacts, Companies, Deals (with pipeline stages), Tasks, Activities/Notes
- Role-ready user model
- Prisma migrations + seed
- CORS-enabled REST API
- Tailwind + shadcn-style UI, React Query, Zustand
- Kanban deal pipeline + dashboard metrics

## Repo layout
```
crm-starter/
├── backend/         # Node + Express + Prisma (deploy as Vercel serverless)
│   ├── api/index.ts # Vercel serverless entry
│   ├── src/         # routes, middleware, prisma client
│   └── prisma/      # schema.prisma + seed.ts
└── frontend/        # React + Vite + Tailwind
```

---

## 1. Local setup

### Prerequisites
- Node 20+
- A Postgres database (free options below)

### Get a free Postgres database
Pick ONE:
- **Neon** (recommended): https://neon.tech → create project → copy connection string
- **Supabase**: https://supabase.com → Project → Settings → Database → URI
- **Vercel Postgres**: Vercel dashboard → Storage → Create → Postgres

### Backend
```bash
cd backend
cp .env.example .env
# edit .env: set DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run seed         # optional: demo user + sample data
npm run dev          # http://localhost:4000
```

Demo login after seed: `demo@crm.dev` / `demo1234`

### Frontend
```bash
cd frontend
cp .env.example .env  # VITE_API_URL=http://localhost:4000
npm install
npm run dev           # http://localhost:5173
```

---

## 2. Deploying to Vercel

You will deploy **two Vercel projects** from the same repo: one for `frontend/`, one for `backend/`.

### A. Push to GitHub
```bash
git init && git add . && git commit -m "init"
# create a GitHub repo, then:
git remote add origin <your-repo-url>
git push -u origin main
```

### B. Deploy backend
1. Vercel → **Add New Project** → import the repo
2. **Root Directory**: `backend`
3. Framework preset: **Other**
4. Build command: `npm run vercel-build` (runs `prisma generate && prisma migrate deploy`)
5. Output directory: leave default
6. Environment variables:
   - `DATABASE_URL` = your Postgres URI (Neon/Supabase/Vercel Postgres)
   - `JWT_SECRET` = a long random string (`openssl rand -hex 32`)
   - `CORS_ORIGIN` = your frontend Vercel URL (set after step C, then redeploy)
7. Deploy → copy the URL, e.g. `https://crm-backend-xyz.vercel.app`

### C. Deploy frontend
1. Vercel → **Add New Project** → same repo
2. **Root Directory**: `frontend`
3. Framework preset: **Vite**
4. Environment variable:
   - `VITE_API_URL` = backend URL from step B
5. Deploy → copy the URL
6. Go back to backend project → set `CORS_ORIGIN` to this URL → redeploy

### D. Run migrations on production DB
The backend's `vercel-build` runs `prisma migrate deploy` automatically on every deploy. To seed once:
```bash
cd backend
DATABASE_URL="<prod-url>" npm run seed
```

---

## 3. API reference (quick)
```
POST   /api/auth/register   { email, password, name }
POST   /api/auth/login      { email, password } → { token }
GET    /api/auth/me         (Bearer token)

GET    /api/contacts        ?search=
POST   /api/contacts
GET    /api/contacts/:id
PATCH  /api/contacts/:id
DELETE /api/contacts/:id

GET    /api/companies       (CRUD)
GET    /api/deals           (CRUD, ?stage=)
PATCH  /api/deals/:id/stage { stage }
GET    /api/tasks           (CRUD)
GET    /api/dashboard       → metrics
```
All `/api/*` routes except `/api/auth/*` require `Authorization: Bearer <token>`.

---

## 4. Tech stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind, React Query, Zustand, React Router, Axios
- **Backend**: Node 20, Express 4, Prisma 5, PostgreSQL, JWT, Zod, bcrypt
- **Deploy**: Vercel serverless functions + static frontend

---

## 5. Common issues
- **CORS error in browser**: set `CORS_ORIGIN` on the backend to your frontend URL.
- **Prisma "Can't reach database"**: confirm `DATABASE_URL` includes `?sslmode=require` for Neon/Supabase.
- **Migrations didn't run on Vercel**: check the build log — `vercel-build` must succeed.
- **401 on every request**: frontend isn't sending the token; check `localStorage.token` and axios interceptor.
