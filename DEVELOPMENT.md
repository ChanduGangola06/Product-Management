# Product Management - Development Setup

## Quick Start

To run the full development environment (both server and frontend):

```bash
npm run dev
```

This will:
1. Start the server on `http://localhost:4000`
2. Start the frontend on `http://localhost:5173` with API proxy to the server

## Manual Setup

If you prefer to run them separately:

### 1. Start the Server
```bash
cd product-management-server
npm run dev
```
Server will run on `http://localhost:4000`

### 2. Start the Frontend (in a new terminal)
```bash
cd product-management-web
npm run dev
```
Frontend will run on `http://localhost:5173` and proxy API calls to the server.

## How It Works

- The frontend uses a proxy configuration that forwards `/api/*` and `/health` requests to the server
- In development, the frontend makes API calls to relative URLs (e.g., `/api/products`) which are proxied to the server
- The server has CORS enabled and runs in mock mode (no database required) when `DATABASE_URL` is not set

## Troubleshooting

If you get "Failed to fetch" errors:

1. Make sure the server is running on port 4000
2. Check that the frontend is using the proxy (should be automatic in dev mode)
3. Verify both services are running without errors

## API Endpoints

- `GET /health` - Health check
- `GET /api/products` - List products (requires X-User-Id header)
- `POST /api/products` - Create product (requires X-User-Id header)
