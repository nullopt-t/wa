# Production Dockerfile for Render (via Docker Hub)
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (needed for seed script)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Create upload directories
RUN mkdir -p ./data/uploads/posts ./data/uploads/articles

ENV NODE_ENV=production




# Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
#   CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Start application
CMD ["sh", "-c", "npm run seed && npm run start:prod"]