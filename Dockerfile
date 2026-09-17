# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
# The server binds PORT (Railway injects it) and falls back to 3000.
COPY --from=build /app/.output ./.output
# Read at boot by server/plugins/migrate.ts
COPY --from=build /app/server/database/migrations ./server/database/migrations
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
