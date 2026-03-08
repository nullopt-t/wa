# Complete App Docker Deployment Guide

Deploy the entire Waey platform (Frontend + Backend) using Docker.

---

## Option 1: Deploy Entire App with Docker Compose (Local/Server)

### Quick Start

```bash
# Clone your repo
cd /mnt/HDD/Programming/Web/projects/react-waey

# Create .env file
cat > .env << EOF
DATABASE_URL=mongodb+srv://hedrsag:test@cluster0.ysstcmo.mongodb.net/waey?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_change_this
REFRESH_TOKEN_SECRET=your_refresh_token_secret_change_this
EOF

# Start everything
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Access Your App

```
Frontend: http://localhost:3000
Backend:  http://localhost:4000
MongoDB:  localhost:27017 (admin/password)
```

---

## Option 2: Deploy to Render via Docker Hub (Recommended for Production)

### Step 1: Build & Push Backend to Docker Hub

```bash
# Login to Docker Hub
docker login

# Build backend image
cd backend
docker build -t YOUR_USERNAME/waey-backend:latest .

# Push backend
docker push YOUR_USERNAME/waey-backend:latest
```

### Step 2: Build & Push Frontend to Docker Hub

```bash
# Build frontend image
cd ../frontend
docker build -t YOUR_USERNAME/waey-frontend:latest .

# Push frontend
docker push YOUR_USERNAME/waey-frontend:latest
```

### Step 3: Deploy Backend on Render

1. Go to https://render.com
2. **New +** → **Web Service**
3. **Deploy an existing Docker image**
4. Connect to Docker Hub
5. Select: `YOUR_USERNAME/waey-backend:latest`

**Configure:**
- Name: `waey-backend`
- Region: Oregon
- Plan: Free
- Health Check: `/health`

**Environment Variables:**
```
DATABASE_URL=mongodb+srv://hedrsag:test@cluster0.ysstcmo.mongodb.net/waey?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here
CLIENT_URL=https://waey-frontend.onrender.com
CORS_ORIGINS=https://waey-frontend.onrender.com
```

### Step 4: Deploy Frontend on Render

1. **New +** → **Web Service**
2. **Deploy an existing Docker image**
3. Select: `YOUR_USERNAME/waey-frontend:latest`

**Configure:**
- Name: `waey-frontend`
- Region: Oregon
- Plan: Free

**Environment Variables:**
```
VITE_API_URL=https://waey-backend.onrender.com
VITE_SOCKET_URL=https://waey-backend.onrender.com
```

### Step 5: Access Your App

```
Frontend: https://waey-frontend.onrender.com
Backend:  https://waey-backend.onrender.com
Health:   https://waey-backend.onrender.com/health
```

---

## Option 3: Deploy Backend on Render, Frontend on Vercel (Best Performance)

### Backend on Render

Same as Step 3 above.

### Frontend on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

**Set Environment Variables in Vercel Dashboard:**
```
VITE_API_URL=https://waey-backend.onrender.com
VITE_SOCKET_URL=https://waey-backend.onrender.com
```

---

## Docker Commands Reference

### Build Images

```bash
# Backend only
cd backend
docker build -t YOUR_USERNAME/waey-backend:latest .

# Frontend only
cd frontend
docker build -t YOUR_USERNAME/waey-frontend:latest .

# Both with docker-compose
docker-compose -f docker-compose.prod.yml build
```

### Run Locally

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart a service
docker-compose -f docker-compose.prod.yml restart backend
```

### Push to Docker Hub

```bash
# Login
docker login

# Push backend
docker push YOUR_USERNAME/waey-backend:latest

# Push frontend
docker push YOUR_USERNAME/waey-frontend:latest
```

### Update Deployment

```bash
# Rebuild and push
docker build -t YOUR_USERNAME/waey-backend:latest .
docker push YOUR_USERNAME/waey-backend:latest

# Render will auto-deploy, or manually trigger:
# Render Dashboard → Manual Deploy → Deploy latest image
```

---

## Environment Variables

### Backend (.env or Render)

```env
# Required
DATABASE_URL=mongodb+srv://hedrsag:test@cluster0.ysstcmo.mongodb.net/waey?retryWrites=true&w=majority&appName=Cluster0

# Optional (auto-generated if not set)
JWT_SECRET=your_jwt_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here

# Optional
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AI (optional)
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (.env or Vercel/Render)

```env
VITE_API_URL=http://localhost:4000  # Local
VITE_API_URL=https://waey-backend.onrender.com  # Production

VITE_SOCKET_URL=http://localhost:4000  # Local
VITE_SOCKET_URL=https://waey-backend.onrender.com  # Production
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker logs waey-backend

# Common issue: MongoDB connection
# Fix: Check DATABASE_URL is correct
```

### Frontend Can't Connect to Backend

```bash
# Check VITE_API_URL is set correctly
# For local: http://localhost:4000
# For Render: https://waey-backend.onrender.com
```

### Docker Build Fails

```bash
# Clean build
docker build --no-cache -t YOUR_USERNAME/waey-backend:latest .

# Check Dockerfile syntax
```

### MongoDB Connection Issues

```bash
# Test connection locally
docker run --rm mongo mongosh "mongodb+srv://hedrsag:test@cluster0.ysstcmo.mongodb.net/waey"

# Check MongoDB Atlas:
# 1. Network Access allows 0.0.0.0/0
# 2. Username/password correct
# 3. Database user has read/write permissions
```

---

## Cost Breakdown

| Deployment | Backend | Frontend | Database | Total |
|------------|---------|----------|----------|-------|
| **Docker Compose (Local)** | Free | Free | Free (local) | $0 |
| **Render (Both)** | Free | Free | Atlas Free | $0 |
| **Render + Vercel** | Free | Free | Atlas Free | $0 |
| **Render Paid** | $7/mo | Free | Atlas Free | $7/mo |

---

## Production Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secrets
- [ ] Enable MongoDB IP whitelist
- [ ] Set up SSL/TLS
- [ ] Configure CORS properly
- [ ] Set up monitoring/logging
- [ ] Regular backups
- [ ] Update dependencies

---

## URLs After Deployment

### Local (Docker Compose)

```
Frontend: http://localhost:3000
Backend:  http://localhost:4000
MongoDB:  localhost:27017
```

### Render (Both Services)

```
Frontend: https://waey-frontend.onrender.com
Backend:  https://waey-backend.onrender.com
Health:   https://waey-backend.onrender.com/health
Admin:    https://waey-frontend.onrender.com/admin
```

### Render Backend + Vercel Frontend

```
Frontend: https://your-app.vercel.app
Backend:  https://waey-backend.onrender.com
```

---

## Success! 🎉

Your complete Waey platform is deployed with Docker!

**Default Admin Login:**
- Email: `admin@waey.com`
- Password: `admin123`

**⚠️ Change password immediately!**
