# Product Manager - Web (React + Vite)

Single-page app to input and view product details.

## Prerequisites
- Node.js 18+
- Backend server running at `http://localhost:4000`

## Install
From repo root:
```bash
npm --prefix web install
```

## Development
Start the dev server:
```bash
npm --prefix web run dev
```
Vite will open on an available port (5173 by default). The app proxies API requests to `http://localhost:4000` via `vite.config.ts`.

## Usage
- Fill in Product Name (required), optional fields (Brand, Type, Warranty months, Start Date, Serial Number, Notes).
- Click Confirm to save.
- Recent Products list shows newly saved items.

Multi-user: The app stores a generated user id in `localStorage` (`demo-user-id`) and sends it as `X-User-Id` header, so each browser profile has its own list.

## Validation
- Client-side: Zod validation shows inline errors.
- Server re-validates inputs.

## Tests
Uses Vitest + Testing Library.

- Install:
```bash
npm --prefix web install
```
- Run:
```bash
npm --prefix web run test
```

## Troubleshooting
- If API errors show in the UI, ensure the backend is running and reachable at `http://localhost:4000`.
- If the port 5173 is in use, Vite will choose another port. The proxy will still work.
- Windows path issues with quotes inside JSX placeholders are resolved; ensure you pulled the latest changes.
