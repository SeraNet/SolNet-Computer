# SolNet Management System - Deployment Guide

> Complete guide for deploying SolNetManage4 to production environments

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Post-Deployment](#post-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

### System Requirements

- [ ] Server with Node.js 18+ installed
- [ ] PostgreSQL 14+ database accessible
- [ ] Minimum 2GB RAM, 10GB disk space
- [ ] SSL certificate for HTTPS (recommended)
- [ ] Domain name configured
- [ ] Backup system in place

### Code Preparation

- [ ] All tests passing: `npm run check`
- [ ] Production build successful: `npm run build`
- [ ] No linter errors
- [ ] All migrations tested in staging
- [ ] Environment variables documented

### Security Audit

- [ ] JWT_SECRET is strong and unique (32+ characters)
- [ ] Database credentials are secure
- [ ] CORS origins limited to production domains
- [ ] Debug logs disabled
- [ ] Rate limiting enabled
- [ ] File upload validation active

---

## Environment Setup

### 1. Create Production Environment File

```bash
cp env.production.template .env
```

### 2. Configure Required Variables

**Critical Security Settings**:
```bash
# Generate strong secrets
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Database (use your production database URL)
DATABASE_URL=postgresql://username:password@production-db-host:5432/solnetmanage

# CORS (your production domains only)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Server
PORT=5000
NODE_ENV=production

# Disable debug logging
ENABLE_DEBUG_LOGS=false
VITE_ENABLE_DEBUG_LOGS=false
```

**Optional SMS Configuration**:
```bash
# For Ethiopian SMS providers
ETHIOPIAN_SMS_USERNAME=your_username
ETHIOPIAN_SMS_API_KEY=your_api_key
ETHIOPIAN_SMS_SENDER_ID=YourBrand
ETHIOPIAN_SMS_BASE_URL=https://sms.provider.et/api/send

# Or use Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+251900000000
```

### 3. Verify Environment Configuration

```bash
# Check that required variables are set
node -e "require('dotenv').config(); console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'); console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');"
```

---

## Database Setup

### 1. Create Production Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE solnetmanage;
CREATE USER solnetuser WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE solnetmanage TO solnetuser;

# Exit psql
\q
```

### 2. Run Migrations

```bash
# Run all migrations
npm run db:migrate

# Verify tables created
npm run db:verify
```

### 3. Apply Performance Indexes

```bash
# Run performance index migration
psql -U solnetuser -d solnetmanage -f migrations/add_performance_indexes.sql

# Verify indexes
psql -U solnetuser -d solnetmanage -c "SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;"
```

### 4. Create SMS Queue Table

```bash
# Run SMS queue migration
psql -U solnetuser -d solnetmanage -f migrations/add_sms_queue.sql
```

### 5. Create Initial Admin User

```bash
# Connect to database
psql -U solnetuser -d solnetmanage

# Create admin user (update with your details)
INSERT INTO users (id, username, password, role, email, is_active, location_id)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2a$10$YourHashedPasswordHere',  -- Generate with bcrypt
  'admin',
  'admin@yourdomain.com',
  true,
  (SELECT id FROM locations LIMIT 1)
);

# Exit
\q
```

**Generate password hash**:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourPassword123', 10));"
```

---

## Application Deployment

### Option A: PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Build the application
npm run build

# Start with PM2
pm2 start dist/index.js --name solnet-api

# Setup PM2 to start on boot
pm2 startup
pm2 save
```

**PM2 Management Commands**:
```bash
pm2 status           # Check status
pm2 logs solnet-api  # View logs
pm2 restart solnet-api  # Restart
pm2 stop solnet-api  # Stop
pm2 delete solnet-api  # Remove
```

### Option B: Docker

```bash
# Build Docker image
docker build -t solnet-manage .

# Run container
docker run -d \
  --name solnet-app \
  -p 5000:5000 \
  --env-file .env \
  solnet-manage

# Or use docker-compose
docker-compose up -d
```

### Option C: Systemd Service

Create `/etc/systemd/system/solnet.service`:

```ini
[Unit]
Description=SolNet Management System
After=network.target postgresql.service

[Service]
Type=simple
User=solnet
WorkingDirectory=/var/www/solnet
Environment="NODE_ENV=production"
EnvironmentFile=/var/www/solnet/.env
ExecStart=/usr/bin/node /var/www/solnet/dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable solnet
sudo systemctl start solnet
sudo systemctl status solnet
```

### Nginx Reverse Proxy (Recommended)

Create `/etc/nginx/sites-available/solnet`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase upload size for file uploads
    client_max_body_size 10M;
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/solnet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Post-Deployment

### 1. Verify Application is Running

```bash
# Check server is responding
curl http://localhost:5000/api/test

# Expected response:
# {"message":"Server is working","timestamp":"..."}
```

### 2. Run Health Checks

```bash
# Check database connection
curl http://yourdomain.com/api/auth/verify

# Check SMS queue processor
tail -f logs/app.log | grep "SMS processor"
```

### 3. Test Critical Functions

- [ ] Login with admin account
- [ ] Create a test customer
- [ ] Register a test device
- [ ] Process a sale
- [ ] Send a test SMS
- [ ] View analytics dashboard
- [ ] Test import functionality (dry-run)

### 4. Configure Backups

```bash
# Create backup script
cat > /usr/local/bin/backup-solnet.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/solnet"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
pg_dump -U solnetuser solnetmanage > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/solnet/uploads

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/backup-solnet.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-solnet.sh") | crontab -
```

---

## Monitoring & Maintenance

### Application Logs

```bash
# PM2 logs
pm2 logs solnet-api --lines 100

# Systemd logs
journalctl -u solnet -f

# Application log files
tail -f logs/app.log
tail -f logs/error.log
```

### Database Monitoring

```bash
# Check database size
psql -U solnetuser -d solnetmanage -c "SELECT pg_size_pretty(pg_database_size('solnetmanage'));"

# Check table sizes
psql -U solnetuser -d solnetmanage -c "SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::text)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(tablename::text) DESC;"

# Monitor slow queries
npx tsx scripts/analyze-query-performance.ts
```

### SMS Queue Monitoring

```bash
# Check queue stats via API
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/sms/queue/stats

# View failed SMS
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:5000/api/sms/queue?status=failed"
```

### Performance Metrics

```bash
# Check index usage
psql -U solnetuser -d solnetmanage -f scripts/check-index-usage.sql

# Monitor memory usage
pm2 monit

# Check response times
tail -f logs/app.log | grep "in [0-9]*ms"
```

---

## Rollback Procedures

### Application Rollback

```bash
# If using PM2
pm2 stop solnet-api
cd /var/www/solnet
git checkout previous-stable-tag
npm install
npm run build
pm2 start solnet-api
```

### Database Rollback

```bash
# Restore from backup
psql -U solnetuser -d solnetmanage < /backups/solnet/db_YYYYMMDD_HHMMSS.sql

# Or drop and recreate
dropdb solnetmanage
createdb solnetmanage
psql -U solnetuser -d solnetmanage < backup.sql
```

### Quick Rollback Script

```bash
#!/bin/bash
# rollback.sh

echo "Starting rollback..."

# Stop application
pm2 stop solnet-api

# Restore database
psql -U solnetuser -d solnetmanage < /backups/solnet/latest.sql

# Restore code
cd /var/www/solnet
git checkout v1.0.0  # Previous stable version
npm install
npm run build

# Restart
pm2 start solnet-api

echo "Rollback complete"
```

---

## Common Deployment Issues

### Issue: Build fails with TypeScript errors
**Solution**: Run `npm run check` locally first, fix all errors before deploying

### Issue: Database migrations fail
**Solution**: 
- Check database connectivity
- Verify migration files are valid SQL
- Run migrations one at a time to identify issues

### Issue: Application crashes on startup
**Solution**:
- Check `JWT_SECRET` is set correctly
- Verify database connection string
- Review logs: `pm2 logs solnet-api --err`

### Issue: 502 Bad Gateway (Nginx)
**Solution**:
- Verify app is running: `pm2 status`
- Check port 5000 is accessible: `netstat -tulpn | grep 5000`
- Review Nginx error log: `tail -f /var/log/nginx/error.log`

---

## Security Best Practices

### 1. Environment Variables
- **Never commit** `.env` files to version control
- Use different secrets for each environment
- Rotate JWT_SECRET periodically (requires user re-login)

### 2. Database Security
- Use strong passwords (16+ characters)
- Enable SSL for database connections in production
- Limit database user permissions
- Regular security updates

### 3. Application Security
- Keep dependencies updated: `npm audit`
- Monitor for security advisories
- Use HTTPS only in production
- Enable firewall rules
- Regular penetration testing

### 4. Backup Strategy
- Daily automated backups
- Test restore procedures monthly
- Store backups offsite
- Encrypt backup files

---

## Performance Optimization

### 1. Database Optimization

```bash
# Run VACUUM to reclaim space
psql -U solnetuser -d solnetmanage -c "VACUUM ANALYZE;"

# Update statistics
psql -U solnetuser -d solnetmanage -c "ANALYZE;"

# Check for missing indexes
npx tsx scripts/analyze-query-performance.ts
```

### 2. Application Optimization

```bash
# Enable PM2 cluster mode for load balancing
pm2 start dist/index.js --name solnet-api -i 2  # 2 instances

# Monitor memory and optimize
pm2 monit
```

### 3. Caching Strategy

Consider adding Redis for:
- Session storage
- API response caching
- Real-time analytics

---

## Scaling Considerations

### Horizontal Scaling

```bash
# Run multiple instances with PM2 cluster mode
pm2 start dist/index.js --name solnet-api -i max

# Or use Docker Swarm/Kubernetes for container orchestration
```

### Database Scaling

- Read replicas for analytics queries
- Connection pooling (pgBouncer)
- Partitioning for large tables

### Load Balancing

- Nginx load balancing across multiple app instances
- Database read/write splitting
- CDN for static assets

---

## Monitoring Checklist

Set up monitoring for:

- [ ] Application uptime (UptimeRobot, Pingdom)
- [ ] Error rates (Sentry, LogRocket)
- [ ] Database performance
- [ ] Disk space usage
- [ ] SSL certificate expiration
- [ ] Backup completion
- [ ] SMS delivery rates

---

## Maintenance Schedule

### Daily
- Check application logs for errors
- Monitor SMS queue for failures
- Verify backups completed

### Weekly
- Review performance metrics
- Check for failed imports
- Clean up old logs

### Monthly
- Update dependencies (security patches)
- Review and optimize slow queries
- Test backup restore procedure
- Review user feedback

### Quarterly
- Full security audit
- Performance optimization review
- Capacity planning
- Disaster recovery drill

---

## Support & Troubleshooting

### Quick Diagnostics

```bash
# Check application status
pm2 status

# Check database connectivity
psql -U solnetuser -d solnetmanage -c "SELECT version();"

# View recent errors
pm2 logs solnet-api --err --lines 50

# Check disk space
df -h

# Check memory
free -m
```

### Emergency Contacts

- System Administrator: [contact info]
- Database Administrator: [contact info]
- On-call Support: [contact info]

---

## Deployment Checklist

Use this checklist for each deployment:

### Pre-Deployment
- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] Staging environment tested
- [ ] Backup created
- [ ] Rollback plan prepared
- [ ] Stakeholders notified

### Deployment
- [ ] Maintenance window scheduled
- [ ] Put site in maintenance mode (if needed)
- [ ] Pull latest code / deploy build
- [ ] Install dependencies
- [ ] Run database migrations
- [ ] Update environment variables
- [ ] Build application
- [ ] Restart services
- [ ] Verify health checks pass

### Post-Deployment
- [ ] Smoke tests completed
- [ ] Critical features tested
- [ ] Monitor logs for 30 minutes
- [ ] No errors in error logs
- [ ] SMS queue processing
- [ ] Analytics loading correctly
- [ ] Stakeholders notified of completion
- [ ] Document any issues encountered

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | Oct 2025 | Security fixes, SMS queue, validation, performance |
| 1.0 | - | Initial release |

---

**Need Help?** Contact your system administrator or refer to README.md for troubleshooting.
















