# Fix: 503 Service Unavailable Error

**Problem:** Your domain shows `503 (Service Unavailable)`

This means **Node.js app crashed** or **cannot start**.

---

## 🔧 Quick Fixes

### Fix 1: Check Node.js App Logs

**Most important step!**

1. **Go to CPanel → Node.js Selector**
2. **Click on your app**
3. **Click "Logs"** or "View Logs"
4. **Look for red error messages**

**Common errors you'll see:**
- Database connection failed
- Missing environment variables
- Port already in use
- Cannot find module
- Permission denied

---

### Fix 2: Check Environment Variables

**In Node.js Selector:**
1. **Click your app**
2. **Check "Environment Variables" or ".env"**
3. **Verify these are set:**
   - `DATABASE_URL` ✅
   - `JWT_SECRET` ✅
   - `SESSION_SECRET` ✅
   - `NODE_ENV=production` ✅
   - `PORT=5000` ✅

**Missing variables cause crashes!**

---

### Fix 3: Database Connection Issue

**Most common cause of 503!**

**If logs show database errors:**

1. **Go to CPanel → PostgreSQL Databases**
2. **Check database exists**
3. **Check user exists**
4. **Verify connection string in `.env`:**
   ```bash
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   ```

**Common database issues:**
- Wrong password → Update `.env`
- Database doesn't exist → Create it
- User not linked to database → Link in CPanel
- Connection string wrong format → Fix in `.env`

---

### Fix 4: Port Conflict

**If logs show "EADDRINUSE":**

1. **In `.env` file, change:**
   ```bash
   PORT=5000
   ```
   to:
   ```bash
   PORT=5001
   ```

2. **Save**
3. **Restart app in Node.js Selector**

---

### Fix 5: Missing JWT_SECRET or SESSION_SECRET

**If logs show "JWT_SECRET must be set":**

1. **Edit `.env` file**
2. **Add/update:**
   ```bash
   JWT_SECRET=your-super-secret-random-string-32-characters-long
   SESSION_SECRET=another-super-secret-random-string-32-characters
   ```
3. **Generate random strings!** Don't use "test" or "secret"
4. **Save**
5. **Restart app**

---

### Fix 6: Application Root Path Wrong

**Check in Node.js Selector:**

**Application Root:** `/home/solnettg/public_html` (your actual username)

**Common mistake:**
- Wrong: `/home/username/public_html` (generic)
- Right: `/home/solnettg/public_html` (your actual username)

**How to find your username:**
- Look at File Manager breadcrumbs
- Or check CPanel welcome message

---

### Fix 7: Startup File Path Wrong

**In Node.js Selector, check:**

**Application Startup File:** `dist/server/index.js`

**NOT:**
- `server/index.js` ❌
- `dist/index.js` ❌
- `/dist/server/index.js` ❌

**Correct:** `dist/server/index.js` ✅

---

### Fix 8: Restart the App

**After making changes:**

1. **Click "Stop App"**
2. **Wait 5 seconds**
3. **Click "Start App"**
4. **Wait 10 seconds**
5. **Check status shows "Running"**

---

## 📊 Check Application Status

**In Node.js Selector:**

**Good signs:**
- ✅ Status: "Running" (green)
- ✅ Uptime shows time
- ✅ Memory usage shown
- ✅ Logs showing activity

**Bad signs:**
- ❌ Status: "Stopped" or "Error"
- ❌ No uptime shown
- ❌ Logs showing crashes
- ❌ Constant restarts

---

## 🐛 Common Log Errors & Solutions

### Error: "Cannot find module 'express'"

**Solution:** Bundle might be corrupt. Re-upload `dist/` folder.

---

### Error: "ECONNREFUSED" or "database connection failed"

**Solution:** Database not accessible. Check:
1. Database exists in PostgreSQL
2. User has permissions
3. Connection string correct in `.env`
4. Database server running

---

### Error: "JWT_SECRET must be set"

**Solution:** Missing security keys. Add to `.env`:
```bash
JWT_SECRET=random-32-character-string-here
SESSION_SECRET=random-32-character-string-here
```

---

### Error: "Port 5000 already in use"

**Solution:** Change port:
```bash
PORT=5001
```
Restart app.

---

### Error: "ENOENT: no such file or directory"

**Solution:** Wrong path. Check:
- Application Root is correct
- Startup File is `dist/server/index.js`
- Files actually exist in those locations

---

### Error: "EACCES: permission denied"

**Solution:** Fix file permissions:
- Right-click files in File Manager
- Set permissions:
  - Folders: 755
  - Files: 644
  - `.env`: 644

---

## ✅ Step-by-Step Debugging

### Step 1: Check Logs
```
Go to Node.js Selector → Click app → View Logs
```

**What error do you see?** → Jump to that specific fix above.

---

### Step 2: Verify Environment

**Check `.env` file has:**
- [ ] `DATABASE_URL` with correct connection string
- [ ] `JWT_SECRET` with random 32+ character string
- [ ] `SESSION_SECRET` with random 32+ character string
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000` (or other port)
- [ ] `CORS_ORIGINS` with your domain

---

### Step 3: Test Database Connection

**If database errors in logs:**

1. **Go to CPanel → PostgreSQL → phpPgAdmin**
2. **Try to connect**
3. **If fails:** Database credentials wrong

---

### Step 4: Verify File Structure

**In File Manager, check you have:**
```
public_html/
├── dist/
│   ├── server/
│   │   └── index.js       ← EXISTS?
│   └── public/
│       ├── index.html     ← EXISTS?
│       └── assets/        ← EXISTS?
├── .env                   ← EXISTS?
└── package.json           ← EXISTS?
```

---

### Step 5: Clean Restart

**Complete fresh start:**

1. **Stop app** in Node.js Selector
2. **Wait 30 seconds**
3. **Start app**
4. **Watch logs** for first 30 seconds
5. **Check if errors appear**

---

## 🚨 If Still Not Working

**Provide these details:**

1. **Error message from logs** (copy the red text)
2. **Application settings:**
   - Application Root:
   - Startup File:
   - Port:
3. **Environment variables** (remove sensitive values):
   - NODE_ENV:
   - PORT:
   - Has DATABASE_URL: (yes/no)
   - Has JWT_SECRET: (yes/no)
4. **File structure** (screenshot)
5. **What you see** (blank page, error page, etc.)

---

## 🎯 Quick Checklist

Before asking for help, check:
- [ ] Logs checked for specific error
- [ ] `.env` file exists and is in correct location
- [ ] Database credentials are correct
- [ ] JWT_SECRET and SESSION_SECRET are set
- [ ] Application Root path is correct (your username)
- [ ] Startup File is `dist/server/index.js`
- [ ] Port not conflicting (try changing to 5001)
- [ ] App restarted after changes
- [ ] File permissions correct (755 for folders, 644 for files)
- [ ] `dist/server/index.js` file actually exists

---

## 💡 Prevention

**To avoid 503 errors:**

1. **Always set environment variables** before starting
2. **Double-check database connection** works
3. **Generate strong random secrets** for JWT_SECRET
4. **Verify file paths** are correct
5. **Check logs immediately** when problems occur

---

**Most common cause:** Missing or incorrect `DATABASE_URL` in `.env` file!

**Check the logs first** - they'll tell you exactly what's wrong!












