# Waey Platform - Render Deployment Guide

Quick deployment guide for your graduation project on Render (free tier).

---

## What You'll Get

- **Frontend**: Static site hosted at `https://waey-frontend.onrender.com`
- **Backend**: API at `https://waey-backend.onrender.com`
- **Redis**: Free 25MB cache
- **MongoDB**: You need to create free MongoDB Atlas account

**Total Cost: $0/month** (Free tier)

---

## Step-by-Step Instructions

### 1. Create MongoDB Atlas (Free)

1. Go to https://cloud.mongodb.com
2. Sign up for free
3. Create cluster (M0 Free tier)
4. Create database user (save username & password)
5. Network Access → Add `0.0.0.0/0` (allow all IPs)
6. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/waey?retryWrites=true&w=majority
   ```

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/waey.git
git push -u origin main
```

### 3. Deploy on Render

1. Go to https://render.com → Sign up
2. **New +** → **Blueprint**
3. Connect your GitHub repo
4. Select `render.yaml` file
5. Click **Apply**

### 4. Add MongoDB URL

1. In Render dashboard → `waey-backend` service
2. **Environment** tab
3. Edit `DATABASE_URL` → Paste your MongoDB connection string
4. **Save Changes**

### 5. Wait (~5 minutes)

- Backend builds first (~3-4 min)
- Frontend builds after (~2 min)
- Redis auto-provisions

### 6. Access Your App

Find frontend URL in Render dashboard:
```
https://waey-frontend.onrender.com
```

---

## Important Notes

### Free Tier Limitations
- Services sleep after 15 min inactivity
- First request takes ~30 sec to wake up
- 750 hours/month limit per service (enough for 1 service always-on)

### Environment Variables
Render automatically sets:
- `VITE_API_URL` → Backend URL
- `DATABASE_URL` → You add this
- `REDIS_URL` → Auto from Redis service
- `JWT_SECRET` → Auto-generated

---

## Troubleshooting

**Backend won't start**
- Check Logs tab in Render
- Verify MongoDB connection string
- Check MongoDB IP whitelist (0.0.0.0/0)

**Frontend blank page**
- Open browser console (F12)
- Check for API errors
- Wait for backend to finish deploying

**"Cannot connect to API"**
- Backend takes longer to deploy than frontend
- Refresh after 5 minutes

---

## Useful Commands

```bash
# Test locally before deploying
cd frontend && npm run build
cd backend && npm run build

# Check what files will be pushed
git status
```

---

## Support

- Render Docs: https://render.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
