# Deploy Using CPanel File Manager + Node.js Selector

**Since you have Node.js Selector in CPanel**, this is the easiest way to deploy without SSH!

## ✅ Quick Deployment Steps

### Step 1: Build Your Application (On Your Computer)

```bash
npm run build
```

This creates the `dist/` folder with your compiled application.

---

### Step 2: Create a ZIP File

**On Windows PowerShell:**
```powershell
Compress-Archive -Path dist,package.json,package-lock.json,public\.htaccess -DestinationPath solnet-deploy.zip
```

**Or manually:**
1. Select these files/folders:
   - `dist/` folder
   - `package.json`
   - `package-lock.json` (if exists)
   - `public/.htaccess`
2. Right-click → "Send to" → "Compressed (zipped) folder"
3. Name it `solnet-deploy.zip`

---

### Step 3: Upload to CPanel File Manager

1. **Log into CPanel** at https://ouzo.hostns.io/
2. **Open File Manager**
3. **Go to:** `public_html` (or your domain's root directory)
4. **Upload your ZIP:**
   - Click "Upload"
   - Select `solnet-deploy.zip`
   - Wait for upload
5. **Extract:**
   - Right-click `solnet-deploy.zip`
   - Click "Extract"
   - Verify `dist`, `package.json`, etc. are now in `public_html`

---

### Step 4: Create .env File in File Manager

**Critical for your app to work!**

1. **In File Manager, click "New File"**
2. **Name it:** `.env` (yes, with the dot at the start)
3. **Open it to edit**
4. **Paste this:**

```bash
# Database (REQUIRED - Get from CPanel → PostgreSQL Databases)
DATABASE_URL=postgresql://username:password@localhost:5432/solnetmanage

# Security Secrets (REQUIRED - Generate strong random strings!)
JWT_SECRET=your-super-secret-jwt-key-generate-a-random-32-char-string-here
SESSION_SECRET=your-super-secret-session-key-generate-another-random-string

# Server Settings
PORT=5000
NODE_ENV=production

# CORS (REQUIRED - Replace with YOUR domain)
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

# SMS (Optional - only if using)
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_FROM_NUMBER=
```

5. **IMPORTANT:** Replace placeholders with your actual values!
   - Get `DATABASE_URL` from CPanel → PostgreSQL Databases
   - Set `CORS_ORIGINS` to YOUR actual domain
   - Generate random strings for JWT_SECRET and SESSION_SECRET

6. **Save**

---

### Step 5: Set Up Database

1. **In CPanel, click "PostgreSQL Databases"**
2. **Create database** (if you don't have one):
   - Database name: `solnetmanage`
   - Click "Create Database"
3. **Create user** (if needed):
   - Username: `solnetuser`
   - Generate a strong password
   - Save the password!
   - Click "Create User"
4. **Link user to database:**
   - Scroll to "Add User to Database"
   - Select user and database
   - Click "Add"
   - Grant "ALL PRIVILEGES"
5. **Get connection string:**
   - Usually: `postgresql://username@localhost:5432/database`
   - Or see your database details page

6. **Update `.env` file** with the correct `DATABASE_URL`

---

### Step 6: Configure Node.js Application

**This is the KEY step!**

1. **In CPanel, find "Node.js Selector" or "Node.js App"**
2. **Click "Create Application"**

**Fill in:**

- **Node.js Version:** 18 or 20 (LTS recommended)
- **Application Mode:** Production
- **Application Root:** `/home/solnet/public_html` (or your path)
- **Application URL:** `/` (for main domain) or `/your-app` (for subdomain)
- **Application Startup File:** `dist/server/index.js` ⚠️ **IMPORTANT**
- **Environment File:** `.env` (should auto-detect)
- **Click "Load Environment Variables"** if available
- **Restart Mode:** auto (if option exists)

3. **Click "Create"**

4. **After creation, click "Run NPM Install"** (important!)

5. **Click "Start App"**

---

### Step 7: Copy .htaccess to Public Directory

**Important for React routing to work!**

1. **In File Manager**, navigate to where you have `public/.htaccess`
2. **Copy** the `.htaccess` file
3. **Navigate to:** `public_html/dist/public/`
4. **Paste** the `.htaccess` file there

---

### Step 8: Set Permissions (Using File Manager)

1. **Right-click on `public_html`**
   - Change permissions to 755

2. **Right-click on `.env` file**
   - Change permissions to 644

3. **Create uploads directory:**
   - Click "New Folder"
   - Name: `uploads`
   - Set permissions to 755

---

### Step 9: Verify It's Working

1. **Check Node.js App Status:**
   - In Node.js Selector, check your app status
   - Should show "Running" with green indicator

2. **Test your application:**
   - Visit: `https://yourdomain.com`
   - Should load your React app!

3. **Test API:**
   - Visit: `https://yourdomain.com/api/test`
   - Should return: `{"message":"Server is working","timestamp":"..."}`

---

## 🐛 Troubleshooting

### Node.js App Won't Start

**Check Node.js Selector:**
1. Click on your app
2. Check logs for errors
3. Common issues:
   - Wrong startup file → Should be `dist/server/index.js`
   - Missing modules → Click "Run NPM Install" again
   - Port conflict → Try different PORT in `.env`
   - Database error → Check `DATABASE_URL` in `.env`

### "Cannot find module" Error

**Solution:**
1. In Node.js Selector, click your app
2. Click "Run NPM Install"
3. Wait for installation to complete
4. Restart your app

### "ENOENT: no such file or directory"

**Solutions:**
- Verify `dist/server/index.js` exists
- Check `Application Startup File` is exactly `dist/server/index.js`
- Make sure files were extracted properly from ZIP

### Static Files Not Loading (404)

**Solution:**
1. Copy `.htaccess` from `public/` to `dist/public/`
2. Check file exists: `dist/public/index.html`
3. Check permissions on `dist/public/` folder

### Database Connection Failed

**Solutions:**
1. Double-check `DATABASE_URL` in `.env`
2. Verify database exists in PostgreSQL Databases
3. Test connection from CPanel → PostgreSQL → phpPgAdmin
4. Make sure database user has permissions

### "Permission denied" Errors

**Solution:**
1. In File Manager, set folder permissions:
   - `public_html` → 755
   - `uploads` → 755
   - `.env` → 644
   - `dist/server/index.js` → 755

---

## 📊 Monitoring Your App

**In Node.js Selector:**
- View logs
- Restart app
- Check memory usage
- Stop/Start app
- View environment variables

---

## 🔄 Updating Your Application

**When you make changes:**

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Create new ZIP** with updated `dist/` folder

3. **Upload and extract** via File Manager

4. **In Node.js Selector:**
   - Click your app
   - Click "Restart App"

5. **Verify** it's working

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Node.js app shows "Running" status
- [ ] Can access https://yourdomain.com
- [ ] React app loads (no 404 errors)
- [ ] API endpoint responds: `/api/test`
- [ ] Can login with admin account
- [ ] Static files load (images, CSS, JS)
- [ ] Database operations work (create customer, etc.)
- [ ] File uploads work (if using)

---

## 🎉 Done!

Your SolNet Management System is now deployed using CPanel's Node.js Selector!

**Main guide:** [OUZO_HOSTNS_DEPLOYMENT.md](./OUZO_HOSTNS_DEPLOYMENT.md)  
**Need help?** Contact Ouzo HostNS support or check logs in Node.js Selector.












