# Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Environment Configuration

#### Generate New Secrets
```bash
# Generate JWT secrets (64 bytes each)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

#### Backend .env Configuration
```env
# Environment
NODE_ENV=production

# Server
PORT=3000

# Database (use PostgreSQL or MySQL in production)
DATABASE_URL="postgresql://user:password@host:5432/cartify?schema=public"

# JWT - Use the generated secrets above
JWT_SECRET=<your-generated-64-byte-secret>
JWT_REFRESH_SECRET=<your-generated-64-byte-refresh-secret>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS - Set to your frontend domain
CORS_ORIGIN=https://yourdomain.com

# Server Base URL
BASE_URL=https://api.yourdomain.com

# Redis (recommended for production)
REDIS_URL=redis://your-redis-host:6379

# Admin credentials (optional - for initial setup only)
# ADMIN_PASSWORD=<strong-password-here>
```

#### Frontend .env Configuration
```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

### 2. Database Setup

```bash
# Install production database (PostgreSQL recommended)
# Update DATABASE_URL in .env

# Run migrations
cd backend
npm run prisma:generate
npm run prisma:migrate

# Seed database (optional - only if you want sample data)
# WARNING: Do NOT use in production with real data
npm run prisma:seed
```

---

### 3. Security Verification

#### Run Security Audit
```bash
cd backend
npm audit
# Should show: 0 vulnerabilities

cd ../frontend
npm audit
# Should show: 0 vulnerabilities
```

#### Verify Security Measures
- [x] CSRF protection enabled
- [x] Strong JWT secrets generated (64 bytes)
- [x] HTTPS enforcement enabled
- [x] Rate limiting configured
- [x] File upload security
- [x] Input validation
- [x] Security headers (Helmet)
- [x] CORS properly configured
- [x] No default/weak passwords

---

### 4. Build Applications

#### Backend
```bash
cd backend
npm install --production
npm run build
```

#### Frontend
```bash
cd frontend
npm install
npm run build
# Output will be in frontend/dist/
```

---

### 5. SSL/TLS Setup

#### Option A: Using Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d api.yourdomain.com
sudo certbot certonly --standalone -d yourdomain.com
```

#### Option B: Using Cloudflare
- Enable Cloudflare proxy
- Set SSL/TLS mode to "Full (strict)"
- Enable "Always Use HTTPS"

---

### 6. Redis Setup (Recommended)

#### Install Redis
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis

# Verify
redis-cli ping
# Should return: PONG
```

#### Configure Redis for Production
```bash
# Edit /etc/redis/redis.conf
sudo nano /etc/redis/redis.conf

# Set password
requirepass your-strong-redis-password

# Enable persistence
save 900 1
save 300 10
save 60 10000

# Restart Redis
sudo systemctl restart redis
```

#### Update Backend .env
```env
REDIS_URL=redis://:your-strong-redis-password@localhost:6379
```

---

### 7. Process Management

#### Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start dist/server.js --name cartify-api

# Configure auto-restart
pm2 startup
pm2 save

# Monitor
pm2 monit
pm2 logs cartify-api
```

#### PM2 Ecosystem File (backend/ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'cartify-api',
    script: './dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G'
  }]
};
```

---

### 8. Nginx Configuration

#### Install Nginx
```bash
sudo apt-get install nginx
```

#### Backend API Configuration (/etc/nginx/sites-available/cartify-api)
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        alias /path/to/cartify/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Frontend Configuration (/etc/nginx/sites-available/cartify-frontend)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /path/to/cartify/frontend/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Enable Sites
```bash
sudo ln -s /etc/nginx/sites-available/cartify-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/cartify-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### 9. Database Backups

#### Automated Backup Script (backup.sh)
```bash
#!/bin/bash

# Configuration
DB_NAME="cartify"
BACKUP_DIR="/backups/cartify"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump $DB_NAME | gzip > $BACKUP_DIR/cartify_$DATE.sql.gz

# Delete old backups
find $BACKUP_DIR -name "cartify_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: cartify_$DATE.sql.gz"
```

#### Setup Cron Job
```bash
# Make script executable
chmod +x backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /path/to/backup.sh >> /var/log/cartify-backup.log 2>&1
```

---

### 10. Monitoring & Logging

#### Error Tracking (Sentry)
```bash
# Install Sentry
npm install @sentry/node

# Add to backend/src/server.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Add error handler
app.use(Sentry.Handlers.errorHandler());
```

#### Log Management
```bash
# Create log directory
mkdir -p /var/log/cartify

# Configure log rotation (/etc/logrotate.d/cartify)
/var/log/cartify/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

#### Uptime Monitoring
- Set up UptimeRobot or Pingdom
- Monitor: https://api.yourdomain.com/health
- Alert on downtime

---

### 11. Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Verify
sudo ufw status
```

---

### 12. Performance Optimization

#### Enable Redis Caching
- Ensure REDIS_URL is set in .env
- Verify Redis is running
- Monitor cache hit rates

#### Database Optimization
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

#### CDN Setup (Optional)
- Use Cloudflare or AWS CloudFront
- Cache static assets
- Enable image optimization

---

## 🧪 Post-Deployment Testing

### 1. Health Check
```bash
curl https://api.yourdomain.com/health
# Should return: {"success":true,"message":"Server is healthy",...}
```

### 2. HTTPS Verification
```bash
curl -I https://yourdomain.com
# Check for: Strict-Transport-Security header
```

### 3. CSRF Protection
```bash
# Should fail without CSRF token
curl -X POST https://api.yourdomain.com/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId":"test","quantity":1}'
# Should return: 403 Forbidden
```

### 4. Rate Limiting
```bash
# Test rate limiting (should block after limit)
for i in {1..10}; do
  curl https://api.yourdomain.com/api/products
done
```

### 5. Authentication
```bash
# Test login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'
```

---

## 📊 Monitoring Checklist

### Daily
- [ ] Check error logs
- [ ] Monitor API response times
- [ ] Verify backup completion
- [ ] Check disk space

### Weekly
- [ ] Review security logs
- [ ] Check for npm updates
- [ ] Monitor database performance
- [ ] Review rate limiting effectiveness

### Monthly
- [ ] Run security audit (npm audit)
- [ ] Test backup restoration
- [ ] Review and update dependencies
- [ ] Performance optimization review

---

## 🚨 Rollback Plan

### If Issues Occur:

1. **Immediate Rollback**
```bash
# Stop current version
pm2 stop cartify-api

# Restore previous version
git checkout <previous-commit>
npm install
npm run build
pm2 restart cartify-api
```

2. **Database Rollback**
```bash
# Restore from backup
gunzip < /backups/cartify/cartify_YYYYMMDD_HHMMSS.sql.gz | psql cartify
```

3. **Notify Users**
- Post status update
- Send email notification if necessary

---

## 📞 Support Contacts

- **DevOps**: devops@yourdomain.com
- **Security**: security@yourdomain.com
- **On-Call**: +1-XXX-XXX-XXXX

---

## ✅ Final Checklist

- [ ] All environment variables configured
- [ ] New JWT secrets generated
- [ ] Database migrated and backed up
- [ ] Redis configured and running
- [ ] SSL/TLS certificates installed
- [ ] Nginx configured and running
- [ ] PM2 process manager configured
- [ ] Firewall rules applied
- [ ] Monitoring and alerting set up
- [ ] Backup automation configured
- [ ] Health checks passing
- [ ] Security tests passing
- [ ] Performance tests passing
- [ ] Documentation updated
- [ ] Team notified

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Version**: _____________
**Status**: ⬜ Success ⬜ Issues ⬜ Rolled Back

---

## 🎉 Post-Deployment

Congratulations! Your Cartify e-commerce platform is now live and secure.

**Next Steps**:
1. Monitor logs for first 24 hours
2. Gather user feedback
3. Plan next iteration
4. Celebrate! 🎊
