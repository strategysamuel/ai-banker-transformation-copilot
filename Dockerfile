# Production Multi-Stage Dockerfile for Cloud Run
# AI Banker Transformation Copilot (Google Cloud Run AI Challenge)

FROM node:22-slim AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Run production build (Vite client SPA + esbuild bundled backend server)
RUN npm run build

# Runtime Stage
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests and production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled artifacts, policy data, and vector embeddings from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
COPY --from=builder /app/public ./public

# Expose standard Cloud Run ingress port
EXPOSE 3000

# Cloud Run execution command
CMD ["node", "dist/server.cjs"]
