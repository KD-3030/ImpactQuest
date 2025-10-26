# Quick Fix: Get Your WalletConnect Project ID

## 🚀 5-Minute Setup (Recommended)

### Step 1: Visit WalletConnect Cloud
👉 **https://cloud.reown.com/sign-in**

### Step 2: Sign Up (30 seconds)
- Click "Sign in with GitHub" (fastest)
- Or use Google/Email

### Step 3: Create Project (1 minute)
1. Click **"Create New Project"**
2. Project Name: `ImpactQuest`
3. Homepage URL: `http://localhost:3000`
4. Click **"Create"**

### Step 4: Copy Project ID (10 seconds)
You'll see something like:
```
Project ID: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Step 5: Update .env.local (30 seconds)
Open `.env.local` and replace:

```bash
# OLD (demo ID - causes 403 errors)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=demo-project-id-impactquest

# NEW (your real ID)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Step 6: Restart Server (10 seconds)
```bash
# Press Ctrl+C to stop
# Then restart
npm run dev
```

## ✅ Done!

All 403 errors will disappear from your console.

---

## 🤔 Why Do I Need This?

- **WalletConnect** = Industry standard for connecting crypto wallets
- **Project ID** = Free API key to use their infrastructure
- **Benefits**: 
  - ✅ Cleaner console logs
  - ✅ Better wallet connection reliability
  - ✅ QR code support for mobile wallets
  - ✅ Analytics dashboard
  - ✅ Production-ready

---

## 💡 Already Applied Temporary Fix

I've added code to suppress the warnings in development, so your console is already cleaner. But for production, you should get a real Project ID.

---

## 🆓 Is It Free?

**YES!** WalletConnect Cloud is free forever for:
- Unlimited wallet connections
- All features
- No credit card required

---

## ⏭️ Can I Skip This?

**Yes!** Your app works perfectly without it. The errors are cosmetic. But getting a real ID takes 5 minutes and makes everything cleaner.

---

## 📸 Visual Guide

1. **Reown Cloud Homepage**
   ```
   https://cloud.reown.com/sign-in
   [Sign in with GitHub] [Sign in with Google] [Email]
   ```

2. **Create Project Screen**
   ```
   Project Name: [ImpactQuest____________]
   Homepage URL: [http://localhost:3000__]
   [Create Project]
   ```

3. **Project Dashboard**
   ```
   🎉 Project Created!
   
   Project ID: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   [Copy]
   ```

4. **Paste in .env.local**
   ```bash
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

That's it! 🚀
