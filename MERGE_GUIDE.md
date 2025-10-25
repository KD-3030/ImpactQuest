# 🔗 Merging Backend & Frontend Branches Guide

## Current Setup
- **Frontend Branch**: `KD-frontend` (current)
- **Backend Branch**: (Your smart contracts & backend logic branch)
- **Main Branch**: `main`

## 📋 Pre-Merge Checklist

### 1. **Commit Your Current Frontend Changes**
```bash
# Save all your frontend UI updates
git add .
git commit -m "feat: implement mystic theme with new color palette (#100720, #31087B, #FA2FB5, #FFC23C)"
git push origin KD-frontend
```

### 2. **Check Your Backend Branch Name**
```bash
# List all branches to find your backend branch
git branch -a

# Or if it's remote only
git fetch origin
git branch -r
```

## 🔄 Merge Strategy Options

### **Option A: Merge Backend into Frontend (Recommended)**
This keeps your frontend as the base and adds backend features.

```bash
# 1. Make sure you're on frontend branch
git checkout KD-frontend

# 2. Commit any uncommitted changes
git add .
git commit -m "feat: complete frontend with mystic theme"

# 3. Fetch latest from remote
git fetch origin

# 4. Merge your backend branch (replace 'backend-branch-name' with actual name)
git merge origin/backend-branch-name

# 5. Resolve any conflicts (see below)
# Then commit the merge
git add .
git commit -m "merge: integrate backend logic and smart contracts with frontend"

# 6. Push merged code
git push origin KD-frontend
```

### **Option B: Create a New Integration Branch**
This keeps both branches clean and creates a new integration branch.

```bash
# 1. Create new branch from frontend
git checkout KD-frontend
git checkout -b integration

# 2. Merge backend branch
git merge origin/backend-branch-name

# 3. Resolve conflicts and test
git add .
git commit -m "merge: integrate backend and frontend"

# 4. Push integration branch
git push origin integration

# 5. Later merge integration to main
git checkout main
git merge integration
```

### **Option C: Rebase Backend onto Frontend**
This creates a cleaner commit history.

```bash
# 1. Checkout backend branch
git checkout backend-branch-name

# 2. Rebase onto frontend
git rebase KD-frontend

# 3. Resolve conflicts during rebase
# Then continue
git rebase --continue

# 4. Merge into frontend
git checkout KD-frontend
git merge backend-branch-name

# 5. Push
git push origin KD-frontend
```

## 🔧 Expected File Conflicts

Based on your current frontend structure, you'll likely have conflicts in:

### **Files That May Conflict:**
- `package.json` - Dependencies from both branches
- `next.config.mjs` - Configuration differences
- `.env.local` / `.env` - Environment variables
- `app/api/**/*.ts` - API routes (if backend has different implementations)
- `lib/**` - Utility functions
- `models/**` - Data models/schemas

### **Files to Keep from Frontend:**
- `app/**/page.tsx` - All your UI components with mystic theme
- `components/**` - Your updated Sidebar, QuestMap, etc.
- `app/globals.css` - Your new color scheme
- `tailwind.config.ts` - Your color palette configuration

### **Files to Keep from Backend:**
- Smart contract files (typically in `contracts/` or `blockchain/`)
- Backend API logic (new endpoints or enhanced logic)
- Database schemas/models (if different from current)
- Authentication logic (if enhanced)

## 🛠️ Resolving Conflicts

When conflicts occur, Git will mark them like this:

```javascript
<<<<<<< HEAD (Your frontend code)
const API_URL = '/api/quests';
=======
const API_URL = process.env.NEXT_PUBLIC_API_URL + '/quests';
>>>>>>> backend-branch-name (Backend code)
```

### **How to Resolve:**

1. **Open the conflicted file**
2. **Decide which version to keep or combine both**
3. **Remove conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)**
4. **Test the merged code**

### **Common Conflict Resolutions:**

#### **package.json**
```bash
# Use npm to help merge dependencies
git checkout --theirs package.json
npm install
# Or manually merge both sets of dependencies
```

#### **API Routes**
- Keep backend logic but ensure endpoints match frontend calls
- Update frontend API calls if endpoint structure changed

#### **Environment Variables**
```bash
# Merge both .env files manually
# Keep all variables from both branches
```

## 🔗 Integration Points to Check

After merging, verify these connection points:

### 1. **Smart Contract Integration**
```typescript
// Frontend should call smart contract functions
// Check these files:
- app/quest/[id]/page.tsx (quest completion)
- lib/blockchain.ts (if exists)
- app/api/submit-proof/route.ts (token assignment)
```

### 2. **API Endpoints Compatibility**
Ensure frontend API calls match backend implementations:

```typescript
// Frontend calls (current):
- GET /api/quests
- GET /api/quests/[id]
- POST /api/submit-proof
- GET /api/user/[address]
- POST /api/user/[address] (create/update)

// Verify backend has these endpoints
```

### 3. **Database Connection**
```typescript
// Current: MongoDB Atlas in lib/mongodb.ts
// Ensure backend uses same connection
// Check: models/index.ts for schema compatibility
```

### 4. **Wallet Integration**
```typescript
// Current: RainbowKit + wagmi + viem
// Ensure smart contracts use same wallet provider
// Check: app/providers.tsx
```

### 5. **Environment Variables**
Create a merged `.env.local`:

```bash
# Frontend Variables (current)
MONGODB_URI=your_mongodb_connection_string

# Backend Variables (add yours)
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_CHAIN_ID=44787 # Celo Alfajores
PRIVATE_KEY=your_deployer_private_key
# Add any other backend env vars
```

## 📝 Post-Merge Testing Checklist

After successful merge:

```bash
# 1. Install all dependencies
npm install

# 2. Check for TypeScript errors
npx tsc --noEmit

# 3. Run development server
npm run dev

# 4. Test all features:
```

### **Frontend Features to Test:**
- [ ] Landing page loads with mystic theme
- [ ] Login/role selection works
- [ ] User dashboard displays
- [ ] Quest browsing with map
- [ ] Quest detail page
- [ ] Camera/upload submission UI

### **Backend Features to Test:**
- [ ] Smart contract deployment
- [ ] Token assignment on quest completion
- [ ] Database CRUD operations
- [ ] API endpoints respond correctly
- [ ] Wallet connection to blockchain

### **Integration Features to Test:**
- [ ] Quest completion triggers smart contract
- [ ] Points assigned on-chain
- [ ] User stats update in DB and blockchain
- [ ] Proof verification works
- [ ] Admin can review submissions

## 🚀 Deployment After Merge

Once everything is tested:

```bash
# 1. Merge to main branch
git checkout main
git merge KD-frontend

# 2. Push to main
git push origin main

# 3. Deploy to your hosting (Vercel, etc.)
# Make sure to set all environment variables in deployment platform
```

## 🆘 If Something Goes Wrong

### **Abort a merge:**
```bash
git merge --abort
```

### **Reset to before merge:**
```bash
git reset --hard HEAD~1
```

### **Recover lost work:**
```bash
git reflog
git checkout <commit-hash>
```

## 💡 Best Practices

1. **Backup before merging**: Create a backup branch
   ```bash
   git checkout KD-frontend
   git checkout -b KD-frontend-backup
   ```

2. **Test incrementally**: Don't merge everything at once
   - Merge dependencies first
   - Then merge backend logic
   - Finally integrate smart contracts

3. **Use pull requests**: If working with a team
   - Create PR from backend to frontend
   - Review changes before merging
   - Get team approval

4. **Document changes**: Update README with:
   - New setup instructions
   - Smart contract addresses
   - Deployment steps

## 📞 Need Help?

If you encounter specific conflicts, share:
1. The conflicted file names
2. Your backend branch name
3. Any error messages

I can help you resolve specific merge conflicts!

---

## Quick Command Reference

```bash
# View all branches
git branch -a

# Switch branches
git checkout branch-name

# Merge branch
git merge other-branch

# Check merge status
git status

# Continue after resolving conflicts
git add .
git commit

# Abort merge
git merge --abort

# View commit history
git log --oneline --graph --all
```
