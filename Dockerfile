# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY product-management-server/package*.json ./product-management-server/
COPY product-management-web/package*.json ./product-management-web/

# Install dependencies
RUN npm ci --only=production

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY product-management-server/package*.json ./product-management-server/
COPY product-management-web/package*.json ./product-management-web/

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/product-management-server/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/product-management-web/dist ./public

# Copy package.json for start script
COPY --from=builder /app/product-management-server/package.json ./package.json

USER nextjs

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD ["node", "dist/index.js"]
