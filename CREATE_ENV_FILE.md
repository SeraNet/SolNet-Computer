# Create .env File in CPanel File Manager

**Current issue:** Your `.env` file is missing, which causes the 503 error.

---

## 🚨 Quick Fix: Create .env File

### Step 1: Go to File Manager

1. **Make sure you're in:** `public_html` directory (already there from your screenshot)

---

### Step 2: Create .env File

**In CPanel File Manager:**

1. **Click "File" button** in the toolbar
2. **Select "New File"**
3. **Name it:** `.env` (dot at the start!)
4. **Click "Create New File"**

---

### Step 3: Add Environment Variables

**Now click on the `.env` file to edit it.**

**Click "Edit" button** in the toolbar.

**Paste this content:**

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/solnetmanage

# Security Secrets - REPLACE WITH YOUR OWN RANDOM STRINGS!
JWT_SECRET=your-super-secret-jwt-key-generate-a-random-32-character-string-here
SESSION_SECRET=your-super-secret-session-key-generate-another-random-string-here

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration - REPLACE WITH YOUR DOMAIN!
CORS_ORIGINS=https://solnetcomputer.com,https://www.solnetcomputer.com

# Debug Settings
ENABLE_DEBUG_LOGS=false
VITE_ENABLE_DEBUG_LOGS=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true

# Security Headers
HELMET_ENABLED=true
CONTENT_SECURITY_POLICY=true
```

**IMPORTANT:** Replace the placeholders!

---

### Step 4: Configure Database

**Before saving, get your database details:**

1. **In CPanel, click "PostgreSQL Databases"**
2. **Check if you have a database:**
   - If YES: Note the name, username, and password
   - If NO: Create one

**To create database:**
1. Click "Create Database"
2. Name: `solnetmanage`
3. Click "Create Database"

4. **Create User:**
   - Click "Add User"
   - Username: `solnetuser`
   - Generate a password and save it!
   - Click "Create User"

5. **Link them:**
   - Scroll to "Add User to Database"
   - Select: `solnettg_solnetuser` and `solnettg_solnetmanage`
   - Click "Add"
   - Check "ALL PRIVILEGES"
   - Click "Make Changes"

---

### Step 5: Update DATABASE_URL

**Back in your `.env` file, update this line:**

```bash
DATABASE_URL=postgresql://solnettg_solnetuser:YOUR_PASSWORD@localhost:5432/solnettg_solnetmanage
```

**Note:** Replace `YOUR_PASSWORD` with the actual password you saved!

**Also update:**
- `CORS_ORIGINS` to your actual domain
- Generate random strings for `JWT_SECRET` and `SESSION_SECRET`

---

### Step 6: Save .env File

1. **Click "Save Changes"** in the editor
2. **Verify file exists** in File Manager

---

### Step 7: Configure Node.js App

**In CPanel:**

1. **Click "Node.js Selector"**
2. **Click "Create Application"** (or edit existing)

**Configure:**
- **Node.js Version:** 22 (or 20/18)
- **Application Mode:** Production
- **Application Root:** `/home/solnettg/public_html`
- **Application URL:** `/` or your subdomain
- **Application Startup File:** `dist/server/index.js`
- **Load Environment Variables from .env:** ✅ Check this

3. **Click "Create"**
4. **Click "Start App"**

---

### Step 8: Check Status

1. **Wait 10 seconds**
2. **Check status shows "Running"** (green)
3. **Visit:** https://solnetcomputer.com

---

## ✅ Success Checklist

- [ ] `.env` file exists in `public_html`
- [ ] `.env` has `DATABASE_URL` with correct credentials
- [ ] `.env` has `JWT_SECRET` and `SESSION_SECRET` set
- [ ] `.env` has `CORS_ORIGINS` with your domain
- [ ] Database created in PostgreSQL
- [ ] Database user created and linked
- [ ] Node.js app created in Node.js Selector
- [ ] Application Root: `/home/solnettg/public_html`
- [ ] Startup File: `dist/server/index.js`
- [ ] App shows "Running" status
- [ ] Website loads without 503 error

---

## 🐛 If Still 503

**Check Node.js logs:**
1. Click your app in Node.js Selector
2. Click "Logs"
3. Look for specific errors
4. Fix based on error message

**Common issues:**
- Database connection failed → Check credentials in `.env`
- Port conflict → Change `PORT=5001`
- Permission denied → Check file permissions

---

**After creating `.env` and configuring the database, your app should work!**












