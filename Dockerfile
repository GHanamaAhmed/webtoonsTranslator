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
COPY package.json package-lock.json* prisma ./

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

CMD [ "npm","run","start" ]