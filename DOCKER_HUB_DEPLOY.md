# Docker Hub + Render Deployment Guide

Deploy your Waey backend to Render using Docker Hub (100% free).

---

## Overview

1. **Build** Docker image locally
2. **Push** to Docker Hub
3. **Deploy** on Render using Docker Hub image
4. **Connect** MongoDB Atlas

**Total Cost: $0/month** ✅

---

## Prerequisites

- [ ] Docker installed
- [ ] Docker Hub account (free)
- [ ] MongoDB Atlas cluster (free M0)
- [ ] Render account (free)

---

## Step 1: Build & Push to Docker Hub

### Login to Docker Hub

```bash
docker login
# Enter your Docker Hub username and password
```

### Build Docker Image

```bash
cd backend

# Build image (replace YOUR_USERNAME with your Docker Hub username)
docker build -t YOUR_USERNAME/waey-backend:latest .

# Example:
# docker build -t john123/waey-backend:latest .
```

### Push to Docker Hub

```bash
docker push YOUR_USERNAME/waey-backend:latest

# Example:
# docker push john123/waey-backend:latest
```

**Wait for push to complete** (~2-5 minutes depending on your internet)

---

## Step 2: Create MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Sign up → Create Cluster (M0 Free)
3. Database Access → Create User (save credentials!)
4. Network Access → Add `0.0.0.0/0` (allow all IPs)
5. Connect → Copy connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/waey?retryWrites=true&w=majority
   ```

---

## Step 3: Deploy on Render

### Create New Web Service

1. Go to https://render.com → Sign up
2. **New +** → **Web Service**
3. Select **Deploy an existing Docker image**
4. Click **Connect to Docker Hub**

### Configure Service

| Setting | Value |
|---------|-------|
| **Name** | `waey-backend` |
| **Region** | Oregon (or closest to you) |
| **Plan** | Free |
| **Instance Size** | Free |
| **Docker Image** | `YOUR_USERNAME/waey-backend:latest` |
| **Root Disk** | Leave as is (not needed) |
| **Health Check Path** | `/health` |
| **Start Command** | Leave empty (uses Dockerfile CMD) |

### Environment Variables

Click **Advanced** → **Add Environment Variable**:

| Key | Value | Required? |
|-----|-------|-----------|
| `NODE_ENV` | `production` | ✅ Auto-set |
| `PORT` | `10000` | ✅ Auto-set |
| `DATABASE_URL` | Your MongoDB connection string | ✅ **REQUIRED** |
| `JWT_SECRET` | (leave empty - auto-generated) | Optional |
| `REFRESH_TOKEN_SECRET` | (leave empty - auto-generated) | Optional |
| `JWT_EXPIRES_IN` | `7d` | Optional |
| `REFRESH_TOKEN_EXPIRES_IN` | `30d` | Optional |
| `CLIENT_URL` | `https://waey-frontend.onrender.com` | Optional |
| `CORS_ORIGINS` | `https://waey-frontend.onrender.com` | Optional |
| `SMTP_HOST` | `smtp.gmail.com` | Optional (emails) |
| `SMTP_USER` | Your Gmail | Optional |
| `SMTP_PASSWORD` | Gmail app password | Optional |
| `GEMINI_API_KEY` | Your Gemini API key | Optional (chatbot) |

**⚠️ IMPORTANT:** You MUST add `DATABASE_URL` or the app won't start!

### Deploy

1. Click **Create Web Service**
2. Wait for deployment (~5-10 minutes)
3. Check logs for "Server running on port 10000"

---

## Step 4: Verify Deployment

### Check Health

```bash
curl https://waey-backend.onrender.com/health
```

**Expected response:**
```json
{
  "status": "ok"
}
```

### Test API

```bash
# Get community posts
curl https://waey-backend.onrender.com/api/community/posts

# Get stories (should have seeded data)
curl https://waey-backend.onrender.com/api/stories
```

---

## Step 5: Deploy Frontend (Optional)

If you want to deploy the frontend too:

### Option A: Render Static Site

1. **New +** → **Static Site**
2. Connect your GitHub repo
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Environment Variables:
   - `VITE_API_URL`: `https://waey-backend.onrender.com`
   - `VITE_SOCKET_URL`: `https://waey-backend.onrender.com`

### Option B: Vercel/Netlify (Recommended)

**Vercel:**
1. Go to https://vercel.com
2. Import your GitHub repo
3. Set build command: `npm run build`
4. Add environment variables:
   - `VITE_API_URL=https://waey-backend.onrender.com`

**Netlify:**
1. Go to https://netlify.com
2. Deploy from GitHub
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables

---

## Updating Your Deployment

### Push Updates to Docker Hub

```bash
# Rebuild image
cd backend
docker build -t YOUR_USERNAME/waey-backend:latest .

# Push updated image
docker push YOUR_USERNAME/waey-backend:latest
```

### Render Auto-Updates

Render will automatically detect the new image and redeploy (~2-5 minutes).

You can also manually trigger redeploy:
1. Render Dashboard → `waey-backend`
2. **Manual Deploy** → **Deploy latest image**

---

## Troubleshooting

### Service Won't Start

**Check Logs:**
1. Render Dashboard → `waey-backend` → **Logs**
2. Look for errors

**Common Issues:**

1. **MongoDB Connection Failed**
   ```
   Error: MongoServerError: Authentication failed
   ```
   → Fix: Check `DATABASE_URL` has correct username/password

2. **MongoDB IP Not Whitelisted**
   ```
   Error: MongoNetworkError: connect ECONNREFUSED
   ```
   → Fix: MongoDB Atlas → Network Access → Add `0.0.0.0/0`

3. **Out of Memory**
   ```
   Error: JavaScript heap out of memory
   ```
   → Fix: Upgrade to paid plan or optimize code

### Health Check Fails

**Check:**
```bash
curl -v https://waey-backend.onrender.com/health
```

**Expected:** HTTP 200 with `{"status": "ok"}`

**If 500 error:** Check logs for database connection issues

### Seed Script Runs Every Time

**Normal behavior** - seed script is idempotent (won't duplicate data).

To skip seed in production, update Dockerfile:
```dockerfile
CMD ["npm", "run", "start:prod"]
```

---

## Docker Commands Reference

```bash
# Build image
docker build -t YOUR_USERNAME/waey-backend:latest .

# Test locally
docker run -p 10000:10000 -e DATABASE_URL="your-mongodb-url" YOUR_USERNAME/waey-backend:latest

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push YOUR_USERNAME/waey-backend:latest

# View image
docker images YOUR_USERNAME/waey-backend

# Remove local image
docker rmi YOUR_USERNAME/waey-backend:latest
```

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| **Backend (Render)** | Free | $0/month |
| **Frontend (Vercel)** | Free | $0/month |
| **MongoDB Atlas** | M0 Free | $0/month |
| **Docker Hub** | Free | $0/month |

**Total: $0/month** ✅

---

## Free Tier Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| **Backend sleeps** | First request slow (30-50s) | Use UptimeRobot to ping every 10min |
| **750 hours/month** | Can't run 24/7 | Accept downtime or upgrade |
| **512MB RAM** | Limited memory | App is optimized for low memory |
| **Docker Hub pulls** | 100 pulls/6hrs (free) | Enough for personal use |

---

## URLs After Deployment

```
Backend API:    https://waey-backend.onrender.com
Health Check:   https://waey-backend.onrender.com/health
Frontend:       https://waey-frontend.onrender.com (or your Vercel URL)
Admin Panel:    https://waey-frontend.onrender.com/admin

Docker Hub:     https://hub.docker.com/r/YOUR_USERNAME/waey-backend
```

**Default Admin Login:**
- Email: `admin@waey.com`
- Password: `admin123`

**⚠️ Change password immediately after first login!**

---

## Support

- **Render Docs**: https://render.com/docs
- **Docker Hub**: https://docs.docker.com/docker-hub/
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/

---

## Success! 🎉

Your Waey platform is now live on Render via Docker Hub!

**Graduation Project Ready!** ✅
