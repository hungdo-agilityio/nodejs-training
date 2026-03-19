# Stage 1: Build
FROM node:22-alpine AS builder

RUN npm install -g pnpm

# Install Doppler CLI (NEXT_PUBLIC_* vars must be present at build time)
RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' \
    -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | \
    tee -a /etc/apk/repositories && apk add doppler

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG DOPPLER_TOKEN
RUN doppler run -- pnpm build

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

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

EXPOSE 3001

ENTRYPOINT ["doppler", "run", "--"]
CMD ["pnpm", "start"]
