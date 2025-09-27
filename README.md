# Product Management System

A full-stack product management application built with React, TypeScript, Express, and PostgreSQL.

## Features

- **Product Management**: Create, view, and manage products with detailed information
- **User Authentication**: Simple user-based data isolation
- **Responsive Design**: Modern, mobile-friendly interface
- **Real-time Updates**: Instant feedback and data synchronization
- **Data Persistence**: PostgreSQL database with automatic migrations

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Zod for schema validation
- Modern CSS with responsive design

### Backend
- Express.js with TypeScript
- PostgreSQL with connection pooling
- Zod for request validation
- CORS enabled for cross-origin requests

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (optional - runs in mock mode without DB)

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd product-management
   npm install
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```
   This starts both the server (port 4000) and frontend (port 5173) with hot reloading.

3. **Access the application:**
   - Frontend: http://localhost:5173
   - API: http://localhost:4000

### Production Setup

1. **Set up environment variables:**
   ```bash
   # Server
   cd product-management-server
   cp .env.example .env
   # Edit .env and set DATABASE_URL
   
   # Frontend (optional)
   cd product-management-web
   cp .env.example .env
   # Edit .env and set VITE_API_BASE_URL if needed
   ```

2. **Build and start:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

- `GET /health` - Health check
- `GET /api/products` - List products (requires X-User-Id header)
- `POST /api/products` - Create product (requires X-User-Id header)

## Database Schema

The application automatically creates the following tables:

- `users` - User information
- `products` - Product data with user association

## Deployment

### Vercel (Recommended)

1. **Deploy Server:**
   ```bash
   cd product-management-server
   vercel --prod
   ```

2. **Deploy Frontend:**
   ```bash
   cd product-management-web
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard:**
   - `DATABASE_URL` for the server
   - `VITE_API_BASE_URL` for the frontend (if needed)

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folders to your hosting provider

## Development

### Project Structure
```
product-management/
├── product-management-server/    # Express API server
│   ├── src/
│   │   └── index.ts             # Main server file
│   ├── dist/                    # Built files
│   └── package.json
├── product-management-web/      # React frontend
│   ├── src/
│   │   ├── main.tsx            # App entry point
│   │   └── product/
│   │       └── App.tsx          # Main component
│   ├── dist/                   # Built files
│   └── package.json
├── start-dev.mjs               # Development orchestrator
└── package.json                # Root package.json
```

### Available Scripts

- `npm run dev` - Start both server and frontend in development mode
- `npm run build` - Build both applications for production
- `npm start` - Start production server
- `npm run dev:server` - Start only the server
- `npm run dev:web` - Start only the frontend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details