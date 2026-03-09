# Frontend Dockerfile for Production
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_SOCKET_URL

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Build the app
RUN npm run build

# Production stage - use node to serve static files
FROM node:18-alpine

WORKDIR /app

# Install serve package
RUN npm install -g serve


# Copy built files from builder
COPY --from=builder /app/dist ./dist


# Expose port
EXPOSE 8080

# Start serve on port from env var
CMD ["sh", "-c", "npx serve -s dist -l ${PORT:-8080}"]
