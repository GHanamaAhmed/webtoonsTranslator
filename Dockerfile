# Base image using the latest Node.js LTS version
FROM node:20.10-alpine AS base

# Install system dependencies required for Canvas and other native modules
RUN apk add --no-cache \
    build-base \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    libc6-compat

# Set working directory
WORKDIR /app

# Stage: Install dependencies
FROM base AS deps

# Install latest npm to prevent dependency issues
RUN npm install -g npm@latest

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install node modules using npm ci for cleaner builds
RUN npm ci

# Optionally install Prisma globally if required
RUN npm install -g prisma

# Stage: Development environment
FROM base AS dev

# Set working directory
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy environment variables for development
COPY .env.development ./.env.development

# Copy the rest of the application source code
COPY . .

# Enable hot reloading
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Expose the development port
EXPOSE 3000

# Command to run the development server
CMD ["npm", "run", "dev"]

# Stage: Builder for production
FROM base AS prod

# Set working directory
WORKDIR /app

# Copy node_modules and npm cache from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /root/.npm /root/.npm

# Copy the entire application source code
COPY . .

# Disable Prisma postinstall binary download
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

# Build the Next.js application
RUN npm run build

# Uncomment the following line to generate Prisma client in production
# RUN npx prisma generate

# Stage: Production runner
FROM node:20.10-alpine AS runner

# Install only runtime dependencies for a slimmer image
RUN apk add --no-cache \
    libc6-compat \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

# Create a non-root user for running the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Copy built assets and necessary files from builder stage
COPY --from=prod /app/public ./public
COPY --from=prod --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=prod --chown=nextjs:nodejs /app/.next/static ./.next/static

# Uncomment the following line if using Prisma
# COPY --from=prod --chown=nextjs:nodejs /app/prisma ./prisma

# Set permissions for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Switch to non-root user
USER nextjs

# Expose the production port
EXPOSE 3000

# Set environment variables for the application
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Command to start the production server with migrations
CMD ["npm", "run", "start:migrate:prod"]
