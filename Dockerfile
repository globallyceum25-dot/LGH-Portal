# ============================================================================
# Lyceum Global Holdings Portal — Multi-stage Dockerfile
# ============================================================================
# Stage 1 (deps):    Install production + dev dependencies
# Stage 2 (build):   Build the Vite frontend (produces dist/)
# Stage 3 (runtime): Slim production image with Bun
# ============================================================================

# ── Stage 1: Install dependencies ──────────────────────────────────────────
FROM oven/bun:1 AS deps

WORKDIR /app

# Copy only lockfile + manifest for maximum cache reuse
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Stage 2: Build frontend ───────────────────────────────────────────────
FROM deps AS build

WORKDIR /app

# Copy source code (deps already in node_modules from previous stage)
COPY . .

# Build Vite frontend → dist/
RUN bun run build

# ── Stage 3: Production runtime ───────────────────────────────────────────
FROM oven/bun:1-slim AS runtime

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 app && \
    adduser --system --uid 1001 --ingroup app app

# Copy production node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copy built frontend
COPY --from=build /app/dist ./dist

# Copy server and shared source (Bun runs TypeScript directly)
COPY server/ ./server/
COPY shared/ ./shared/
COPY package.json ./

# Create data directory for SQLite with correct permissions
RUN mkdir -p /app/data && chown -R app:app /app/data

# Switch to non-root user
USER app

# Runtime configuration
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["bun", "server/index.ts"]
