FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

# ─── Install dependencies + generate Prisma client ───────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate

# ─── Build Next.js ───────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY --from=deps /app/src/generated ./src/generated

# Only build-time envs Next.js bakes into the client bundle live here.
# All runtime secrets (DATABASE_URL, GOOGLE_*, BREVO_*, PADDLE_*, ONE_DRIVE_*,
# TEMPORAL_*, TOKEN, ENCRYPTION_KEY) are injected at runtime via docker-compose
# env_file — they are NOT baked into the image.
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Prisma generate already ran in deps; stub URL keeps Next build happy without
# requiring a real DB connection at image-build time.
ENV DATABASE_URL="postgresql://stub:stub@localhost:5432/stub"

RUN npm run build

# ─── Runtime image (serves both `app` and `worker` via compose CMD) ──────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Full node_modules (worker needs Temporal SDK, pg, googleapis etc. that
# standalone build trims away).
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts

# Worker source + shared lib + Prisma schema (read at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/worker ./worker
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Default = app. docker-compose overrides this for the worker service.
CMD ["node_modules/.bin/next", "start"]
