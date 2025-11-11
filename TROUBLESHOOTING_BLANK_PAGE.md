# Fix: Domain Shows Blank Page or "It works!"

**Problem:** Your Node.js app says "It works!" but your React app doesn't load.

## 🔍 Diagnosis

**If you see:**
- ✅ Node.js app status: "Running"
- ✅ Browser shows: "It works!" or blank page
- ❌ React app doesn't load

**This means:** Node.js is running, but it's not serving your React app correctly.

---

## ✅ Solution Steps

### Step 1: Check Application Startup File

**In Node.js Selector:**

1. **Click on your app**
2. **Check "Application Startup File"**
3. **Should be:** `dist/server/index.js`
4. **NOT:** `server/index.js` or `index.js`

**If wrong:** Edit and change to `dist/server/index.js`

---

### Step 2: Restart Your Node.js App

1. **Click "Stop App"**
2. **Click "Start App"**
3. **Wait 5-10 seconds**
4. **Check status shows "Running"**

---

### Step 3: Check if .htaccess is in Right Place

**In File Manager:**

1. **Navigate to:** `public_html/dist/public/`
2. **Look for:** `.htaccess` file
3. **If missing:**
   - Copy `.htaccess` from `public_html/public/`
   - Paste it into `dist/public/`

---

### Step 4: Check Static Files Exist

**In File Manager:**

1. **Navigate to:** `public_html/dist/public/`
2. **Should see:**
   - `index.html` ✅
   - `assets/` folder ✅
   - `.htaccess` ✅

---

### Step 5: Test Direct File Access

**Open in browser:**
- `https://solnetcomputer.com/dist/public/index.html`

**Should see:** Your React app loading

**If not:** Static files not uploaded correctly or in wrong location.

---

### Step 6: Check Node.js App Logs

**In Node.js Selector:**

1. **Click your app**
2. **Click "View Logs"** or "Logs"
3. **Look for errors:**
   - "Cannot find module"
   - "EADDRINUSE" (port conflict)
   - "Cannot read property"
   - Database errors

---

## 🔧 Common Fixes

### Fix 1: Wrong Application Root Path

**In Node.js Selector:**

**Current:** `/home/username/public_html`  
**Should be:** `/home/solnettg/public_html` (or YOUR username)

**How to find your path:**
1. In File Manager, look at the breadcrumb path
2. Copy the full path shown

---

### Fix 2: Application Root Should NOT Include /dist

**Common mistake:**

❌ **Wrong:** `/home/solnettg/public_html/dist`  
✅ **Correct:** `/home/solnettg/public_html`

**Application Root** should be where `dist/` is located, NOT inside `dist/`.

**Startup File** should be: `dist/server/index.js` (relative to root)

---

### Fix 3: Static Files Not Being Served

**Check your app structure:**

```
public_html/
├── dist/
│   ├── public/           ← Should have index.html, assets/
│   │   ├── index.html
│   │   ├── assets/
│   │   └── .htaccess    ← IMPORTANT!
│   └── server/
│       └── index.js     ← Node.js startup file
├── package.json
└── .env
```

---

### Fix 4: Apache/Nginx Blocking Node.js

**If using subdomain:**

**Application URL** in Node.js Selector:
- For main domain: `/`
- For subdomain: `/subdomain-name`

**Check Application URL matches your setup.**

---

### Fix 5: Clear Browser Cache

**Your browser might be caching old files:**

1. **Press:** `Ctrl + Shift + Delete`
2. **Select:** "Cached images and files"
3. **Clear:** Last hour or all time
4. **Hard refresh:** `Ctrl + F5`

---

### Fix 6: Check Environment Variables

**In Node.js Selector:**

1. **Click your app**
2. **Check "Environment Variables"**
3. **Should have:**
   - `NODE_ENV=production`
   - `PORT=5000` (or your port)
   - Database URL, CORS settings, etc.

4. **If using .env file:**
   - Verify `.env` file exists in `public_html/`
   - Check "Load Environment Variables from .env" is enabled

---

## 🧪 Testing Steps

### Test 1: Check API is Working

**Open in browser:**
```
https://solnetcomputer.com/api/test
```

**Expected:** `{"message":"Server is working","timestamp":"..."}`

**If API works:** Node.js is running correctly, issue is with static files.

**If API doesn't work:** Node.js configuration problem.

---

### Test 2: Check Static Files Directly

**Open in browser:**
```
https://solnetcomputer.com/assets/index-B5Zr36cS.css
https://solnetcomputer.com/assets/index-CJaDairi.js
```

**Should load:** CSS and JavaScript files

**If 404:** Static files not being served correctly

**If works:** React bundling or routing issue

---

### Test 3: Check index.html Loads

**Open in browser:**
```
https://solnetcomputer.com/dist/public/index.html
```

**Should show:** Your React app

**If blank page:** JavaScript errors - check browser console (F12)

---

## 🔍 Check Browser Console

**Important debugging step:**

1. **Open website:** https://solnetcomputer.com
2. **Press F12** (or Right-click → Inspect)
3. **Click "Console" tab**
4. **Look for errors:**
   - Red errors about missing files
   - 404 errors
   - CORS errors
   - JavaScript errors

**Common errors:**
- `Failed to load module`
- `404 Not Found` for assets
- `CORS policy blocked`
- `Cannot read property of undefined`

---

## 🚨 Advanced Troubleshooting

### If Still Not Working

**Check these:**

1. **Verify .env file has correct CORS settings:**
   ```bash
   CORS_ORIGINS=https://solnetcomputer.com,https://www.solnetcomputer.com
   ```

2. **Check if port 5000 is accessible** (may be blocked)

3. **Verify database connection** (even if you don't use it yet)

4. **Check Node.js Selector logs for specific errors**

---

## ✅ Success Indicators

**You'll know it's working when:**
- ✅ Main page loads without "It works!" message
- ✅ See your SolNet Management login page
- ✅ Can navigate between pages
- ✅ No console errors in browser

---

## 📞 Still Need Help?

**Provide this info:**

1. **Browser console errors** (F12 → Console)
2. **Node.js Selector logs** (any errors shown)
3. **Application settings** from Node.js Selector
4. **File structure** (screenshot of File Manager showing your files)
5. **What you see** (screenshot of the blank page)

**Post to:** Your support forum or contact Ouzo HostNS support.

---

## 🎯 Quick Checklist

- [ ] Application Startup File: `dist/server/index.js`
- [ ] Application Root: `/home/solnettg/public_html` (NOT including dist)
- [ ] Application URL: `/` (for main domain)
- [ ] `.htaccess` file in `dist/public/`
- [ ] `index.html` exists in `dist/public/`
- [ ] `assets/` folder exists in `dist/public/`
- [ ] App shows "Running" status
- [ ] App restarted after changes
- [ ] Browser cache cleared
- [ ] API endpoint works: `/api/test`
- [ ] No errors in browser console
- [ ] No errors in Node.js logs

**If all checked and still not working:** Share the specific error messages you're seeing.












