FROM node:20-alpine AS builder

WORKDIR /app

# Copy lockfile and manifest first for better caching
COPY server/package.json server/package-lock.json ./

# Install ALL dependencies (includes devDependencies for TypeScript build)
RUN npm ci

# Copy source and tsconfig, then build
COPY server/tsconfig.json ./tsconfig.json
COPY server/src ./src
RUN npm run build

# --- Runtime image ---
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy manifests and install only production dependencies
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

# Copy built application
COPY --from=builder /app/dist ./dist

# The app defaults to 3003 and respects PORT provided by Railway
EXPOSE 3003

CMD ["node", "dist/index.js"]