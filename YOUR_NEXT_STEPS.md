# Your Next Steps - Debugging Guide

## ✅ What You've Done So Far

1. ✅ Built the application locally
2. ✅ Uploaded `dist/` folder via File Manager
3. ✅ Created `.env` file
4. ✅ Set up database credentials
5. ✅ Configured Node.js Selector
6. ⚠️ Getting 503 errors on API endpoints

---

## 🔍 Critical Next Step: Get Node.js Logs

**You're seeing 503 errors on:**
- `/api/inventory/public`
- `/api/business-profile`  
- `/api/service-types`
- `/api/public/services`

**This means Node.js is running but crashing when handling requests.**

---

## 🚨 Most Likely Issues

Based on your `.env` file, these are possible problems:

### Issue 1: Database Connection Failed (Most Likely)

**Your DATABASE_URL:**
```
postgresql://solnetuser:solnetpass@localhost:5432/solnetmanage
```

**Possible problems:**
1. **Database doesn't exist** - Create it in CPanel PostgreSQL
2. **User doesn't exist or wrong password**
3. **Database not created** - Run migrations
4. **User not linked to database**

**Fix:**
1. Go to **CPanel → PostgreSQL Databases**
2. Create database: `solnetmanage`
3. Create user: `solnetuser` with password `solnetpass`
4. Link user to database
5. Update `.env` with correct credentials

---

### Issue 2: Node.js Can't Find Files

**Application Root or Startup File path wrong**

**Check in Node.js Selector:**
- Application Root should be: `/home/solnettg` or `/home/solnettg/public_html`
- Startup File should be: `public_html/dist/server/index.js` or `dist/server/index.js`

---

### Issue 3: Missing SESSION_SECRET

**Add to your `.env`:**
```bash
SESSION_SECRET=3cf7aee6cde3ac9c546b2ccbcdb82ad22b9b8e8570c4f6a2ed9c255a13d8c6b137d8e18f4dcf1f0aa6743d2767f86a5d4b4fd0d0e574b946a5716ef636089482
```

(Can use same value as JWT_SECRET for testing)

---

### Issue 4: Fixed .env Issues

**Your `.env` has these problems:**

1. **Duplicate ENABLE_DEBUG_LOGS** (lines 5 and 8)
2. **Missing SESSION_SECRET**

**Fixed version:**
```bash
DATABASE_URL=postgresql://solnetuser:solnetpass@localhost:5432/solnetmanage
JWT_SECRET=3cf7aee6cde3ac9c546b2ccbcdb82ad22b9b8e8570c4f6a2ed9c255a13d8c6b137d8e18f4dcf1f0aa6743d2767f86a5d4b4fd0d0e574b946a5716ef636089482
SESSION_SECRET=3cf7aee6cde3ac9c546b2ccbcdb82ad22b9b8e8570c4f6a2ed9c255a13d8c6b137d8e18f4dcf1f0aa6743d2767f86a5d4b4fd0d0e574b946a5716ef636089482
PORT=5000
NODE_ENV=production
CORS_ORIGINS=https://solnetcomputer.com,https://www.solnetcomputer.com
ENABLE_DEBUG_LOGS=true
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

---

## 📋 Action Items

### 1. Get Node.js Logs (MOST IMPORTANT!)

**In CPanel:**
1. Go to **Node.js Selector**
2. Click on your app
3. Find and click **"Logs"** or **"Error Logs"**
4. **Copy the entire error message**
5. **Send it to me**

This will tell us exactly what's wrong!

---

### 2. Check Database Setup

**In CPanel → PostgreSQL Databases:**

**Verify:**
- [ ] Database `solnetmanage` exists
- [ ] User `solnetuser` exists
- [ ] Password is `solnetpass`
- [ ] User is linked to database
- [ ] User has "ALL PRIVILEGES"

**If not:**
- Create them now
- Then restart Node.js app

---

### 3. Fix .env File

**Update your `.env` to:**
1. Remove duplicate `ENABLE_DEBUG_LOGS`
2. Add `SESSION_SECRET`
3. Keep `ENABLE_DEBUG_LOGS=true` (for now to see errors)

---

### 4. Update Your .env File

**Fix these issues:**

1. **Open `.env` in File Manager**
2. **Replace with this corrected version:**

```bash
DATABASE_URL=postgresql://solnetuser:solnetpass@localhost:5432/solnetmanage
JWT_SECRET=3cf7aee6cde3ac9c546b2ccbcdb82ad22b9b8e8570c4f6a2ed9c255a13d8c6b137d8e18f4dcf1f0aa6743d2767f86a5d4b4fd0d0e574b946a5716ef636089482
SESSION_SECRET=3cf7aee6cde3ac9c546b2ccbcdb82ad22b9b8e8570c4f6a2ed9c255a13d8c6b137d8e18f4dcf1f0aa6743d2767f86a5d4b4fd0d0e574b946a5716ef636089482
PORT=5000
NODE_ENV=production
CORS_ORIGINS=https://solnetcomputer.com,https://www.solnetcomputer.com
ENABLE_DEBUG_LOGS=true
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

**Changes:**
- ✅ Added SESSION_SECRET
- ✅ Removed duplicate ENABLE_DEBUG_LOGS
- ✅ Kept ENABLE_DEBUG_LOGS=true for debugging

3. **Save the file**

### 5. Restart Node.js App

**After making changes:**

1. **Click "Stop App"** in Node.js Selector
2. **Wait 5 seconds**
3. **Click "Start App"**
4. **Immediately view logs**
5. **See if errors are different**

---

### 5. Test Database Connection

**If you have SSH or Terminal access:**

Try connecting to database:
```bash
psql -U solnetuser -d solnetmanage
# Enter password: solnetpass
```

**If this fails:** Database credentials are wrong!

---

## 🎯 Priority Order

**Do these in order:**

1. **Get Node.js logs** → Tell me the error
2. **Check database exists** → Fix if missing
3. **Fix .env file** → Add SESSION_SECRET, remove duplicate
4. **Restart app** → See if it works
5. **Share logs** → So I can help further

---

## 📞 What to Send Me

**To help you faster, send:**

1. **Node.js logs** (the actual error message)
2. **Screenshot of Node.js Selector** showing your app settings
3. **Screenshot of PostgreSQL Databases** showing your database and user

**With these, I can tell you exactly what's wrong!**

---

## ✅ Quick Fix Checklist

**Before asking for more help, verify:**

- [ ] Saw the actual Node.js error log
- [ ] Database exists in CPanel PostgreSQL
- [ ] Database user exists and is linked
- [ ] `.env` file updated with SESSION_SECRET
- [ ] Removed duplicate ENABLE_DEBUG_LOGS
- [ ] Restarted Node.js app after changes
- [ ] Copied the error message from logs

---

**Right now: Go to Node.js Selector → Click Logs → Copy the error → Send it to me!**

