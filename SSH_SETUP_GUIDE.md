# SSH Setup for Ouzo HostNS

## The Problem

When you try to SSH into your server, you get:
```
Permission denied (publickey,gssapi-keyex,gssapi-with-mic)
```

This means **password authentication is disabled** and you need **SSH key authentication**.

**SSH Server:** Use `ns2.hostns.io`

## ✅ Easiest Solution: Use CPanel Terminal

**Skip SSH entirely!** Just use the web-based CPanel Terminal:

1. Log into https://ouzo.hostns.io/
2. Find **"Terminal"** in your CPanel
3. Click to open it
4. You're done! No setup needed.

👉 See **[OUZO_HOSTNS_DEPLOYMENT.md](./OUZO_HOSTNS_DEPLOYMENT.md)** for complete instructions using CPanel Terminal.

---

## 🔧 Alternative: Set Up SSH Keys (Advanced)

If you really want to use SSH from your local computer, here's how to set up SSH keys:

### Step 1: Generate SSH Key (Windows)

Open PowerShell:

```powershell
# Generate a new SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Press Enter to accept default file location: C:\Users\YourName\.ssh\id_ed25519
# Choose a passphrase or press Enter twice for no passphrase
```

### Step 2: Get Your Public Key

```powershell
# Display your public key
cat ~/.ssh/id_ed25519.pub
```

This will output something like:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... your-email@example.com
```

**Copy this entire output** - you'll need it next.

### Step 3: Add Key to Ouzo HostNS CPanel

1. Log into https://ouzo.hostns.io/
2. Look for **"SSH Access"** or **"Manage SSH Keys"**
3. Click **"Import Key"** or **"Add Key"**
4. Choose **"Public Key"**
5. Give it a name (like "My Computer")
6. Paste the public key you copied in Step 2
7. Click **"Import"** or **"Save"**
8. Authorize the key by clicking **"Authorize"** or **"Manage"**

### Step 4: Connect Via SSH

Now try connecting again:

```bash
ssh solnet@ns2.hostns.io
```

**Note:** Use `ns2.hostns.io` for SSH, not `ouzo.hostns.io`

It should work! You may be prompted for your SSH key passphrase (if you set one).

---

## 🐛 Troubleshooting

### "No such file or directory" when running cat

**Windows PowerShell fix:**
```powershell
# Try different path format
Get-Content C:\Users\YourUsername\.ssh\id_ed25519.pub
```

### Key was added but still getting "Permission denied"

**Try these:**
1. Make sure you **Authorized** the key (not just imported it)
2. Try connecting with specific key:
   ```bash
   ssh -i ~/.ssh/id_ed25519 solnet@ns2.hostns.io
   ```
3. Check key permissions:
   ```bash
   # Windows PowerShell
   icacls C:\Users\YourUsername\.ssh\id_ed25519
   ```
   Should show `(R,W)`

### Still not working?

**Just use CPanel Terminal instead!** It's easier and requires zero setup.

---

## 💡 Recommendation

**For most people:** Just use CPanel Terminal. It's:
- ✅ Easier (no setup)
- ✅ Works immediately
- ✅ Does everything SSH does
- ✅ No extra configuration needed

**For advanced users:** Set up SSH keys if you prefer working from your local terminal.

---

## 📚 More Info

- Complete deployment guide: [OUZO_HOSTNS_DEPLOYMENT.md](./OUZO_HOSTNS_DEPLOYMENT.md)
- Quick deployment: [QUICK_CPANEL_DEPLOY.md](./QUICK_CPANEL_DEPLOY.md)
- Start here: [START_HERE.md](./START_HERE.md)

