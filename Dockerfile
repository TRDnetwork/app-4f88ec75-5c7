# Multi-stage build for TeamFlow PM backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application source
COPY . .

# Remove development files
RUN rm -rf tests/ docs/ *.md

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

USER nodejs

# Final stage
FROM node:20-alpine

WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT}/api/health', (r) => {if (r.statusCode !== 200) throw new Error()})"

EXPOSE 3000

CMD ["node", "server.js"]