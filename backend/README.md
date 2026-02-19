# Waey Backend - NestJS

This is the NestJS backend for the Waey mental health platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`

3. Run the application:
```bash
# Development
npm run start:dev

# Production (after building)
npm run build
npm run start
```

## Docker

Build and run with Docker:
```bash
# Development
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose up --build
```

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB
- **Cache**: Redis
- **Authentication**: JWT
- **ORM**: Mongoose