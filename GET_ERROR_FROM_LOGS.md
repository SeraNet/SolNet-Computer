# Get Error From Node.js Logs - CRITICAL STEP

**You're still getting 503 errors. The logs will tell us exactly what's wrong!**

---

## 🚨 MUST DO: Check Logs Now

### Step 1: Open Node.js Selector

1. **Log into CPanel** at https://ouzo.hostns.io/
2. **Click "Node.js Selector"** or "Node.js App"
3. **Find your SolNet application**

---

### Step 2: View Logs

**Click on your application, then:**

- Look for **"Logs"** button
- Or **"View Logs"**
- Or **"Error Logs"**
- Or just **"Logs"** tab

**Click it!**

---

### Step 3: Read the Error

**In the logs, look for:**

- ❌ **Red text** = Errors
- ⚠️ **Yellow text** = Warnings
- 📝 **Any error messages**

**Common errors you might see:**

---

## 🔍 Common Errors & What They Mean

### Error 1: "Cannot find module 'express'"

**Meaning:** Dependencies missing or bundle corrupt

**Fix:** Check that `dist/server/index.js` exists and is complete

---

### Error 2: "Database connection failed" or "ECONNREFUSED"

**Meaning:** Can't connect to PostgreSQL

**Fix:**
1. Check `.env` has correct `DATABASE_URL`
2. Verify database exists in CPanel PostgreSQL
3. Check username/password are correct

---

### Error 3: "JWT_SECRET must be set"

**Meaning:** Missing security keys

**Fix:** Add to `.env`:
```bash
JWT_SECRET=your-random-secret-32-characters-minimum
SESSION_SECRET=another-random-secret-32-characters
```

---

### Error 4: "EADDRINUSE" or "Port already in use"

**Meaning:** Another app using port 5000

**Fix:** Change `PORT=5001` in `.env`, restart app

---

### Error 5: "ENOENT: no such file or directory"

**Meaning:** Wrong file path in settings

**Fix:** Check Application Startup File path is correct

---

### Error 6: "EACCES: permission denied"

**Meaning:** File permission problem

**Fix:** Set file permissions to 755 for folders, 644 for files

---

### Error 7: "Cannot start server" or "Process exited"

**Meaning:** App crashed immediately

**Fix:** Check all of the above. Usually database or environment variables.

---

### Error 8: "ENOENT: cannot find 'dist'"

**Meaning:** Wrong Application Root path

**Fix:** Check Application Root is pointing to right location

---

## 📋 What I Need From You

**Copy and paste the ENTIRE error message from the logs.**

**Example format:**
```
Error: Database connection failed
at Object.connect (/path/to/file.js:123:45)
Cannot connect to 'localhost:5432'
```

**This tells me exactly what to fix!**

---

## 🎯 Quick Checklist Before Getting Logs

**Verify these basics:**

- [ ] Application shows in Node.js Selector
- [ ] Status is "Running" or "Error"
- [ ] `.env` file exists
- [ ] Database created in PostgreSQL
- [ ] Application Root path is correct
- [ ] Startup File path is correct

---

## 💡 Pro Tips

**To get better logs:**

1. **Click "Stop App"**
2. **Wait 5 seconds**
3. **Click "Start App"**
4. **Immediately click "View Logs"**
5. **Watch for the error to appear**

**The most recent error (at the bottom) is usually the cause!**

---

## 🆘 If You Can't Find Logs

**Look for:**
- "Activity Log"
- "Error Log"
- "Output"
- "Console"
- "Details"
- Click anywhere on your app to see options

**Different hosts have different interfaces, but logs are always there!**

---

## ✅ What to Send Me

**Just copy and paste:**
1. The last 10-20 lines of the logs
2. Or the specific error message you see
3. Or screenshot of the error

**That's all I need to fix it for you!**

---

**Right now: Go to Node.js Selector → Click your app → View Logs → Copy the error message → Send it to me!**












