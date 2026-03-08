# Waey Platform - Production Deployment Guide

Complete guide for deploying the Waey mental health platform to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Configuration](#configuration)
4. [Deployment Options](#deployment-options)
5. [Post-Deployment](#post-deployment)
6. [Maintenance](#maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Storage | 20 GB | 50 GB SSD |
| Network | 100 Mbps | 1 Gbps |

### Software Requirements

- Docker 24.0+
- Docker Compose 2.20+
- Git
- Linux server (Ubuntu 22.04 LTS recommended)
- Domain name pointing to your server

---

## Server Setup

### 1. Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### 2. Clone the Repository

```bash
git clone <your-repository-url> /opt/waey
cd /opt/waey
```

---

## Configuration

### 1. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your production values:

```bash
nano .env
```

**Critical values to change:**

```env
# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 64)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 64)
REDIS_PASSWORD=$(openssl rand -base64 32)
MONGO_PASSWORD=$(openssl rand -base64 32)

# Update with your domain
CLIENT_URL=https://your-domain.com
CORS_ORIGINS=https://your-domain.com

# Email configuration
SMTP_HOST=smtp.your-provider.com
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-smtp-password
```

### 2. Update Domain in Nginx Config

```bash
nano nginx/nginx.conf
```

Replace `your-domain.com` with your actual domain in two places.

---

## Deployment Options

### Option A: Simple Deployment (Single Server)

Best for small to medium deployments.

```bash
# Deploy with production compose file
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Option B: With Nginx Reverse Proxy (Recommended)

Best for production with SSL termination.

```bash
# 1. Set up SSL first (see docs/SSL_SETUP.md)

# 2. Deploy with nginx
docker compose -f docker-compose.nginx.yml up -d --build

# 3. Check status
docker compose -f docker-compose.nginx.yml ps
```

### Option C: Direct Docker Compose (Quick Start)

Using the main docker-compose.yml (modify for production first):

```bash
# Edit docker-compose.yml to:
# - Remove exposed database ports
# - Add strong passwords
# - Update CORS origins

docker compose up -d --build
```

---

## Post-Deployment

### 1. Verify Services

```bash
# Check all containers are running
docker ps

# Check frontend
curl http://localhost:3000

# Check backend health
curl http://localhost:4000/health

# Check MongoDB
docker exec waey-mongo mongosh --eval "db.runCommand('ping')"

# Check Redis
docker exec waey-redis redis-cli ping
```

### 2. Seed Initial Data

```bash
# Seed admin user
docker exec waey-backend npm run seed:admin

# Seed categories
docker exec waey-backend npm run seed:categories

# Seed articles
docker exec waey-backend npm run seed:articles
```

### 3. Set Up Firewall

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Verify
sudo ufw status
```

### 4. Set Up Monitoring

```bash
# Install Docker monitoring
docker stats

# Install system monitoring
sudo apt install htop iotop -y
```

---

## Maintenance

### Backup Data

```bash
# Run backup script
./scripts/backup.sh
```

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

# Clean up old images
docker image prune -f
```

### View Logs

```bash
# All logs
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend

# Follow and tail
docker compose -f docker-compose.prod.yml logs -f --tail=100
```

### Restart Services

```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend
```

### Scale Services

```bash
# Scale backend to 3 instances
docker compose -f docker-compose.prod.yml up -d --scale backend=3
```

---

## Troubleshooting

### Common Issues

#### Backend won't start

```bash
# Check logs
docker logs waey-backend

# Verify database connection
docker exec waey-backend wget -qO- http://mongo:27017 || echo "Mongo not reachable"

# Check environment variables
docker exec waey-backend env | grep -E "DATABASE|REDIS"
```

#### Frontend shows blank page

```bash
# Check build output
docker exec waey-frontend ls -la /usr/share/nginx/html

# Check nginx config
docker exec waey-frontend nginx -t

# Check console for API errors
```

#### Database connection issues

```bash
# Check MongoDB status
docker exec waey-mongo mongosh --eval "db.stats()"

# Check network connectivity
docker network inspect waey-network

# Restart MongoDB
docker compose -f docker-compose.prod.yml restart mongo
```

#### High memory usage

```bash
# Check container stats
docker stats

# Limit resources in compose file (already configured)

# Consider adding swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Health Check Endpoints

| Service | Endpoint | Port |
|---------|----------|------|
| Backend | `/health` | 3000 |
| Frontend | `/` | 80 |
| MongoDB | N/A | 27017 |
| Redis | PING | 6379 |

---

## Security Checklist

- [ ] Changed all default passwords
- [ ] Generated strong JWT secrets
- [ ] Enabled firewall (UFW)
- [ ] Set up SSL/TLS
- [ ] Disabled root SSH login
- [ ] Set up regular backups
- [ ] Configured log rotation
- [ ] Removed exposed database ports
- [ ] Set up monitoring/alerts
- [ ] Reviewed CORS settings

---

## Support

For issues and questions:
- Check logs: `docker compose logs -f`
- Review documentation in `docs/`
- Contact: support@waey.com
