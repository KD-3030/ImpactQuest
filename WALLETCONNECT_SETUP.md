# WalletConnect Setup Guide

## Current Status
✅ **Quick Fix Applied** - Using demo project ID to suppress warnings

## Warnings Fixed

### 1. WalletConnect Multiple Initialization Warning
**Issue**: `WalletConnect Core is already initialized. This is probably a mistake...`

**Fix Applied**: 
- Moved QueryClient creation inside component using `useState`
- This prevents recreation on every render
- Ensures WalletConnect is only initialized once

### 2. Reown Config 403 Error
**Issue**: `Failed to fetch remote project configuration. Using local/default values. Error: HTTP status code: 403`

**Temporary Fix Applied**:
- Changed placeholder `your_project_id_here` to `demo-project-id-impactquest`
- This suppresses the 403 error but uses fallback configuration

## For Production: Get Real WalletConnect Project ID

### Steps:

1. **Visit Reown Cloud** (formerly WalletConnect)
   ```
   https://cloud.reown.com/sign-in
   ```

2. **Sign Up/Login**
   - Use GitHub, Google, or Email
   - It's completely free

3. **Create New Project**
   - Click "Create Project"
   - Name it "ImpactQuest" (or your preferred name)
   - Select project type: "App"

4. **Copy Project ID**
   - You'll see your Project ID on the dashboard
   - It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

5. **Update `.env.local`**
   ```bash
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_REAL_PROJECT_ID_HERE
   ```

6. **Restart Dev Server**
   ```bash
   npm run dev
   ```

## Benefits of Real Project ID

✅ Access to WalletConnect Cloud features
✅ Analytics dashboard
✅ Better connection reliability
✅ No 403 errors
✅ Support for all WalletConnect wallets
✅ Production-ready configuration

## Current Configuration

**File**: `app/providers.tsx`
```typescript
const config = getDefaultConfig({
  appName: 'ImpactQuest',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id-impactquest',
  chains: [celo, celoAlfajores],
  ssr: true,
});
```

**Environment**: `.env.local`
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=demo-project-id-impactquest
```

## Troubleshooting

### Still seeing warnings?
1. Clear `.next` folder: `rm -rf .next`
2. Restart dev server: `npm run dev`
3. Hard refresh browser: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

### Multiple WalletConnect instances?
- Make sure you're not importing `Providers` multiple times
- Check that `layout.tsx` only wraps children once with `<Providers>`

## Notes

- The demo project ID works for development
- For production deployment, **you must get a real project ID**
- Without a real project ID, some wallets may have connection issues
- The free tier is sufficient for most applications

## Resources

- [Reown Cloud Dashboard](https://cloud.reown.com/)
- [WalletConnect Docs](https://docs.walletconnect.com/)
- [RainbowKit Docs](https://www.rainbowkit.com/)
