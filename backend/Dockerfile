# Base node image for the backend
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create upload directories
RUN mkdir -p ./data/uploads/posts ./data/uploads/articles

# Expose port 3000
EXPOSE 3000

# Start the application with auto-seed
CMD ["sh", "-c", "npm run seed && npm run start:prod"]