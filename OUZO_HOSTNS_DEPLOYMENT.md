# Ouzo HostNS Deployment Guide

This guide is specifically for deploying to **Ouzo HostNS (ouzo.hostns.io)**.

**Important Server Info:**
- **CPanel URL:** https://ouzo.hostns.io/
- **SSH Server:** ns2.hostns.io (use for SSH commands, not ouzo.hostns.io)

## 🔐 Accessing Your CPanel

1. Go to https://ouzo.hostns.io/
2. Log in with your credentials
3. You should see your CPanel dashboard

## 🔧 Finding SSH/Terminal Access

Ouzo HostNS provides multiple ways to run commands:

### Option 1: CPanel Terminal (Easiest)
1. In CPanel, look for **"Terminal"** or **"Advanced Terminal"**
2. Click to open a web-based terminal
3. You're ready to run commands!

### Option 2: SSH Access (Advanced)

⚠️ **Important:** Ouzo HostNS may require SSH key authentication instead of passwords.

**Server:** Use `ns2.hostns.io` instead of `ouzo.hostns.io` for SSH

**If you get "Permission denied (publickey)" error:**

This means SSH key authentication is required. You have two options:

**Solution A: Use CPanel Terminal Instead (Easier)**
- Just use Option 1 (CPanel Terminal) above - no SSH setup needed!

**Solution B: Set Up SSH Keys (Advanced)**

1. **Generate SSH Key on Your Computer:**
   
   **Windows:**
   ```powershell
   # Generate SSH key
   ssh-keygen -t ed25519 -C "your-email@example.com"
   # Press Enter to accept default location
   # Choose a passphrase or press Enter for no passphrase
   ```

   **Mac/Linux:**
   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```

2. **Copy Your Public Key:**
   
   **Windows:**
   ```powershell
   # Display your public key
   cat ~/.ssh/id_ed25519.pub
   # Or if using older key:
   cat ~/.ssh/id_rsa.pub
   ```
   
   **Mac/Linux:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

3. **Add Key to Ouzo HostNS:**
   - Log into CPanel at https://ouzo.hostns.io/
   - Go to **"SSH Access"** or **"Manage SSH Keys"**
   - Click **"Import Key"** or **"Add Key"**
   - Paste your public key
   - Click **"Import"** or **"Add"**

4. **Connect via SSH:**
   ```bash
   ssh solnet@ns2.hostns.io
   ```

**Note:** If SSH access isn't working, just use **CPanel Terminal** (Option 1) - it's easier and doesn't require SSH setup!

## 📁 Finding Your Domain Directory

In CPanel, your files are typically in:

```bash
cd ~/public_html                    # For main domain
cd ~/public_html/your-subdomain     # For subdomain
```

Or use File Manager in CPanel to navigate and find your exact path.

## 🚀 Deployment Steps for Ouzo HostNS

### Step 1: Build Your Application Locally

On your local computer:
```bash
npm run build
```

### Step 2: Upload Files via CPanel File Manager

1. In CPanel, click **"File Manager"**
2. Navigate to `public_html` (or your domain directory)
3. Click **"Upload"**
4. Upload these files/folders:
   - `dist/` (entire folder)
   - `package.json`
   - `package-lock.json`
   - `public/.htaccess`
5. After upload, extract any archives if needed

### Step 3: Configure Environment Variables

**Method 1: Using CPanel Terminal**
1. Open **Terminal** in CPanel
2. Navigate to your directory:
   ```bash
   cd ~/public_html
   ```
3. Create .env file:
   ```bash
   nano .env
   ```
4. Paste your configuration (see below)
5. Press `Ctrl+X`, then `Y`, then `Enter` to save

**Method 2: Using File Manager**
1. In File Manager, click **"New File"**
2. Name it `.env`
3. Click to edit it
4. Paste your configuration
5. Save

**Your .env file should contain:**
```bash
# Database (REQUIRED)
# Get these from CPanel > PostgreSQL Databases
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Security Secrets (REQUIRED)
# Generate random 32+ character strings
JWT_SECRET=your-super-secret-jwt-key-32-characters-minimum
SESSION_SECRET=your-super-secret-session-key-32-characters

# Server Settings
PORT=5000
NODE_ENV=production

# CORS - Replace with YOUR actual domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security
ENABLE_DEBUG_LOGS=false
VITE_ENABLE_DEBUG_LOGS=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
HELMET_ENABLED=true
CONTENT_SECURITY_POLICY=true
```

### Step 4: Set Up Database

1. In CPanel, go to **"PostgreSQL Databases"**
2. Create a new database and user
3. Note down the credentials
4. Update your `.env` file with the `DATABASE_URL`

### Step 5: Install Node.js Dependencies

In CPanel Terminal:
```bash
cd ~/public_html
npm install --production
```

### Step 6: Run Database Migrations

```bash
npm run db:migrate
npm run db:verify
```

### Step 7: Configure CPanel Node.js Application

1. In CPanel, find **"Node.js Selector"** or **"Node.js App"**
2. Click **"Create Application"**
3. Configure:
   - **Node.js Version:** Latest LTS (18 or 20)
   - **Application Mode:** Production
   - **Application Root:** `/home/username/public_html`
   - **Application URL:** `/` or leave default
   - **Application Startup File:** `dist/server/index.js`
   - **Environment Variables:** Load from `.env` file
4. Click **"Create"**
5. Click **"Start App"**

### Step 8: Set Permissions

In CPanel Terminal:
```bash
chmod 755 ~/public_html
chmod 644 ~/public_html/.env
chmod 755 ~/public_html/dist/server/index.js

# Create uploads directory
mkdir -p ~/public_html/uploads
chmod 755 ~/public_html/uploads
```

### Step 9: Verify Deployment

Test your deployment:
```bash
# Check if server is running
curl http://localhost:5000/api/test

# Should return: {"message":"Server is working","timestamp":"..."}
```

Or visit your domain in a browser: `https://yourdomain.com`

## 🐛 Troubleshooting for Ouzo HostNS

### Issue: "Terminal" not found in CPanel

**Solution:** Look for:
- **"Advanced Terminal"**
- **"SSH Access"** (may have terminal link)
- **"Terminal"** under Developer Tools

### Issue: "Permission denied (publickey)"

**This means SSH requires key authentication.**

**Easiest Solution:** Use **CPanel Terminal** instead (see Option 1 at the top of this guide)

**OR Set Up SSH Keys:**

1. **Generate SSH key on your computer:**
   ```powershell
   ssh-keygen -t ed25519 -C "your-email@example.com"
   # Press Enter to accept defaults
   ```

2. **Copy your public key:**
   ```powershell
   cat ~/.ssh/id_ed25519.pub
   ```

3. **Add key in CPanel:**
   - Login to https://ouzo.hostns.io/
   - Go to **SSH Access** → **Manage SSH Keys**
   - Click **Import Key** or **Add Key**
   - Paste your public key
   - Click **Import**

4. **Try SSH again:**
   ```bash
   ssh solnet@ns2.hostns.io
   ```

### Issue: SSH not enabled

**Solution:**
1. Look for **"SSH Access"** in Security section
2. Click **"Manage SSH Keys"** or **"Enable SSH"**
3. If not available, request it from support or use File Manager + Node.js Selector
4. **Or just use CPanel Terminal instead** (easiest option)

### Issue: "Permission denied" errors

**Solution:**
```bash
chmod 755 ~/public_html
chmod 644 ~/public_html/.env
chmod 755 ~/public_html/uploads
```

### Issue: Database connection fails

**Solutions:**
1. Verify database credentials in `.env` match CPanel PostgreSQL Databases
2. Check if database exists: CPanel > PostgreSQL Databases
3. Ensure database user has proper permissions
4. Try connecting from CPanel Terminal:
   ```bash
   psql -U username -d database_name
   ```

### Issue: Node.js version mismatch

**Solution:**
1. In CPanel Node.js Selector, check available versions
2. Use version 18 or 20 (LTS recommended)
3. Recreate your Node.js app if needed

### Issue: "Cannot find module"

**Solution:**
```bash
cd ~/public_html
npm install --production
```

### Issue: Port conflicts

**Solution:**
1. In your `.env`, change PORT to a different number
2. Ouzo may have specific port requirements - check with support
3. Update your Node.js app configuration in CPanel

### Issue: Static files not loading

**Solution:**
```bash
# Verify .htaccess is in the right place
cp public/.htaccess dist/public/.htaccess

# Check file permissions
chmod 644 dist/public/.htaccess
```

## 🔒 Security for Ouzo HostNS

### Protect Your .env File

```bash
# Set restrictive permissions on .env
chmod 600 ~/public_html/.env

# Verify
ls -la ~/public_html/.env
# Should show: -rw------- (only you can read/write)
```

### Enable HTTPS/SSL

1. In CPanel, go to **"SSL/TLS Status"**
2. Install Let's Encrypt certificate (free)
3. Ensure HTTPS redirects are enabled

### Set Up Firewall Rules

If Ouzo provides firewall access:
- Allow ports 80 (HTTP) and 443 (HTTPS)
- Block direct access to Node.js port if not needed

## 📊 Monitoring Your Deployment

### View Logs

**Option 1: CPanel Terminal**
```bash
# If using PM2
pm2 logs solnet-api

# Application logs
tail -f logs/app.log
```

**Option 2: CPanel Logs**
- Check **"Errors"** or **"Error Log"** in CPanel
- Look for PHP errors or general error logs

### Check Application Status

```bash
# Check if Node.js app is running
pm2 status

# Or check the CPanel Node.js Selector dashboard
```

## 🔄 Updating Your Application

### Minor Updates

1. Upload new files via File Manager
2. In Terminal:
   ```bash
   cd ~/public_html
   npm install --production
   npm run build
   ```
3. Restart Node.js app in CPanel Node.js Selector

### Major Updates

1. Backup your database and files
2. Follow the deployment steps again
3. Test thoroughly before making live

## 📞 Getting Help

### Ouzo HostNS Support
- Check their knowledge base/documentation
- Contact support through CPanel or their website
- Check for any service-specific deployment guides

### Application Issues
- Check logs: `pm2 logs solnet-api`
- Review error logs in CPanel
- See main [CPANEL_DEPLOYMENT.md](./CPANEL_DEPLOYMENT.md)

## ✅ Post-Deployment Checklist

After deploying, verify:

- [ ] CPanel login works
- [ ] Terminal/SSH access works
- [ ] Database created and credentials saved
- [ ] `.env` file configured correctly
- [ ] Node.js dependencies installed
- [ ] Database migrations completed
- [ ] Node.js app started in CPanel
- [ ] Can access https://yourdomain.com
- [ ] API endpoints respond
- [ ] Can login with admin account
- [ ] Static assets load properly
- [ ] File uploads work (test with small file)
- [ ] HTTPS redirects properly

## 🎉 Success!

Your SolNet Management System is now running on Ouzo HostNS!

---

**Need more help?** See the main [CPANEL_DEPLOYMENT.md](./CPANEL_DEPLOYMENT.md) guide or [QUICK_CPANEL_DEPLOY.md](./QUICK_CPANEL_DEPLOY.md) for quick reference.

**Hosting Provider:** Ouzo HostNS - https://ouzo.hostns.io/

