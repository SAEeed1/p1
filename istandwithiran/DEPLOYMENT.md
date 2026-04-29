# DEPLOYMENT.md - Updated with Admin Panel instructions

## Deployment Guide for I Stand With Iran

### Prerequisites
- Linux VPS (Ubuntu/Debian recommended)
- Docker and Docker Compose installed
- Domain name pointing to your VPS IP
- SSL certificate (via Let's Encrypt)

### Quick Start

1. **Upload files to your VPS:**
   ```bash
   scp -r istandwithiran/* user@your-vps-ip:/opt/istandwithiran/
   cd /opt/istandwithiran/docker
   ```

2. **Configure environment variables:**
   ```bash
   # Copy and edit the environment file
   cp .env.example .env
   nano .env
   ```
   
   **IMPORTANT: Change these values in `.env`:**
   - `JWT_SECRET` - Generate a random string: `openssl rand -hex 32`
   - `ADMIN_USERNAME` - Your admin username
   - `ADMIN_PASSWORD` - Strong password for admin panel

3. **Get SSL Certificate:**
   ```bash
   sudo apt update && sudo apt install certbot -y
   sudo certbot certonly --standalone -d istandwithiran.org -d www.istandwithiran.org
   sudo mkdir -p /opt/istandwithiran/docker/ssl
   sudo cp /etc/letsencrypt/live/istandwithiran.org/*.pem /opt/istandwithiran/docker/ssl/
   ```

4. **Deploy with Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

5. **Verify deployment:**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

### Access Points

- **Public Website:** https://istandwithiran.org
- **Admin Panel:** https://istandwithiran.org/admin.html
  - Default credentials (CHANGE THESE!):
    - Username: `admin`
    - Password: `SecurePassword123!`

### API Endpoints

#### Public Endpoints
- `POST /api/support` - Submit supporter data
- `GET /api/stats` - Get supporter count

#### Admin Endpoints (Requires JWT Token)
- `POST /api/admin/login` - Admin login (returns JWT token)
- `GET /api/admin/supporters` - List all supporters
- `DELETE /api/admin/supporter/:id` - Delete a supporter
- `PATCH /api/admin/supporter/:id/verify` - Verify/unverify supporter
- `GET /api/admin/export/csv` - Export supporters as CSV

### Admin Panel Features

1. **Login:** Secure JWT-based authentication
2. **Dashboard:** View total, verified, and unverified supporter counts
3. **Table Management:**
   - Search by name or country
   - Filter by verification status
   - Pagination support
4. **Actions:**
   - Verify/Unverify entries
   - Delete spam entries
   - Export all data as CSV
5. **Security:**
   - Rate-limited login (5 attempts per 15 min)
   - Token expires after 8 hours
   - All admin routes protected

### Maintenance

**View logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f mongo
docker-compose logs -f nginx
```

**Restart services:**
```bash
docker-compose restart
```

**Update deployment:**
```bash
cd /opt/istandwithiran/docker
git pull  # if using git
docker-compose down
docker-compose up -d --build
```

**Backup database:**
```bash
docker exec istandwithiran-mongo mongodump --out /backup
```

### Security Notes

1. **Change default credentials immediately!**
2. Use a strong, unique `JWT_SECRET`
3. Keep SSL certificates renewed (Certbot auto-renewal recommended)
4. Monitor logs for suspicious activity
5. Consider adding IP whitelisting for admin panel access

### Troubleshooting

**Backend won't start:**
```bash
docker-compose logs backend
# Check MongoDB connection and environment variables
```

**SSL not working:**
```bash
# Verify certificate files exist
ls -la /opt/istandwithiran/docker/ssl/
# Check nginx config
docker-compose exec nginx nginx -t
```

**Database connection issues:**
```bash
docker-compose exec mongo mongosh
# Test connection from backend container
docker-compose exec backend node -e "require('mongoose').connect('mongodb://mongo:27017/istandwithiran').then(() => console.log('OK'))"
```
