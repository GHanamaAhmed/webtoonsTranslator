# Use the latest Node.js LTS version
FROM node:18-alpine as base

# Install system dependencies required for Canvas
RUN apk add --no-cache \
    build-base \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

# Set working directory inside the container
WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install
RUN npm i -g prisma

COPY prisma ./prisma/

FROM base as development
COPY .env.development ./.env.development
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base as production
COPY .env.production ./.env.production
COPY . .

RUN npx next build

EXPOSE 3000

CMD ["npm", "run", "start"]

FROM base as local

COPY .env.local ./.env.local
COPY . .

RUN npx next dev

EXPOSE 3000

CMD ["npm", "run", "dev"]
