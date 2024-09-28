# Base builder image for compiling the application
FROM public.ecr.aws/docker/library/node:20.9.0-slim AS builder

# Install system dependencies required for native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    openssl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set environment variable for Sharp path
ENV NEXT_SHARP_PATH=/tmp/node_modules/sharp

# Copy only the package.json and lock files first to leverage Docker cache
COPY package.json package-lock.json* prisma ./

# Install only the production dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Install Prisma globally for database access
RUN npm install -g prisma

# Build the Next.js application
RUN npm run build

# --- Runner Image for production ---
FROM public.ecr.aws/docker/library/node:20.9.0-slim AS runner

# Install OpenSSL in the runner image as well
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
    
# Install aws-lambda-adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.2 /lambda-adapter /opt/extensions/lambda-adapter

# Expose necessary port and set environment variables
ENV PORT=3000
ENV NODE_ENV=production
ENV AWS_LWA_ENABLE_COMPRESSION=true

# Set up the working directory
WORKDIR /app

# Copy only the essential files for production
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/run.sh ./run.sh

# Symlink for caching to optimize performance
RUN ln -s /tmp/cache ./.next/cache

# Ensure the run script is executable
RUN chmod +x ./run.sh

# Configure the container to execute the server run command
CMD ["./run.sh"]