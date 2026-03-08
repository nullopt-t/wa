# Production Dockerfile for Render
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create upload directories
RUN mkdir -p ./data/uploads/posts ./data/uploads/articles

# Render uses PORT environment variable (default 10000)
ENV PORT=10000
ENV NODE_ENV=production

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:10000/health || exit 1

# Seed database and start application
CMD ["sh", "-c", "npm run seed && npm run start:prod"]