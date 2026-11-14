# Reproducible multi-stage build using the repository's committed Bun lockfile.
# The final runtime remains Node.js 22 to match the current Cloud Run service.

FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --no-save --no-frozen-lockfile

COPY . .
RUN bun run lint
RUN bun run build

FROM oven/bun:1 AS production-deps
WORKDIR /app
COPY package.json ./
# Install only runtime dependencies; the full development lockfile includes
# emulator-only test tooling that is intentionally excluded from this stage.
RUN bun install --production --no-save

FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json ./
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
