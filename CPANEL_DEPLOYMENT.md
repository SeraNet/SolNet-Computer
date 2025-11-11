# CPanel Deployment Guide

This guide will help you deploy SolNet Management System to CPanel hosting.

## Prerequisites

- Node.js 18+ installed on your CPanel hosting
- PostgreSQL database access (local or remote)
- SSH access to your CPanel account (recommended)

## CPanel Deployment Steps

### 1. SSH into Your Server

Connect to your CPanel hosting via SSH:

```bash
ssh your-username@your-cpanel-host
```

**For Ouzo HostNS (ouzo.hostns.io):**
1. Log into your CPanel at https://ouzo.hostns.io/
2. Find "SSH Access" under **Security** or **Advanced**
3. Look for your SSH credentials (hostname, username, port)
4. Connect using: `ssh username@ouzo.hostns.io` (or the exact SSH host shown)

**Note:** If SSH is not enabled, you can:
- Request it via cPanel
- Or use cPanel's **Terminal** instead (found in cPanel's web interface)

### 2. Navigate to Your Domain Directory

```bash
cd ~/public_html  # or your domain's directory
```

### 3. Upload Your Project Files

You can use one of the following methods:

**Option A: Using SCP (from your local machine)**
```bash
# Build the project first
npm run build

# Upload via SCP
scp -r dist/* your-username@your-host:~/public_html/
scp package.json your-username@your-host:~/public_html/
scp .env your-username@your-host:~/public_html/
```

**Option B: Using Git**
```bash
# Clone your repository
git clone https://your-repo-url.git .
git checkout production

# Install dependencies
npm install --production

# Build the project
npm run build
```

**Option C: Using CPanel File Manager**
1. Log into CPanel
2. Go to File Manager
3. Navigate to your domain's directory
4. Upload your built files

### 4. Configure Environment Variables

Create a `.env` file in your domain's root directory:

```bash
nano .env
```

Add the following configuration:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Security Secrets (Generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
SESSION_SECRET=your-super-secret-session-key-min-32-characters

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration (Your domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security Settings
ENABLE_DEBUG_LOGS=false
VITE_ENABLE_DEBUG_LOGS=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
HELMET_ENABLED=true
CONTENT_SECURITY_POLICY=true

# SMS Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_FROM_NUMBER=+1234567890

# Ethiopian SMS (Optional)
ETHIOPIAN_SMS_USERNAME=your_username
ETHIOPIAN_SMS_API_KEY=your_api_key
ETHIOPIAN_SMS_SENDER_ID=SolNet
ETHIOPIAN_SMS_BASE_URL=https://sms.provider.et/api/send
```

**Important:** Never commit the `.env` file to version control!

### 5. Install Production Dependencies

```bash
npm install --production
```

### 6. Set Up .htaccess File

Copy the `.htaccess` file from the `public/` directory to your root directory:

```bash
cp public/.htaccess ~/public_html/
```

### 7. Configure CPanel Node.js Application

1. Log into CPanel
2. Go to "Node.js Selector"
3. Click "Create Application"
4. Configure:
   - **Node.js Version**: Latest LTS (18 or 20)
   - **Application Mode**: Production
   - **Application Root**: `public_html`
   - **Application URL**: `/` or `/api`
   - **Application Startup File**: `dist/server/index.js`
   - **Environment Variables**: Load from `.env` file

Or use the command line:

```bash
cpanel-node-version-selector --set-version 20
```

### 8. Set Up Application Runner Script

Create a `server.js` file in your root directory for CPanel:

```javascript
#!/usr/bin/env node
// CPanel Entry Point
require('dotenv').config();
require('./dist/server/index.js');
```

Make it executable:

```bash
chmod +x server.js
```

### 9. Start the Application

**Option A: Using PM2 (Recommended)**

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start dist/server/index.js --name solnet-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

**Option B: Using CPanel Node.js App**

1. Go to CPanel Node.js Selector
2. Click on your application
3. Click "Start App"

**Option C: Using nohup (Simple)**

```bash
nohup node dist/server/index.js > logs/app.log 2>&1 &
```

### 10. Configure Apache/Nginx (If Needed)

If your hosting provider uses Apache with Passenger or similar:

Create or update `.htaccess` in your root:

```apache
PassengerNodejs /opt/cpanel/ea-nodejs*/bin/node
PassengerAppRoot /home/username/public_html
PassengerAppType node
PassengerStartupFile dist/server/index.js
```

### 11. Set Up Database

#### Local PostgreSQL (If available)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE solnetmanage;

# Create user
CREATE USER solnetuser WITH ENCRYPTED PASSWORD 'secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE solnetmanage TO solnetuser;

# Exit
\q
```

#### Run Migrations

```bash
# Make sure .env is configured with DATABASE_URL
npm run db:migrate
npm run db:verify
```

### 12. Set Permissions

```bash
# Set correct permissions
chmod 755 ~/public_html
chmod 644 ~/public_html/.env
chmod 755 ~/public_html/dist/server/index.js

# Create uploads directory with write permissions
mkdir -p ~/public_html/uploads
chmod 755 ~/public_html/uploads
```

### 13. Verify Deployment

Test your deployment:

```bash
# Check if the server is running
curl http://localhost:5000/api/test

# Check from your domain
curl https://yourdomain.com/api/test
```

Expected response:
```json
{
  "message": "Server is working",
  "timestamp": "..."
}
```

## Common Issues and Solutions

### Issue 1: "Cannot find module" errors

**Solution**: Make sure you've run `npm install --production` in the correct directory.

```bash
cd ~/public_html
npm install --production
```

### Issue 2: Port already in use

**Solution**: Check what's using the port and either stop it or change the PORT in `.env`:

```bash
# Check what's using port 5000
lsof -i :5000

# Change PORT in .env
PORT=5001
```

### Issue 3: Database connection failed

**Solution**: Verify your DATABASE_URL is correct:

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"
```

### Issue 4: Static files not loading (404 errors)

**Solution**: Verify the `dist/public` directory exists and `.htaccess` is configured:

```bash
ls -la ~/public_html/dist/public/
cat ~/public_html/.htaccess
```

### Issue 5: CORS errors

**Solution**: Add your domain to CORS_ORIGINS in `.env`:

```bash
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://api.yourdomain.com
```

### Issue 6: Permission denied

**Solution**: Fix file permissions:

```bash
chmod 755 ~/public_html
chmod 644 ~/public_html/.env
chmod 755 ~/public_html/uploads
```

### Issue 7: "JWT_SECRET must be set" error

**Solution**: Generate a strong secret and add to `.env`:

```bash
# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Add to .env
JWT_SECRET=your-generated-secret-here
```

### Issue 8: HTTPS/SSL issues

**Solution**: Configure SSL in CPanel:
1. Go to "SSL/TLS Status"
2. Install Let's Encrypt certificate
3. Ensure SESSION_COOKIE_SECURE=true in `.env`

## Maintenance

### Viewing Logs

```bash
# PM2 logs
pm2 logs solnet-api

# Application logs
tail -f logs/app.log
tail -f logs/error.log
```

### Updating the Application

```bash
# Pull latest changes
git pull origin production

# Install dependencies
npm install --production

# Rebuild
npm run build

# Restart application
pm2 restart solnet-api
```

### Backing Up

```bash
# Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Backup configuration
cp .env .env.backup
```

## Security Checklist

- [ ] `.env` file is not publicly accessible (chmod 600)
- [ ] Strong JWT_SECRET set (32+ characters)
- [ ] Strong SESSION_SECRET set (32+ characters)
- [ ] CORS_ORIGINS limited to your domains
- [ ] HTTPS/SSL enabled
- [ ] Database uses strong password
- [ ] Debug logs disabled in production
- [ ] Rate limiting enabled
- [ ] File upload directory has proper permissions
- [ ] Regular backups configured
- [ ] Dependencies updated (`npm audit`)

## Performance Optimization

### Enable Caching

The `.htaccess` file includes caching headers for static assets.

### Use PM2 Cluster Mode

```bash
pm2 start dist/server/index.js --name solnet-api -i max
```

### Database Connection Pooling

Ensure your DATABASE_URL includes connection pooling parameters.

### Monitor Resources

```bash
# Check memory usage
free -m

# Check disk space
df -h

# Monitor PM2
pm2 monit
```

## Support

For additional help:
1. Check the main [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Review [README.md](./README.md)
3. Check application logs: `pm2 logs solnet-api`
4. Contact your CPanel hosting provider

## Quick Reference

| Task | Command |
|------|---------|
| Build application | `npm run build` |
| Start application | `pm2 start dist/server/index.js --name solnet-api` |
| Stop application | `pm2 stop solnet-api` |
| Restart application | `pm2 restart solnet-api` |
| View logs | `pm2 logs solnet-api` |
| Check status | `pm2 status` |
| Backup database | `pg_dump $DATABASE_URL > backup.sql` |
| Run migrations | `npm run db:migrate` |

---

**Deployment successful!** Your SolNet Management System should now be running at https://yourdomain.com

