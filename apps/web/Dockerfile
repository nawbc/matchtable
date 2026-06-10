# Multi-stage production image for @matchtable/web (TanStack Start + Nitro)
# Build from repository root:
#   docker build -f apps/web/Dockerfile \
#     --build-arg VITE_SUPABASE_URL=... \
#     --build-arg VITE_SUPABASE_ANON_KEY=... \
#     -t matchtable-web .

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.5.2 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY apps/dashboard/package.json apps/dashboard/
COPY packages/api/package.json packages/api/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
COPY packages/config/package.json packages/config/
COPY packages/database/package.json packages/database/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN pnpm --filter @matchtable/web build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/apps/web/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
