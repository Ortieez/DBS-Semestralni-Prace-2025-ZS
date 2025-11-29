FROM node:lts AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Vite application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 viteuser

# Copy built files from builder
COPY --from=builder --chown=viteuser:nodejs /app/dist ./dist
COPY --from=builder --chown=viteuser:nodejs /app/package.json ./package.json
COPY --from=builder --chown=viteuser:nodejs /app/node_modules ./node_modules

USER viteuser

EXPOSE 3000

ENV PORT 3000

# Run the Vite preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]