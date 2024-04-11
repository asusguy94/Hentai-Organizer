# Define the base image
FROM node:20-alpine3.18 AS base

##### DEPENDENCIES
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn --frozen-lockfile

##### BUILDER
FROM deps AS builder
COPY . .
RUN yarn build

##### RUNNER
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN apk add ffmpeg

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify
USER fastify

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
ENV PORT 3000

CMD ["node", "dist/index.js"]