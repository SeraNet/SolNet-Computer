# 🚀 SolNet CPanel Deployment - Start Here

## Quick Answer: How Do I Deploy?

**For Ouzo HostNS (ouzo.hostns.io):**
👉 See **[OUZO_HOSTNS_DEPLOYMENT.md](./OUZO_HOSTNS_DEPLOYMENT.md)** - Complete step-by-step guide

**For Other CPanel Hosting:**
👉 See **[CPANEL_DEPLOYMENT.md](./CPANEL_DEPLOYMENT.md)** - General CPanel deployment guide

**Just Need Quick Commands?**
👉 See **[QUICK_CPANEL_DEPLOY.md](./QUICK_CPANEL_DEPLOY.md)** - 5-minute quick reference

---

## 📚 All Deployment Guides

| Guide | When to Use | Description |
|-------|-------------|-------------|
| **[DEPLOY_BUILT_APP.md](./DEPLOY_BUILT_APP.md)** | ✅ **START HERE - Easiest deployment** | Upload pre-built app, no npm install needed |
| **[FIX_503_ERROR.md](./FIX_503_ERROR.md)** | 🚨 **503 Service Unavailable?** | Fix app crashes and startup errors |
| **[VIEW_HIDDEN_FILES.md](./VIEW_HIDDEN_FILES.md)** | 🔍 **Can't see .env file?** | Enable showing hidden files in File Manager |
| **[FIX_APPLICATION_ROOT_PATH.md](./FIX_APPLICATION_ROOT_PATH.md)** | 🚫 **Directory "public_html" not allowed?** | Fix Node.js application root path |
| **[HOW_TO_GET_NODE_LOGS.md](./HOW_TO_GET_NODE_LOGS.md)** | 🔍 **503 errors? Show me logs!** | How to get Node.js application logs (not Apache logs) |
| **[GET_ERROR_FROM_LOGS.md](./GET_ERROR_FROM_LOGS.md)** | 🔍 **Need to debug 503?** | How to read Node.js logs to find errors |
| **[TROUBLESHOOTING_BLANK_PAGE.md](./TROUBLESHOOTING_BLANK_PAGE.md)** | ⚠️ **Blank page or "It works!"?** | Fix static files not loading |
| **[DEPLOY_WITH_FILE_MANAGER.md](./DEPLOY_WITH_FILE_MANAGER.md)** | Have Node.js in CPanel | Deploy using File Manager + Node.js Selector |
| **[OUZO_HOSTNS_DEPLOYMENT.md](./OUZO_HOSTNS_DEPLOYMENT.md)** | Complete guide for Ouzo HostNS | Detailed deployment instructions |
| **[QUICK_CPANEL_DEPLOY.md](./QUICK_CPANEL_DEPLOY.md)** | Need quick commands | Fast reference and cheat sheet |
| **[DEPLOY_WITHOUT_SSH.md](./DEPLOY_WITHOUT_SSH.md)** | No SSH? No Terminal? | Alternatives and workarounds |
| **[SSH_SETUP_GUIDE.md](./SSH_SETUP_GUIDE.md)** | SSH giving "Permission denied"? | How to set up SSH keys |
| **[SECURITY_ALERT.md](./SECURITY_ALERT.md)** | SSH key exposed? | Security actions needed |

---

## ⚡ Super Quick Start (3 Steps)

### 1️⃣ Build
```bash
npm run build
```

### 2️⃣ Upload
- Upload `dist/`, `package.json`, and `public/.htaccess` to CPanel

### 3️⃣ Deploy
See **[DEPLOY_BUILT_APP.md](./DEPLOY_BUILT_APP.md)** for simplest deployment (no npm install on server!)

---

## ❓ Common Questions

### "I have Node.js in CPanel, which guide do I use?"
→ **[DEPLOY_BUILT_APP.md](./DEPLOY_BUILT_APP.md)** - **Upload pre-built app, no npm needed!**

### "How do I access SSH/Terminal?"
→ It's explained in **[OUZO_HOSTNS_DEPLOYMENT.md](./OUZO_HOSTNS_DEPLOYMENT.md)** or your CPanel docs

### "Where do I find my database credentials?"
→ CPanel → PostgreSQL Databases (or your host’s equivalent)

### "What if SSH isn't enabled or gives 'Permission denied (publickey)'?"
→ **Use CPanel's Terminal instead!** It's easier and works immediately. See **[OUZO_HOSTNS_DEPLOYMENT.md](./OUZO_HOSTNS_DEPLOYMENT.md)**

### "How do I know if deployment worked?"
→ **[DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)** - verification checklist

### "Getting 503 Service Unavailable error?"
→ **[FIX_503_ERROR.md](./FIX_503_ERROR.md)** - fix app crashes (check logs first!)

### "I created .env but can't see it?"
→ **[VIEW_HIDDEN_FILES.md](./VIEW_HIDDEN_FILES.md)** - enable showing hidden files

### "Directory 'public_html' not allowed" error?
→ **[FIX_APPLICATION_ROOT_PATH.md](./FIX_APPLICATION_ROOT_PATH.md)** - fix application root path

### "App is running but shows blank page or 'It works!'?"
→ **[TROUBLESHOOTING_BLANK_PAGE.md](./TROUBLESHOOTING_BLANK_PAGE.md)** - fix static files issue

---

## 🎯 Your Next Step

**Recommended deployment:**
1. **Open** → **[DEPLOY_BUILT_APP.md](./DEPLOY_BUILT_APP.md)** ✅ **EASIEST - NO npm install!**
2. **Follow** the steps
3. **Done!** ✅

**Or see the complete guide:**
→ **[OUZO_HOSTNS_DEPLOYMENT.md](./OUZO_HOSTNS_DEPLOYMENT.md)**

---

**Still confused?** Start with [OUZO_HOSTNS_DEPLOYMENT.md](./OUZO_HOSTNS_DEPLOYMENT.md) — it covers everything you need.

---

## ⚠️ SECURITY ALERT

**If you see a message about exposed SSH keys or "Permission denied (publickey)":**
→ See **[SECURITY_ALERT.md](./SECURITY_ALERT.md)** immediately!
→ **Or just use CPanel Terminal** (easiest and safest)

