# 🚀 Vercel Deployment Guide - ImpactQuest

This guide will walk you through deploying ImpactQuest to Vercel.

---

## Prerequisites

- ✅ Vercel account ([sign up free](https://vercel.com/signup))
- ✅ GitHub repository (already set up)
- ✅ MongoDB Atlas database
- ✅ Smart contract deployed on Celo Alfajores

---

## 🎯 Quick Deploy (Recommended)

### Option 1: Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"

2. **Import Repository**
   - Click "Import Git Repository"
   - Select **KD-3030/ImpactQuest**
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Add Environment Variables**

   Click "Environment Variables" and add these:

   ```env
   # Required - Public Variables
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x5a1d5441D6abe5E4FaAd49756f5d8f3Cd8Ab88Fe
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=3c3d6d8a8b5e4c8f9a7b6d5e4f3c2b1a
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

   # Required - Secret Variables
   MONGODB_URI=mongodb+srv://your-mongodb-uri
   ORACLE_PRIVATE_KEY=your-oracle-private-key
   ```

   ⚠️ **Important**: 
   - Update `NEXT_PUBLIC_APP_URL` after first deployment
   - Keep `ORACLE_PRIVATE_KEY` secret (only add to production)
   - All variables should be added to "Production" environment

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - You'll get a URL like `https://impact-quest-xxx.vercel.app`

6. **Update App URL**
   - Go to Project Settings → Environment Variables
   - Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
   - Redeploy: Settings → Deployments → Click "..." → "Redeploy"

---

## 🔧 Option 2: Deploy via Vercel CLI

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy from project directory

```bash
cd /Users/anilavo/Desktop/impactQuest
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (first time)
- Project name? `impact-quest` (or your choice)
- Directory? `./` (press Enter)
- Override settings? **N**

### 4. Add Environment Variables

```bash
# Add production environment variables
vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS production
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add MONGODB_URI production
vercel env add ORACLE_PRIVATE_KEY production
```

Paste the values when prompted.

### 5. Deploy to Production

```bash
vercel --prod
```

---

## 📝 Environment Variables Reference

### Public Variables (Safe to expose)

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0x5a1d5441D6abe5E4FaAd49756f5d8f3Cd8Ab88Fe` | ImpactQuest smart contract |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `3c3d6d8a8b5e4c8f9a7b6d5e4f3c2b1a` | WalletConnect ID (placeholder) |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |

### Secret Variables (NEVER commit to Git)

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `ORACLE_PRIVATE_KEY` | `0x...` | Oracle wallet private key (for minting) |

---

## ✅ Post-Deployment Checklist

### 1. Verify Environment Variables
- [ ] All 5 environment variables added
- [ ] `NEXT_PUBLIC_APP_URL` updated with actual Vercel URL
- [ ] MongoDB connection string is correct
- [ ] Oracle private key is correct

### 2. Test Core Functionality
- [ ] Site loads successfully
- [ ] Wallet connection works
- [ ] Network switching to Alfajores works
- [ ] User registration works
- [ ] Quest completion works
- [ ] Token redemption works

### 3. Database Connection
```bash
# Check logs in Vercel Dashboard
# Look for "✅ MongoDB connected successfully"
```

### 4. API Routes
Test these endpoints:
- `https://your-app.vercel.app/api/quests`
- `https://your-app.vercel.app/api/shops`
- `https://your-app.vercel.app/api/user/0xYourAddress`

---

## 🔍 Troubleshooting

### Issue: Build Failed

**Check:**
1. Node version compatibility (Vercel uses Node 18 by default)
2. Missing dependencies in `package.json`
3. TypeScript errors

**Solution:**
```bash
# Test build locally first
npm run build

# If it works locally but fails on Vercel:
# Add .nvmrc file to specify Node version
echo "18" > .nvmrc
git add .nvmrc
git commit -m "Add Node version specification"
git push
```

### Issue: Environment Variables Not Working

**Check:**
1. Variables are added to correct environment (Production)
2. Variable names are exact (case-sensitive)
3. `NEXT_PUBLIC_` prefix for client-side variables

**Solution:**
- Redeploy after adding/updating variables
- Vercel Dashboard → Project → Settings → Environment Variables → Redeploy

### Issue: MongoDB Connection Failed

**Error:** `MongooseError: Connection refused`

**Solutions:**
1. Whitelist Vercel IP in MongoDB Atlas:
   - MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or use Vercel's IP ranges

2. Check MongoDB URI format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

3. Ensure password doesn't contain special characters (URL encode if needed)

### Issue: API Route Timeout

**Error:** `504: Gateway Timeout`

**Solution:**
1. Vercel serverless functions have 10s timeout (Hobby plan)
2. Optimize slow database queries
3. Add indexes to MongoDB collections
4. Consider upgrading to Pro plan (60s timeout)

### Issue: "Module not found" Error

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

---

## 🎨 Custom Domain (Optional)

### Add Custom Domain

1. **Buy Domain** (from Namecheap, GoDaddy, etc.)

2. **Add to Vercel**
   - Vercel Dashboard → Project → Settings → Domains
   - Click "Add"
   - Enter your domain: `impactquest.com`
   - Follow DNS instructions

3. **Update Environment Variable**
   ```
   NEXT_PUBLIC_APP_URL=https://impactquest.com
   ```

4. **Redeploy**

---

## 📊 Monitoring & Analytics

### View Logs
```bash
# Real-time logs
vercel logs your-app-name.vercel.app

# Or in dashboard:
# Project → Deployments → Select deployment → View Function Logs
```

### Add Analytics
1. Vercel Dashboard → Project → Analytics
2. Enable Web Analytics (free)
3. View traffic, performance, and errors

---

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.local` to Git
- ✅ Use Vercel's environment variable system
- ✅ Rotate `ORACLE_PRIVATE_KEY` regularly
- ✅ Use separate wallets for testnet/mainnet

### 2. API Routes
- ✅ Already implemented: Backend oracle for minting
- ✅ User cannot mint tokens directly
- ✅ Proof hash validation prevents replay attacks

### 3. MongoDB
- ✅ Use read/write user (not admin)
- ✅ Enable IP whitelist
- ✅ Use connection string with credentials

---

## 🚀 Continuous Deployment

Every time you push to GitHub `main` branch:
1. Vercel automatically detects the push
2. Builds and deploys new version
3. No downtime (zero-downtime deployment)
4. Previous deployments remain accessible

### Manual Deployment
```bash
# Deploy current branch
vercel

# Deploy specific branch to production
vercel --prod
```

---

## 📈 Performance Optimization

### 1. Image Optimization
Already configured in `next.config.mjs`:
```javascript
images: {
  remotePatterns: [{ protocol: 'https', hostname: '**' }]
}
```

### 2. Caching
- Static assets cached automatically by Vercel CDN
- API routes cache with `Cache-Control` headers
- Database queries cache in application

### 3. Bundle Size
```bash
# Analyze bundle size
npm run build
# Check output for page sizes
```

---

## 🎯 Production Checklist

Before going live on mainnet:

### Smart Contract
- [ ] Audit smart contract
- [ ] Deploy to Celo Mainnet
- [ ] Update `NEXT_PUBLIC_CONTRACT_ADDRESS`
- [ ] Fund oracle wallet with mainnet CELO

### Application
- [ ] Get real WalletConnect Project ID
- [ ] Integrate real OpenAI Vision API
- [ ] Set up IPFS for image storage
- [ ] Enable rate limiting on API routes
- [ ] Add Sentry for error tracking
- [ ] Set up monitoring/alerts

### Database
- [ ] Backup strategy
- [ ] Connection pooling
- [ ] Indexes on frequently queried fields

### Testing
- [ ] Load testing
- [ ] Security audit
- [ ] Cross-browser testing
- [ ] Mobile responsiveness

---

## 🆘 Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **GitHub Issues**: https://github.com/KD-3030/ImpactQuest/issues

---

## 📝 Summary

**Deployment URL**: `https://your-app-name.vercel.app`

**Time to Deploy**: ~3-5 minutes

**Cost**: FREE (Hobby plan sufficient for testing)

**Auto-Deploy**: ✅ Enabled (deploys on every push to main)

---

**Your app is now live!** 🎉

Test it at your Vercel URL and share with others!
