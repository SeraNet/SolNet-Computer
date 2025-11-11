# Deploying Without SSH or Terminal

**Don't have CPanel Terminal? Can't use SSH?** No problem! You can deploy completely using CPanel's File Manager.

## ✅ Deployment Without Command Line

### Step 1: Build Locally

On your computer:
```bash
npm run build
```

This creates the `dist/` folder with your compiled application.

---

### Step 2: Package Your Files

**Create a ZIP file** containing:
- `dist/` (entire folder)
- `package.json`
- `package-lock.json` (if it exists)
- `public/.htaccess`
- Any other required files

On Windows:
```powershell
# Using PowerShell
Compress-Archive -Path dist,package.json,package-lock.json,public\.htaccess -DestinationPath solnet-deploy.zip
```

Or manually:
1. Right-click the files
2. Select "Send to" → "Compressed (zipped) folder"

---

### Step 3: Upload via CPanel File Manager

1. **Log into CPanel** at https://ouzo.hostns.io/
2. **Open File Manager**
3. **Navigate to your domain directory:**
   - Usually `public_html` or `www/public_html`
   - Or your specific domain folder
4. **Upload your ZIP file:**
   - Click "Upload"
   - Select `solnet-deploy.zip`
   - Wait for upload to complete
5. **Extract the ZIP:**
   - Right-click `solnet-deploy.zip`
   - Select "Extract" or "Extract All"
   - This will create the folder structure in your directory

---

### Step 4: Create .env File via File Manager

**Important:** You need to configure your database and security settings.

1. **In File Manager, click "New File"**
2. **Name it:** `.env` (including the dot!)
3. **Click the file to edit it**
4. **Add this content:**

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Security Secrets (IMPORTANT: Generate strong random strings!)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
SESSION_SECRET=your-super-secret-session-key-change-this-to-random-string

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration (YOUR DOMAIN)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Disable Debug Logs
ENABLE_DEBUG_LOGS=false
VITE_ENABLE_DEBUG_LOGS=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
HELMET_ENABLED=true
CONTENT_SECURITY_POLICY=true

# SMS Configuration (Optional - only if using SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_FROM_NUMBER=+1234567890
```

5. **Save the file**

**⚠️ CRITICAL:** 
- Replace `DATABASE_URL` with YOUR actual database credentials
- Get these from CPanel → PostgreSQL Databases
- Replace `CORS_ORIGINS` with YOUR actual domain
- Generate STRONG random strings for `JWT_SECRET` and `SESSION_SECRET` (32+ characters)

---

### Step 5: Set Up Database

1. **In CPanel, go to "PostgreSQL Databases"**
2. **Create a new database** (if you don't have one):
   - Click "Create Database"
   - Name: `solnetmanage` (or your choice)
   - Click "Create Database"
3. **Create a database user** (if needed):
   - Click "Add User"
   - Username: `solnetuser` (or your choice)
   - Password: **Generate a strong password**
   - Save it - you'll need it for `.env`
4. **Link user to database:**
   - Go to "Add User to Database"
   - Select your user and database
   - Click "Add"
   - Grant "ALL PRIVILEGES"
5. **Note the connection details** - you'll need these for your `.env` file

**Update your `.env` file** with the correct `DATABASE_URL`.

---

### Step 6: Set Up Node.js Application

**Check if you have Node.js Selector in CPanel:**

1. **Look for "Node.js Selector" or "Node.js App"** in CPanel
2. **If available:**
   - Click "Create Application" or "Setup Node.js App"
   - Configure:
     - **Node Version:** 18 or 20 (LTS)
     - **Application Root:** `/home/username/public_html`
     - **Application URL:** `/` (your main domain)
     - **Application Startup File:** `dist/server/index.js`
     - **Load Environment from:** `.env`
   - Click "Create"
   - Click "Start App"

3. **If NOT available:**
   - You'll need to contact Ouzo HostNS support
   - Ask them to enable Node.js support
   - Or provide alternative deployment method

---

### Step 7: Set File Permissions

**Use File Manager:**

1. **Right-click on `public_html` folder**
2. **Select "Change Permissions"**
3. **Set:** 755 (or ensure it's writeable)

4. **Right-click on `.env` file**
5. **Select "Change Permissions"**
6. **Set:** 644 (readable by owner and group only)

7. **Create uploads directory:**
   - In File Manager, navigate to your root
   - Click "New Folder"
   - Name: `uploads`
   - Set permissions to 755

---

### Step 8: Install Node Modules

**You NEED Node.js access for this!** Options:

**Option A: Using CPanel Node.js Selector**
- If you have it, it should automatically install modules
- Check the Node.js Selector dashboard for status

**Option B: Contact Support**
- Ask Ouzo HostNS to run: `npm install --production` in your directory
- Or ask them to enable SSH/Terminal access for you

**Option C: Upload node_modules**
- **Not recommended**, but possible
- Build on your computer with exact same Node version
- Upload entire `node_modules/` folder (WARNING: Can be very large!)

---

### Step 9: Verify Deployment

1. **Visit your domain:** `https://yourdomain.com`
2. **Test API:** `https://yourdomain.com/api/test`
3. **Expected response:**
   ```json
   {"message":"Server is working","timestamp":"..."}
   ```

---

## 🐛 Troubleshooting

### Issue: "Cannot find node_modules"

**Solution:**
- Contact support to run `npm install --production`
- Or upload pre-built `node_modules` (large file)

### Issue: "Cannot find module '...'"

**Solution:**
- Missing dependencies
- Need to install: Contact support

### Issue: "Port 5000 already in use"

**Solution:**
- In `.env`, change `PORT=5000` to `PORT=5001`
- Update Node.js app configuration if using Node.js Selector
- Contact support if issues persist

### Issue: "Database connection failed"

**Solutions:**
1. Double-check `DATABASE_URL` in `.env`
2. Verify database exists in PostgreSQL Databases
3. Confirm user has proper permissions
4. Test connection from CPanel → PostgreSQL → phpPgAdmin

### Issue: "ENOENT: no such file or directory 'dist'"

**Solution:**
- `dist` folder not uploaded correctly
- Re-upload and extract ZIP file
- Verify `dist/public` and `dist/server` exist

### Issue: Node.js not available

**Solution:**
- Contact Ouzo HostNS support
- Request Node.js installation
- Ask for deployment assistance
- Consider upgrading to a plan that supports Node.js

---

## 📞 Getting Help from Support

**Contact Ouzo HostNS support and provide:**

1. **What you're trying to deploy:**
   - Node.js/Express application
   - React frontend + Node.js backend

2. **What you need:**
   - Node.js 18 or 20 installed
   - Ability to run `npm install` in your directory
   - Node.js app hosting support

3. **What you have:**
   - Your files uploaded to `public_html`
   - Database configured
   - `.env` file set up

---

## ✅ Alternative: Use Different Hosting

If Ouzo HostNS doesn't support Node.js applications:

**Consider these alternatives:**
- **Heroku** - Easy Node.js deployment (free tier available)
- **Railway** - Simple deployment, generous free tier
- **DigitalOcean** - Full control, $6/month
- **Vercel** - Great for frontend, supports Node.js APIs
- **Render** - Free tier, auto-deploy from Git

---

## 📋 Summary Checklist

Without SSH/Terminal, you need:

- ✅ Node.js Selector enabled in CPanel
- ✅ Ability to install npm packages
- ✅ Database access (PostgreSQL)
- ✅ File Manager access
- ⚠️ Support assistance for setup

**If you can't get these:** Consider switching to a Node.js-friendly host or contacting Ouzo HostNS for upgrade options.

---

**Questions?** See main [OUZO_HOSTNS_DEPLOYMENT.md](./OUZO_HOSTNS_DEPLOYMENT.md) or contact Ouzo HostNS support.












