# Fix: Application Root Path Error

**Problem:** Getting error "Directory 'public_html' not allowed" when setting Application Root

**Solution:** The path should be different!

---

## ✅ Correct Application Root Paths

### For Your Setup

**Application Root should be ONE of these:**

**Option 1 (Recommended):**
```
/home/solnettg
```

**Option 2 (Alternative):**
```
/home/solnettg/public_html
```
BUT this only works if you put your files in a subfolder!

---

## 🎯 Recommended Configuration

### Correct Setup for Your Files

Since your files are in `public_html/`, use:

**Application Root:** `/home/solnettg`  
**Application URL:** `/` or `/public_html`  
**Startup File:** `public_html/dist/server/index.js`

**OR**

Put files in a subfolder and use:

**Application Root:** `/home/solnettg/public_html`  
**Application URL:** `/app` (or your subfolder name)  
**Startup File:** `dist/server/index.js`

---

## 🔧 Quick Fix

### Method 1: Keep Files in public_html (Easier)

**In Node.js Selector:**

1. **Application Root:** `/home/solnettg`
2. **Application URL:** `/` (for root domain)  
   OR `/public_html` (if not root)
3. **Application Startup File:** `public_html/dist/server/index.js`

---

### Method 2: Move Files to Subfolder

**Create a subfolder:**

1. **In File Manager**, navigate to `/home/solnettg`
2. **Create new folder:** `solnet-app`
3. **Move these from public_html to solnet-app:**
   - `dist/` folder
   - `package.json`
   - `.env`
   - `.htaccess`

**Then in Node.js Selector:**

1. **Application Root:** `/home/solnettg/public_html`
2. **Application URL:** `/solnet-app`
3. **Application Startup File:** `solnet-app/dist/server/index.js`

---

## 📍 Finding Your Correct Path

**In File Manager:**

1. **Look at the directory tree on the left**
2. **Click on your username** (`solnettg`)
3. **See the full path** shown
4. **Copy that exact path**

**Common paths:**
- `/home/solnettg`
- `/home/username`
- `/home/your-cpanel-username`

---

## 🚨 Important Notes

### Why This Happens

**Many hosts restrict:**
- ❌ Using `public_html` directly as root (security)
- ❌ Root-level Node.js apps on main domain

**But allow:**
- ✅ Node.js in subdirectories
- ✅ Specific user home directories

---

### Check Node.js Requirements

**Some hosts require:**
- App must be in a subfolder (not public_html root)
- App cannot use main domain root
- Must use subdomain or subfolder path

---

## ✅ Recommended Setup

### Best Practice Configuration

**For production, use a subdomain:**

1. **Create subdomain:** `app.solnetcomputer.com`
2. **Upload files to:** `public_html/app/`
3. **Configure:**
   - **Application Root:** `/home/solnettg/public_html/app`
   - **Application URL:** `/app`
   - **Startup File:** `dist/server/index.js`
4. **Access via:** `https://app.solnetcomputer.com`

---

## 🎯 Your Current Options

### Option A: Use Full Path with public_html

**In Node.js Selector:**

```
Application Root: /home/solnettg
Application URL: /
Startup File: public_html/dist/server/index.js
```

---

### Option B: Use Subfolder

**Move files:**

1. Create `public_html/app/` folder
2. Move: `dist`, `package.json`, `.env`
3. Configure:

```
Application Root: /home/solnettg/public_html/app
Application URL: /app
Startup File: dist/server/index.js
```

---

### Option C: Use Subdomain

**Best for production:**

1. Create subdomain in CPanel
2. Upload files to subdomain folder
3. Configure path to subdomain folder

---

## 🔍 Debug Your Path

**To find your exact setup:**

**In File Manager:**
1. Navigate to where your files are
2. Look at the breadcrumb path
3. Copy that full path

**In Node.js Selector:**
- Try different combinations
- Look at examples or help text
- Check allowed directories

---

## 📞 If Still Not Working

**Contact Ouzo HostNS support with:**

1. **Your domain:** solnetcomputer.com
2. **Error message:** "Directory 'public_html' not allowed"
3. **Where your files are:** `public_html` directory
4. **What path you tried:** `/home/solnettg/public_html`
5. **Ask:** What Application Root path should I use?

**They'll tell you the exact path format they require.**

---

## ⚡ Quick Test

**Try these paths one by one:**

1. `/home/solnettg`
2. `/home/solnettg/app` (create app folder first)
3. `/home/username` (your actual username format)
4. Check Ouzo HostNS documentation
5. Contact support

---

**The exact format varies by host - try the options above or contact support!**












