# Stage 1: Base stage for both dev and prod
FROM node:20.17.0-alpine3.20 AS base
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install

# Stage 2: Development stage
FROM base AS development
COPY . .
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

# Stage 3: Build stage (for production)
FROM base AS build
COPY . .
RUN pnpm run build:prod

# Stage 4: Production stage (only the build output)
FROM node:20.17.0-alpine3.20 AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json /app/pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --production
EXPOSE 3000
CMD ["node", "./dist/server.js"]
