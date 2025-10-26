# ✅ Integration Complete! Setup Guide

## 🎉 Merge Status: SUCCESS

Your three branches have been successfully merged into the `integration` branch!

- ✅ **KD-frontend** (Mystic Theme UI)
- ✅ **MD-smartContract** (Solidity Smart Contracts)
- ✅ **MD-AI** (Backend Logic - minimal changes detected)

## 📁 Current Project Structure

```
impactQuest/
├── app/                          # Next.js 14 Frontend (Your Mystic Theme UI)
│   ├── admin/                    # Admin dashboard
│   ├── dashboard/                # User dashboard
│   ├── api/                      # API routes
│   ├── quest/                    # Quest pages
│   ├── login/                    # Login page
│   └── ...
├── components/                   # React components
│   ├── Sidebar.tsx              # Mystic themed sidebar
│   ├── QuestMap.tsx             # OpenStreetMap integration
│   └── ...
├── contracts/                    # 🆕 Smart Contracts
│   ├── contracts/
│   │   └── ImpactQuest.sol      # Main smart contract
│   ├── scripts/
│   │   ├── deploy.js            # Deployment script
│   │   └── test-contract.js     # Contract testing
│   ├── test/
│   │   └── ImpactQuest.test.js  # Unit tests
│   ├── hardhat.config.js        # Hardhat configuration
│   └── package.json             # Contract dependencies
├── lib/                          # Utilities
│   ├── mongodb.ts               # MongoDB connection
│   └── auth-context.tsx         # Auth context
├── models/                       # Database models
│   └── index.ts
└── scripts/
    ├── seedQuests.js            # Seed database
    └── test-api.sh              # API testing

```

## 🚀 Next Steps to Complete Integration

### Step 1: Install Smart Contract Dependencies

The smart contracts have their own dependencies in the `contracts/` folder:

```bash
# Navigate to contracts folder
cd contracts

# Install contract dependencies
npm install

# Go back to root
cd ..
```

### Step 2: Configure Environment Variables

Create a `.env.local` in the root folder with ALL these variables:

```bash
# ===== Frontend/Database (Existing) =====
MONGODB_URI=your_mongodb_atlas_connection_string

# ===== Smart Contract Configuration (NEW) =====
# For Celo Alfajores Testnet
NEXT_PUBLIC_CHAIN_ID=44787
NEXT_PUBLIC_CONTRACT_ADDRESS=<deploy first, then add here>

# For Smart Contract Deployment (contracts/.env)
PRIVATE_KEY=your_deployer_wallet_private_key
CELO_ALFAJORES_RPC=https://alfajores-forno.celo-testnet.org

# ===== AI Verification (If using) =====
OPENAI_API_KEY=your_openai_api_key
# or whatever AI service you're using for proof verification
```

Also create `contracts/.env`:

```bash
# Copy from example
cp contracts/.env.example contracts/.env

# Edit contracts/.env with your values:
PRIVATE_KEY=your_deployer_private_key
CELO_ALFAJORES_RPC=https://alfajores-forno.celo-testnet.org
```

### Step 3: Deploy Smart Contract

```bash
# From root directory
cd contracts

# Compile contracts
npx hardhat compile

# Deploy to Celo Alfajores testnet
npx hardhat run scripts/deploy.js --network alfajores

# Save the deployed contract address!
# Example output: ImpactQuest deployed to: 0x123abc...

# Test the contract
npx hardhat test

# Go back to root
cd ..
```

### Step 4: Update Frontend with Contract Address

After deployment, update `.env.local`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Your deployed contract address from step 3
```

### Step 5: Create Contract ABI File

After compiling, copy the ABI to your frontend:

```bash
# Create lib directory for blockchain utilities
mkdir -p lib/contracts

# Copy the compiled contract ABI
cp contracts/artifacts/contracts/ImpactQuest.sol/ImpactQuest.json lib/contracts/
```

### Step 6: Create Blockchain Integration File

Create `lib/blockchain.ts` to interact with your smart contract:

```typescript
// lib/blockchain.ts
import { createPublicClient, createWalletClient, http, custom } from 'viem';
import { celoAlfajores } from 'viem/chains';
import ImpactQuestABI from './contracts/ImpactQuest.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http()
});

// Read contract data
export async function getUserProfile(address: string) {
  const data = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ImpactQuestABI.abi,
    functionName: 'userProfiles',
    args: [address]
  });
  return data;
}

// Write contract functions (requires wallet)
export async function completeQuest(
  questId: number,
  proofHash: string,
  walletClient: any
) {
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: ImpactQuestABI.abi,
    functionName: 'completeQuest',
    args: [questId, proofHash],
    account: walletClient.account
  });
  
  const hash = await walletClient.writeContract(request);
  return hash;
}

// Add more contract interaction functions as needed
```

### Step 7: Update Quest Submission to Use Smart Contract

Update `app/api/submit-proof/route.ts` to integrate with blockchain:

```typescript
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Quest } from '@/models';
import { createPublicClient, http } from 'viem';
import { celoAlfajores } from 'viem/chains';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export async function POST(request: Request) {
  try {
    const { questId, userAddress, imageData, proofHash } = await request.json();
    
    await connectDB();
    
    // 1. Verify quest exists
    const quest = await Quest.findById(questId);
    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }
    
    // 2. Check blockchain for on-chain verification
    const publicClient = createPublicClient({
      chain: celoAlfajores,
      transport: http()
    });
    
    const ImpactQuestABI = require('@/lib/contracts/ImpactQuest.json').abi;
    
    const completion = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ImpactQuestABI,
      functionName: 'getQuestCompletion',
      args: [userAddress, questId]
    });
    
    // 3. Update user in database
    let user = await User.findOne({ walletAddress: userAddress });
    if (!user) {
      user = await User.create({
        walletAddress: userAddress,
        level: 1,
        totalImpactPoints: 0,
        completedQuests: 0,
        stage: 'seedling'
      });
    }
    
    // 4. Add points and update user
    user.totalImpactPoints += quest.impactPoints;
    user.completedQuests += 1;
    
    // Update stage based on points
    if (user.totalImpactPoints >= 600) user.stage = 'forest';
    else if (user.totalImpactPoints >= 300) user.stage = 'tree';
    else if (user.totalImpactPoints >= 100) user.stage = 'sprout';
    else user.stage = 'seedling';
    
    await user.save();
    
    return NextResponse.json({ 
      success: true, 
      user,
      blockchainVerified: completion 
    });
  } catch (error) {
    console.error('Submit proof error:', error);
    return NextResponse.json({ error: 'Failed to submit proof' }, { status: 500 });
  }
}
```

### Step 8: Test the Integration

```bash
# Install all root dependencies
npm install

# Run development server
npm run dev

# In another terminal, test smart contracts
cd contracts
npx hardhat test
```

## 🧪 Testing Checklist

### Smart Contract Tests
```bash
cd contracts
npx hardhat test
# Should pass all tests
```

### Frontend Tests
- [ ] Open http://localhost:3000
- [ ] Login page loads with mystic theme
- [ ] Connect wallet (use Celo Alfajores testnet)
- [ ] Browse quests works
- [ ] Quest detail page loads
- [ ] Submit proof UI works
- [ ] Check browser console for errors

### Integration Tests
- [ ] Complete a quest end-to-end
- [ ] Check transaction on Celo explorer
- [ ] Verify tokens were assigned on-chain
- [ ] Confirm database updated with points
- [ ] Check user profile shows updated stats

## 🔗 Integration Points

### Frontend → Smart Contract
- **Quest Completion**: `app/quest/[id]/page.tsx` calls `completeQuest()` on contract
- **User Profile**: Dashboard reads on-chain reputation from contract
- **Token Balance**: Display IMP token balance from contract

### Smart Contract → Database
- **Sync**: After on-chain completion, update MongoDB for quick access
- **Proof Storage**: Store proof hashes on-chain, full images in MongoDB
- **User Stats**: Database mirrors on-chain data for fast queries

### Backend API → Smart Contract
- **Verification Oracle**: Backend verifies proofs, then calls contract
- **Quest Management**: Admin creates quests in DB and on-chain
- **Rewards**: Contract assigns tokens, DB tracks additional metadata

## 📚 Key Files to Know

### Smart Contract
- `contracts/contracts/ImpactQuest.sol` - Main contract
- `contracts/scripts/deploy.js` - Deployment script
- `contracts/hardhat.config.js` - Network configuration

### Frontend
- `app/quest/[id]/page.tsx` - Quest submission (needs contract integration)
- `lib/blockchain.ts` - Contract interaction utilities (create this)
- `app/api/submit-proof/route.ts` - Proof submission API

### Configuration
- `.env.local` - All environment variables
- `contracts/.env` - Contract deployment variables

## 🚨 Common Issues & Solutions

### Issue: "Contract not deployed"
**Solution**: Deploy contract first, then add address to `.env.local`

### Issue: "Transaction failed"
**Solution**: Make sure you have Celo testnet tokens (get from faucet)

### Issue: "Module not found: lib/contracts/ImpactQuest.json"
**Solution**: Run `npx hardhat compile` in contracts folder, then copy ABI

### Issue: "Wrong network"
**Solution**: Switch wallet to Celo Alfajores testnet (chain ID: 44787)

## 🎯 Next Development Tasks

1. **Create `lib/blockchain.ts`** - Smart contract interaction layer
2. **Update quest submission** - Integrate blockchain calls
3. **Add token display** - Show IMP token balance in dashboard
4. **Admin quest creation** - Create quests on-chain
5. **Proof verification** - Backend oracle to verify then call contract
6. **Transaction notifications** - Show transaction status in UI

## 📞 Ready to Test?

Run these commands in sequence:

```bash
# 1. Install contract dependencies
cd contracts && npm install && cd ..

# 2. Deploy contract (after setting up contracts/.env)
cd contracts && npx hardhat run scripts/deploy.js --network alfajores && cd ..

# 3. Update .env.local with contract address

# 4. Start development server
npm run dev

# 5. Test in browser at http://localhost:3000
```

## 🎉 Congratulations!

Your frontend, backend, and smart contracts are now merged! The mystic theme UI is preserved, and smart contracts are ready to be integrated.

**Current Branch**: `integration`

**To merge to main** (after testing):
```bash
git checkout main
git merge integration
git push origin main
```

Need help with specific integration? Let me know! 🚀
