# Stage 1: Build
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy dependency files first (for better layer caching)
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

# Build TypeScript to JavaScript
RUN pnpm build

# ---

# Stage 2: Production
FROM node:22-alpine AS production

RUN npm install -g pnpm

# Install Doppler CLI for runtime secret injection
RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' \
    -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | \
    tee -a /etc/apk/repositories && apk add doppler

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

ENTRYPOINT ["doppler", "run", "--preserve-env", "--"]
CMD ["node", "dist/server.js"]
