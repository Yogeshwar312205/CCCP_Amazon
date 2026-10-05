FROM node:22-alpine AS base

WORKDIR /app

# Update Alpine OS packages
RUN apk upgrade --no-cache

# Use updated npm during image build
RUN npm install -g npm@12.2.0

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# npm is only required during image build, not application runtime
RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm \
    /usr/local/bin/npx

# Copy application
COPY . .

# Create runtime directories
RUN mkdir -p uploads logs

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

CMD ["node", "server.js"]