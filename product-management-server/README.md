# Product Manager - Server (Express + Postgres/Neon)

Backend API for managing product details with multi-user support via `X-User-Id` header.

## Prerequisites
- Node.js 18+ (Node 22 recommended)
- A Postgres database. For Neon:
  - Create a project and database
  - Copy the connection string (ensure `?sslmode=require` is present)

## Environment
Create `server/.env`:
```
PORT=4000
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB?sslmode=require
```

## Install
From repo root:
```bash
npm --prefix server install
```

## Development
Start the API with hot reload:
```bash
npm --prefix server run dev
```
Server listens on `http://localhost:4000`.

Tables and indexes are auto-created on startup.

## API
Headers: All authenticated routes require `X-User-Id: <uuid>`.

- GET `/health`
  - Returns `{ ok: true }`.

- GET `/api/products?limit=20&offset=0`
  - Lists products for the current user.
  - Response:
```json
{
  "items": [
    {
      "id": "...",
      "name": "...",
      "brand": "...",
      "type": "...",
      "warrantyPeriodMonths": 12,
      "startDate": "2025-01-01",
      "serialNumber": "...",
      "notes": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

- GET `/api/products/:id`
  - Fetch a single product for the current user.

- POST `/api/products`
  - Create a new product.
  - Body:
```json
{
  "name": "string",
  "brand": "string?",
  "type": "string?",
  "warrantyPeriodMonths": 0,
  "startDate": "YYYY-MM-DD?",
  "serialNumber": "string?",
  "notes": "string?"
}
```

## Validation & Errors
- Input validated with Zod; invalid payloads return `400` with details.
- Missing `X-User-Id` returns `401`.
- Not found returns `404`.
- Unhandled errors return `500`.

## Tests
Uses Vitest + Supertest. Requires a reachable database.

- Install dev deps:
```bash
npm --prefix server install
```
- Start server in another terminal:
```bash
npm --prefix server run dev
```
- Run tests:
```bash
npm --prefix server run test
```

## Troubleshooting
- Connection issues to Neon: ensure `DATABASE_URL` includes `?sslmode=require`.
- Port already in use: set another `PORT` in `.env`.
- CORS: enabled by default for local development.
