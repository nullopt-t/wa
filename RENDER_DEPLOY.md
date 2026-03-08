# Waey Platform - Render Deployment Guide

Complete guide to deploy your graduation project on Render (100% free).

---

## What You'll Get (FREE)

- **Frontend**: Static site at `https://waey-frontend.onrender.com`
- **Backend**: API at `https://waey-backend.onrender.com`
- **MongoDB**: Free MongoDB Atlas
- **Cache**: In-memory (no Redis needed!)

**Total Cost: $0/month** ✅

---

## Quick Start (4 Steps)

### 1. Create MongoDB Atlas (Free)

1. Go to https://cloud.mongodb.com
2. Sign up → Create Cluster (M0 Free)
3. Database Access → Create User (save credentials!)
4. Network Access → Add `0.0.0.0/0`
5. Connect → Copy connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/waey?retryWrites=true&w=majority
   ```

### 2. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 3. Deploy on Render

1. Go to https://render.com → Sign up
2. **New +** → **Blueprint**
3. Connect GitHub repo
4. Select `render.yaml`
5. Click **Apply**

### 4. Add MongoDB URL

1. Render Dashboard → `waey-backend` → **Environment**
2. Edit `DATABASE_URL` → Paste MongoDB connection string
3. **Save Changes**

### 5. Wait & Access (5-10 min)

- Backend deploys first with auto-seed
- Frontend deploys after
- Access: `https://waey-frontend.onrender.com`

---

## What's Removed for Free Tier

✅ **No Redis** - Uses in-memory cache
✅ **No complex config** - Just MongoDB needed
✅ **Auto-seed** - Initial data on first deploy

---

## Pre-Deployment Checklist

### Update URLs for Production

In your code, update these URLs:

**frontend/.env** (create if not exists):
```env
VITE_API_URL=https://waey-backend.onrender.com
VITE_SOCKET_URL=https://waey-backend.onrender.com
```

**backend/.env** (create if not exists):
```env
CLIENT_URL=https://waey-frontend.onrender.com
CORS_ORIGINS=https://waey-frontend.onrender.com
```

### Test Locally

```bash
# Test production build
cd backend && npm run build
cd ../frontend && npm run build

# Run seed locally (optional)
cd backend && npm run seed
```

---

## Render Configuration

### render.yaml

Already configured with:
- ✅ Auto-seed on startup
- ✅ Health checks
- ✅ Redis integration
- ✅ Environment variables
- ✅ Service connections

### Build Commands

**Backend:**
```bash
npm install && npm run build
```

**Frontend:**
```bash
npm install && npm run build
```

**Start:**
```bash
npm run seed && npm run start
```

---

## Environment Variables

### Backend (Required)

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=mongodb+srv://...
REDIS_URL=auto-provided
JWT_SECRET=auto-generated
REFRESH_TOKEN_SECRET=auto-generated
CLIENT_URL=https://waey-frontend.onrender.com
CORS_ORIGINS=https://waey-frontend.onrender.com
```

### Backend (Optional)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
GEMINI_API_KEY=your-gemini-key
```

### Frontend

```env
VITE_API_URL=https://waey-backend.onrender.com
VITE_SOCKET_URL=https://waey-backend.onrender.com
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check backend health
curl https://waey-backend.onrender.com/health

# Check frontend
curl https://waey-frontend.onrender.com
```

### 2. Test Features

- ✅ User registration/login
- ✅ Community posts
- ✅ Stories (should have 5 seeded stories)
- ✅ Articles (2 seeded articles)
- ✅ Videos (2 seeded videos)
- ✅ Admin panel (login with seeded admin)

### 3. Admin Access

**Default Admin Account** (created by seed):
- Email: `admin@waey.com`
- Password: `admin123`

**⚠️ CHANGE THIS IMMEDIATELY** after first login!

---

## Troubleshooting

### Backend Won't Start

**Check Logs:**
1. Render Dashboard → `waey-backend` → **Logs**
2. Look for errors
3. Common issues:
   - MongoDB connection string wrong
   - MongoDB IP not whitelisted
   - Missing required env vars

**Fix:**
```bash
# Test MongoDB connection locally
node -e "require('mongoose').connect('YOUR_URL').then(() => console.log('OK'))"
```

### Frontend Blank Page

**Causes:**
- Backend not ready yet
- API URL wrong
- CORS issues

**Fix:**
1. Wait 5 minutes for backend
2. Check browser console (F12)
3. Verify `VITE_API_URL` in Render env vars

### "Cannot connect to API"

**Normal during deployment** - backend takes longer than frontend.

**Solution:**
- Wait 5-10 minutes
- Refresh frontend
- Check backend logs for errors

### Seed Script Fails

**Check:**
```bash
# Manual seed
docker exec <container-id> npm run seed

# Or via Render SSH
npm run seed
```

---

## Free Tier Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| **Sleep after 15min** | First request slow | Use UptimeRobot (free) |
| **750 hours/month** | Can't run 24/7 | Accept downtime or upgrade |
| **25MB Redis** | Limited cache | Enough for small app |
| **500 hours web service** | Shared across services | Monitor usage |

### Keep Service Awake (Optional)

Use [UptimeRobot](https://uptimerobot.com/) (free):
1. Sign up
2. Add monitor: `https://waey-backend.onrender.com/health`
3. Set interval: 5 minutes
4. Service stays awake!

---

## Scaling (When You Need It)

### Upgrade Paths

1. **Render Standard** ($7/month/service)
   - No sleep
   - More resources
   
2. **MongoDB Atlas** (Free → M10)
   - More storage
   - Better performance

3. **Redis** (Render Paid)
   - More memory
   - Persistence

### When to Upgrade

- Users complain about sleep
- >1000 monthly active users
- Need better performance
- Production critical app

---

## Security Checklist

- [ ] Changed admin password
- [ ] MongoDB IP restricted (if possible)
- [ ] JWT secrets rotated
- [ ] SMTP credentials secured
- [ ] CORS configured correctly
- [ ] Environment variables not in GitHub
- [ ] `.env` in `.gitignore`

---

## Useful Links

- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Render Pricing](https://render.com/pricing)
- [Render Status](https://status.render.com/)

---

## Support

**Issues?**
1. Check logs in Render dashboard
2. Review this guide
3. Search Render community
4. Contact Render support

**Graduate Project Success!** 🎓
