# I Stand With Iran - Deployment Guide

## Overview
This guide explains how to deploy the "I Stand With Iran" campaign website on a Linux VPS using Docker.

## Prerequisites
- Linux VPS (Ubuntu 20.04+ recommended)
- Docker and Docker Compose installed
- Domain name pointing to your VPS IP
- SSL certificates (Let's Encrypt recommended)

## Project Structure
```
istandwithiran/
├── backend/           # Node.js Express API
│   ├── server.js      # Main server file
│   ├── package.json   # Dependencies
│   └── .env.example   # Environment template
├── frontend/          # Static HTML/CSS/JS
│   ├── index.html
│   ├── components/
│   └── styles/
├── docker/            # Docker configuration
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
└── locales/           # Translation files
```

## Quick Start

### 1. Clone/Upload Files to VPS
```bash
# On your VPS
mkdir -p /opt/istandwithiran
cd /opt/istandwithiran
# Upload project files here
```

### 2. Install Docker (if not installed)
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Setup SSL Certificates
```bash
# Install Certbot
sudo apt update
sudo apt install certbot

# Get certificates (replace with your domain)
sudo certbot certonly --standalone -d istandwithiran.org -d www.istandwithiran.org

# Copy certificates to project
sudo mkdir -p /opt/istandwithiran/docker/ssl
sudo cp /etc/letsencrypt/live/istandwithiran.org/fullchain.pem /opt/istandwithiran/docker/ssl/
sudo cp /etc/letsencrypt/live/istandwithiran.org/privkey.pem /opt/istandwithiran/docker/ssl/
```

### 4. Configure Environment
```bash
cd /opt/istandwithiran/backend
cp .env.example .env
# Edit .env if needed (default values work for Docker setup)
```

### 5. Deploy with Docker Compose
```bash
cd /opt/istandwithiran/docker
docker-compose up -d --build
```

### 6. Verify Deployment
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f backend

# Test API
curl http://localhost:3000/api/health
curl http://localhost:3000/api/stats
```

## Services

### MongoDB
- Container: `istandwithiran-mongo`
- Port: Internal only (not exposed)
- Data: Persisted in `mongo_data` volume

### Backend API
- Container: `istandwithiran-backend`
- Port: 3000 (internal, accessed via Nginx)
- Endpoints:
  - `POST /api/support` - Submit supporter data
  - `GET /api/stats` - Get supporter count
  - `GET /api/health` - Health check

### Nginx
- Container: `istandwithiran-nginx`
- Ports: 80 (HTTP), 443 (HTTPS)
- Features:
  - HTTPS with SSL
  - HTTP to HTTPS redirect
  - Rate limiting
  - Gzip compression
  - Security headers

## Management Commands

### Start/Stop/Restart
```bash
cd /opt/istandwithiran/docker
docker-compose start
docker-compose stop
docker-compose restart
```

### View Logs
```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f nginx
```

### Update Application
```bash
cd /opt/istandwithiran/docker
git pull  # if using git
docker-compose down
docker-compose up -d --build
```

### Backup Database
```bash
docker exec istandwithiran-mongo mongodump --out /backup
# Copy from container
docker cp istandwithiran-mongo:/backup ./mongodb-backup
```

### Restore Database
```bash
docker cp ./mongodb-backup istandwithiran-mongo:/restore
docker exec istandwithiran-mongo mongorestore /restore
```

## Security Features

1. **Rate Limiting**
   - API submissions: 5 per 15 minutes per IP
   - Stats endpoint: 30 per minute per IP
   - Nginx: Additional rate limiting

2. **SSL/TLS**
   - HTTPS enforced
   - TLS 1.2 and 1.3 supported
   - Modern cipher suites

3. **Security Headers**
   - X-Frame-Options
   - X-Content-Type-Options
   - X-XSS-Protection
   - Referrer-Policy

4. **Input Validation**
   - Name: 2-100 characters
   - Country: 2-100 characters
   - Server-side validation with express-validator

## Troubleshooting

### Backend won't start
```bash
docker-compose logs backend
# Check MongoDB is healthy first
docker-compose ps mongo
```

### SSL issues
```bash
# Verify certificates
sudo ls -la /etc/letsencrypt/live/istandwithiran.org/
# Renew certificates
sudo certbot renew
```

### Database connection errors
```bash
# Restart MongoDB
docker-compose restart mongo
# Wait for health check, then restart backend
docker-compose restart backend
```

### High traffic handling
- Adjust rate limits in `nginx.conf`
- Scale backend: `docker-compose up -d --scale backend=3`
- Consider adding Redis for caching

## Monitoring

### Container health
```bash
docker-compose ps
```

### API health endpoint
```bash
curl https://istandwithiran.org/api/health
```

### Database stats
```bash
docker exec -it istandwithiran-mongo mongosh
use istandwithiran
db.supporters.countDocuments()
```

## Support

For issues or questions:
1. Check container logs: `docker-compose logs -f`
2. Verify SSL certificates are valid
3. Ensure ports 80 and 443 are open in firewall
4. Check MongoDB health status

---

**Note**: This deployment uses production-ready configurations. For development, you can run without SSL and expose ports directly.
