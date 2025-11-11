# How to View and Edit Hidden Files (.env) in CPanel

**Problem:** `.env` file disappears after creating it in File Manager.

**Solution:** This is NORMAL! Files starting with `.` are "hidden" by default. You need to enable viewing them.

---

## ✅ View Hidden Files in CPanel File Manager

### Step 1: Enable "Show Hidden Files"

**In CPanel File Manager:**

1. **Look for "Settings" icon** (gear icon) at the top
2. **Click "Settings"**
3. **Check "Show Hidden Files (dotfiles)"**
4. **Click "Save"**

**Now your `.env` file will be visible!**

---

## 🔍 Alternative: Direct Access

**If you can't find the Settings:**

### Method 1: Search for the File

1. **Click "Search All Your Files"** (top right)
2. **Type:** `.env`
3. **Click "Go"**
4. **The file will appear in search results**
5. **Click on it to edit**

---

### Method 2: Use Node.js Selector

**In Node.js Selector:**

1. **Click on your app**
2. **Look for "Environment Variables" or ".env"**
3. **You can edit variables directly there**
4. **Or upload .env file**

---

### Method 3: Edit via URL

**Direct file editor access:**

1. **Use direct path to editor**
2. Or go to File Manager → Click `.env` when visible → Edit

---

## 📝 Edit .env File After Making It Visible

**Once you can see `.env`:**

1. **Click on `.env` file**
2. **Click "Edit" button** in toolbar
3. **Add your environment variables** (see below)
4. **Click "Save"**

---

## ⚙️ Quick Settings Guide

**If Settings button is different in your CPanel:**

**Look for:**
- ☰ Menu (three horizontal lines)
- ⚙️ Settings (gear icon)
- "Options"
- "Preferences"
- "View Options"

**Then check:**
- ✅ Show hidden files
- ✅ Show dotfiles
- ✅ Display hidden files

---

## 🔧 Configure Node.js Environment Variables

**Instead of manually editing .env, you can add variables directly in Node.js Selector:**

### In CPanel:

1. **Go to "Node.js Selector"**
2. **Click on your app**
3. **Look for "Environment Variables" section**
4. **Click "Add" or "Edit"**
5. **Add each variable:**

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/database
JWT_SECRET=your-random-secret-32-characters-minimum
SESSION_SECRET=another-random-secret-32-characters
NODE_ENV=production
PORT=5000
CORS_ORIGINS=https://solnetcomputer.com,https://www.solnetcomputer.com
ENABLE_DEBUG_LOGS=false
VITE_ENABLE_DEBUG_LOGS=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
HELMET_ENABLED=true
CONTENT_SECURITY_POLICY=true
```

6. **Save settings**
7. **Restart app**

---

## ✅ Verify .env is Created

**To confirm the file exists:**

1. **In File Manager, search for:** `.env`
2. **Or in terminal (if you have access):**
   ```bash
   ls -la ~/public_html/.env
   ```
3. **Should show:** File details

---

## 🎯 Recommended Approach

**For CPanel Node.js Selector, you have two options:**

### Option A: Upload .env File (Easier)

1. **Create `.env` file on your computer**
2. **Add all environment variables**
3. **Upload via File Manager** (enable hidden files first)
4. **Node.js will automatically use it**

### Option B: Add in Node.js Selector (Alternative)

1. **Skip creating .env file**
2. **Add variables directly in Node.js Selector**
3. **These work the same way**

---

## 🚨 Important Notes

**Hidden files are normal:**
- Files starting with `.` (like `.env`) are hidden by default
- This is a security feature
- Enable viewing them when needed
- Disable viewing when done for security

**Search works even when hidden:**
- Use search to find hidden files
- You can edit without showing all hidden files
- Safer approach for security

---

## 📸 Visual Guide

**In CPanel File Manager:**
```
[Settings Button ⚙️] → [Show Hidden Files (dotfiles)] ✅ → [Save]
```

**Then you'll see:**
- `.env` ✅ (your environment file)
- `.htaccess` ✅ (if exists)
- All other hidden files

---

**After enabling hidden files, you should see your `.env` file!**












