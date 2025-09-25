# Product Manager

Full-stack app to manage product details with multi-user support via `X-User-Id` header.

## Tech
- Backend: Express + Postgres (Neon) via `pg`, Zod
- Frontend: React + Vite + TypeScript

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
- Create `server/.env` with:
```
PORT=4000
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB?sslmode=require
```
For Neon, copy the connection string from the dashboard (use `?sslmode=require`).

3. Run dev servers (backend on 4000, frontend on 5173):
```bash
npm run dev
```

Open `http://localhost:5173`.

The frontend proxies `/api` to `http://localhost:4000`.

## API
- `GET /api/products?limit=20&offset=0` — list products (paginated)
- `GET /api/products/:id` — get product by id for current user
- `POST /api/products` — create product
  - Headers: `X-User-Id: <uuid>` (frontend auto-generates and stores in localStorage)

## Database schema
- `users(id TEXT PRIMARY KEY, name TEXT)`
- `products(id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), name TEXT NOT NULL, brand TEXT, type TEXT, warranty_period_months INTEGER, start_date DATE, serial_number TEXT, notes TEXT, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL)`
- Indexes: `idx_products_user(user_id)`, `idx_products_created_at(created_at desc)`

## Build
```bash
npm run build
```
