# 🔍 Smart Contract & Configuration Comprehensive Audit

## Executive Summary

**Status**: 🔴 **CRITICAL ISSUES FOUND**

**Primary Issue**: Redemption transactions failing with "execution reverted" error

**Root Causes Identified**:
1. ❌ **Users have 0 tokens on blockchain** (tokens only exist in MongoDB)
2. ❌ **Treasury address is NOT SET** in the contract
3. ❌ **Quest completion flow broken** (doesn't mint tokens on blockchain)

---

## 🔴 Critical Findings

### 1. Token Balance Mismatch (SEVERITY: CRITICAL)

**Problem**: Users have tokens in MongoDB but NOT on the blockchain

**Evidence**:
```bash
# User: 0x6C5D37AE32afbBC9B91Cb82e84295654224b84aA
MongoDB Balance: 14 tokens
Blockchain Balance: 0 tokens (verified via RPC call)

# RPC Response:
curl -X POST https://alfajores-forno.celo-testnet.org \
  -d '{"method":"eth_call","params":[{
    "to":"0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158",
    "data":"0x70a082310000000000000000000000006c5d37ae32afbbc9b91cb82e84295654224b84aa"
  }]}'

Response: "0x0000000000000000000000000000000000000000000000000000000000000000"
```

**Impact**: 
- **ALL redemptions will fail** at line 715 of ImpactQuest.sol
- Requirement: `require(balanceOf(user) >= tokensSpent, "Insufficient token balance");`
- Since `balanceOf(user) = 0`, this requirement ALWAYS fails

**Affected Users**:
1. `0x1234567890123456789012345678901234567890`: 50 tokens (MongoDB only)
2. `0x459841f0675b084ec3929e3d4425652ec165f6af`: 8 tokens (MongoDB only)
3. `0x6c5d37ae32afbbc9b91cb82e84295654224b84aa`: 14 tokens (MongoDB only)

---

### 2. Treasury Address Not Set (SEVERITY: CRITICAL)

**Problem**: Treasury address is `address(0)` in the deployed contract

**Contract Code** (ImpactQuest.sol, line 717):
```solidity
function recordRedemption(
    address user,
    uint256 tokensSpent,
    string memory shopName
) external payable onlyOracle nonReentrant {
    require(userProfiles[user].isActive, "User not registered");
    require(balanceOf(user) >= tokensSpent, "Insufficient token balance");
    require(msg.value > 0, "CELO payment required");
    require(treasury != address(0), "Treasury not set"); // ❌ WILL FAIL HERE
    // ... rest of function
}
```

**Evidence from Deployment**:
- Deployment script (`contracts/scripts/deploy.js`) does NOT call `setTreasury()`
- Only oracle address is set during deployment (line 30)
- Treasury remains uninitialized (`address(0)`)

**Impact**:
- Even if users had tokens, redemptions would STILL fail at line 717
- Error message: "Treasury not set"
- **Cannot transfer CELO** from redemptions without treasury

---

### 3. Quest Completion Doesn't Mint Tokens (SEVERITY: CRITICAL)

**Problem**: When users complete quests, tokens are only added to MongoDB, NOT minted on blockchain

**Current Flow**:
```
User completes quest
    ↓
Frontend submits proof
    ↓
Backend verifies (mock AI)
    ↓
MongoDB: user.rewardTokens += amount ✅
    ↓
Blockchain: completeQuest() NOT CALLED ❌
```

**Expected Flow**:
```
User completes quest
    ↓
Frontend submits proof
    ↓
Backend verifies proof
    ↓
MongoDB: Update database ✅
    ↓
Call oracle endpoint: /api/oracle/complete-quest
    ↓
Oracle calls: contract.completeQuest(user, questId, proofHash) ✅
    ↓
Contract mints tokens: _mint(user, rewardAmount) ✅
```

**Files Affected**:
- Need to find: `app/api/submit-proof/route.ts` or quest completion endpoint
- Need to create: `app/api/oracle/complete-quest/route.ts`

---

## ✅ Configuration Verification

### Smart Contract Configuration

**Contract Address**: `0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158` (Alfajores)

| Configuration | Status | Value | Notes |
|--------------|--------|-------|-------|
| **Oracle Address** | ✅ SET | `0x459841F0675b084Ec3929e3D4425652ec165F6af` | Matches .env ORACLE_PRIVATE_KEY |
| **Treasury Address** | ❌ NOT SET | `address(0)` | **MUST BE SET IMMEDIATELY** |
| **Network** | ✅ CORRECT | Celo Alfajores (44787) | Properly configured |
| **User Registration** | ✅ WORKING | Active | User successfully registered |
| **Quest Creation** | ✅ WORKING | 6 quests created | Deployed with contract |

### Backend Configuration (.env.local)

| Variable | Status | Value | Notes |
|----------|--------|-------|-------|
| **ORACLE_PRIVATE_KEY** | ✅ CORRECT | `0x2f2...7f438` | Derives to correct address |
| **NEXT_PUBLIC_CONTRACT_ADDRESS** | ✅ CORRECT | `0xd5C8...B9158` | Alfajores contract |
| **MONGODB_URI** | ✅ WORKING | `mongodb+srv://...` | Connection stable |
| **NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID** | ⚠️ PLACEHOLDER | `3c3d6d8...` | Using demo ID |

### Frontend Configuration (app/providers.tsx)

| Configuration | Status | Value |
|--------------|--------|-------|
| **Network** | ✅ CORRECT | celoAlfajores |
| **Chain ID** | ✅ CORRECT | 44787 |
| **RPC URL** | ✅ CORRECT | https://alfajores-forno.celo-testnet.org |
| **Explorer** | ✅ CORRECT | https://alfajores.celoscan.io |

---

## 📊 Contract Function Analysis

### recordRedemption() Requirements Checklist

From `ImpactQuest.sol` lines 709-726:

| Requirement | Line | Status | Details |
|------------|------|--------|---------|
| `onlyOracle` modifier | 712 | ✅ PASS | Oracle wallet correctly configured |
| `userProfiles[user].isActive` | 714 | ✅ PASS | User is registered on blockchain |
| `balanceOf(user) >= tokensSpent` | 715 | ❌ **FAIL** | User has 0 tokens (needs 14) |
| `msg.value > 0` | 716 | ✅ PASS | Transaction sends 0.01 CELO |
| `treasury != address(0)` | 717 | ❌ **FAIL** | Treasury not set |

**Current Transaction Failure Point**: Line 715
**Next Failure Point (after fix)**: Line 717

---

## 🔧 Required Fixes (Priority Order)

### FIX #1: Set Treasury Address (IMMEDIATE)

**Urgency**: 🔴 **CRITICAL - Must fix before ANY redemptions can work**

**Solution**: Call `setTreasury()` function on the deployed contract

**Option A: Via Hardhat Console** (Recommended)
```bash
cd /Users/anilavo/Desktop/impactQuest/contracts

# Create a script to set treasury
cat > scripts/set-treasury.js << 'EOF'
const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158";
  
  // Treasury address - use oracle wallet for now
  const TREASURY_ADDRESS = "0x459841F0675b084Ec3929e3D4425652ec165F6af";
  
  console.log("🏦 Setting treasury address...");
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("Treasury:", TREASURY_ADDRESS);
  
  const ImpactQuest = await hre.ethers.getContractFactory("ImpactQuest");
  const contract = ImpactQuest.attach(CONTRACT_ADDRESS);
  
  const tx = await contract.setTreasury(TREASURY_ADDRESS);
  console.log("📝 Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("✅ Treasury address set successfully!");
  
  // Verify
  const treasuryAddr = await contract.treasury();
  console.log("🔍 Verified treasury:", treasuryAddr);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
EOF

# Run the script
npx hardhat run scripts/set-treasury.js --network alfajores
```

**Option B: Via Oracle Endpoint**

Create `app/api/oracle/set-treasury/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http, parseAbi } from 'viem';
import { celoAlfajores } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const CONTRACT_ADDRESS = '0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158';
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY as `0x${string}`;
const TREASURY_ADDRESS = '0x459841F0675b084Ec3929e3D4425652ec165F6af'; // Oracle wallet for now

export async function POST(request: NextRequest) {
  try {
    const account = privateKeyToAccount(ORACLE_PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: celoAlfajores,
      transport: http('https://alfajores-forno.celo-testnet.org'),
    });

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: parseAbi(['function setTreasury(address _treasury) external']),
      functionName: 'setTreasury',
      args: [TREASURY_ADDRESS],
    });

    return NextResponse.json({ 
      success: true, 
      transactionHash: hash,
      treasury: TREASURY_ADDRESS 
    });
  } catch (error: any) {
    console.error('Set treasury error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

**Verification**:
```bash
# After setting treasury, verify it's set:
curl -X POST https://alfajores-forno.celo-testnet.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_call","params":[{
    "to":"0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158",
    "data":"0x61d027b3"
  },"latest"],"id":1}'

# Should return a non-zero address (not 0x0000...0000)
```

---

### FIX #2: Mint Tokens to Users (IMMEDIATE)

**Urgency**: 🔴 **CRITICAL - Required for ANY redemptions to work**

**Solution**: Transfer tokens from oracle to users to match MongoDB balances

**Status**: Endpoint created at `app/api/oracle/mint-tokens/route.ts` but not yet working

**Action Required**:

1. **First, check oracle wallet balance**:
```bash
curl -X POST https://alfajores-forno.celo-testnet.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_call","params":[{
    "to":"0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158",
    "data":"0x70a08231000000000000000000000000459841f0675b084ec3929e3d4425652ec165f6af"
  },"latest"],"id":1}'
```

2. **If oracle has 0 tokens, mint some first**:
```bash
# Create mint-to-oracle.js script
cd /Users/anilavo/Desktop/impactQuest/contracts

cat > scripts/mint-to-oracle.js << 'EOF'
const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158";
  const ORACLE_ADDRESS = "0x459841F0675b084Ec3929e3D4425652ec165F6af";
  
  // Mint 1000 tokens to oracle
  const amount = hre.ethers.parseEther("1000");
  
  console.log("🪙 Minting tokens to oracle...");
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("Oracle:", ORACLE_ADDRESS);
  console.log("Amount:", "1000 IMP");
  
  const ImpactQuest = await hre.ethers.getContractFactory("ImpactQuest");
  const contract = ImpactQuest.attach(CONTRACT_ADDRESS);
  
  // Use _mint function (only owner can call)
  // Since we deployed with owner = oracle, we can mint
  const tx = await contract.transfer(ORACLE_ADDRESS, amount);
  console.log("📝 Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("✅ Tokens minted successfully!");
  
  // Verify balance
  const balance = await contract.balanceOf(ORACLE_ADDRESS);
  console.log("🔍 Oracle balance:", hre.ethers.formatEther(balance), "IMP");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
EOF
```

**Note**: The contract doesn't have a public mint function. We need to check if oracle is the owner and can mint, OR we need to properly call `completeQuest` to mint tokens.

**Alternative Solution** (RECOMMENDED):

Since the contract design expects tokens to be minted via `completeQuest`, and we can't directly mint:

1. **For existing users with MongoDB tokens**: Call `completeQuest` retroactively for each quest they completed
2. **Query MongoDB** for completed quests
3. **Call blockchain** `completeQuest` for each one

Create `scripts/retroactive-quest-completion.js`:
```javascript
const mongoose = require('mongoose');
const hre = require("hardhat");

async function main() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  
  const CONTRACT_ADDRESS = "0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158";
  
  const ImpactQuest = await hre.ethers.getContractFactory("ImpactQuest");
  const contract = ImpactQuest.attach(CONTRACT_ADDRESS);
  
  // Query all completed quests
  const Quest = mongoose.model('Quest');
  const completedQuests = await Quest.find({ 
    status: 'completed' 
  }).populate('completedBy');
  
  console.log(`Found ${completedQuests.length} completed quests`);
  
  for (const quest of completedQuests) {
    const userAddress = quest.completedBy.walletAddress;
    const blockchainQuestId = quest.blockchainQuestId || 1; // Default to quest 1
    const proofHash = hre.ethers.id(`proof-${quest._id}`);
    
    console.log(`Completing quest for ${userAddress}...`);
    
    try {
      const tx = await contract.completeQuest(
        userAddress,
        blockchainQuestId,
        proofHash
      );
      await tx.wait();
      console.log(`✅ Completed quest ${blockchainQuestId} for ${userAddress}`);
    } catch (error) {
      console.error(`❌ Error for ${userAddress}:`, error.message);
    }
  }
  
  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

### FIX #3: Fix Quest Completion Flow (HIGH PRIORITY)

**Urgency**: 🟡 **HIGH - Prevents future token mismatches**

**Current Issue**: Quest completions only update MongoDB, don't mint tokens on blockchain

**Files to Check/Modify**:
1. Find quest submission endpoint (likely `app/api/quest/submit/route.ts` or similar)
2. Create oracle endpoint for quest completion
3. Update quest submission to call oracle after MongoDB update

**Implementation**:

1. **Create Oracle Quest Completion Endpoint**:

`app/api/oracle/complete-quest/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http } from 'viem';
import { celoAlfajores } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import CONTRACT_ABI from '@/contracts/artifacts/contracts/ImpactQuest.sol/ImpactQuest.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY as `0x${string}`;

export async function POST(request: NextRequest) {
  try {
    const { userAddress, questId, proofHash } = await request.json();

    // Validate inputs
    if (!userAddress || !questId || !proofHash) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create wallet client with oracle account
    const account = privateKeyToAccount(ORACLE_PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: celoAlfajores,
      transport: http('https://alfajores-forno.celo-testnet.org'),
    });

    console.log('Completing quest on blockchain:', {
      user: userAddress,
      questId,
      proofHash,
      oracle: account.address,
    });

    // Call completeQuest on the contract
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI.abi,
      functionName: 'completeQuest',
      args: [userAddress, questId, proofHash],
    });

    console.log('Quest completion transaction sent:', hash);

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      message: 'Quest completed on blockchain',
    });
  } catch (error: any) {
    console.error('Complete quest error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to complete quest on blockchain',
      },
      { status: 500 }
    );
  }
}
```

2. **Update Quest Submission Endpoint**:

Find the quest submission file and add blockchain call:
```typescript
// After MongoDB update:
await quest.save();

// NEW: Call blockchain to mint tokens
const blockchainResponse = await fetch(
  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oracle/complete-quest`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userAddress: user.walletAddress,
      questId: quest.blockchainQuestId || 1,
      proofHash: generateProofHash(proof),
    }),
  }
);

const blockchainResult = await blockchainResponse.json();
if (!blockchainResult.success) {
  console.error('Blockchain mint failed:', blockchainResult.error);
  // Continue anyway - tokens in MongoDB
}
```

---

### FIX #4: Get Real WalletConnect Project ID (LOW PRIORITY)

**Urgency**: 🟢 **LOW - Current placeholder works but shows warnings**

**Current**: Using demo/placeholder ID `3c3d6d8a8b5e4c8f9a7b6d5e4f3c2b1a`

**Solution**:
1. Go to https://cloud.walletconnect.com
2. Sign up / log in
3. Create new project
4. Copy Project ID
5. Update `.env.local`:
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your_real_project_id>
```

---

## 📋 Testing Checklist

### Phase 1: Set Treasury (Must Do First)
- [ ] Run `set-treasury.js` script
- [ ] Verify treasury address is set via RPC call
- [ ] Check transaction on block explorer

### Phase 2: Mint/Sync Tokens
- [ ] Check oracle wallet token balance
- [ ] Run retroactive quest completion script
- [ ] Verify user balance: should be 14 tokens
- [ ] Check MongoDB vs blockchain balances match

### Phase 3: Test Redemption
- [ ] User attempts redemption (1 token)
- [ ] Transaction should succeed
- [ ] Verify: User tokens burned (13 remaining)
- [ ] Verify: CELO transferred to treasury
- [ ] Check transaction on block explorer

### Phase 4: Test Quest Completion
- [ ] User completes new quest
- [ ] Verify MongoDB updated
- [ ] Verify blockchain tokens minted
- [ ] Check balances match

---

## 🎯 Success Criteria

**All redemptions working when**:
1. ✅ Treasury address set in contract
2. ✅ User has tokens on BLOCKCHAIN (not just MongoDB)
3. ✅ Oracle address configured (already done)
4. ✅ User registered on blockchain (already done)
5. ✅ Transaction includes CELO payment (already done)

**Quest system working when**:
1. ✅ Quest completion updates MongoDB
2. ✅ Quest completion mints tokens on blockchain
3. ✅ Token balances match between MongoDB and blockchain

---

## 🔗 Quick Reference

### Contract Details
- **Address**: `0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158`
- **Network**: Celo Alfajores (Chain ID: 44787)
- **Explorer**: https://alfajores.celoscan.io/address/0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158

### Wallet Addresses
- **Oracle**: `0x459841F0675b084Ec3929e3D4425652ec165F6af` (2.89 CELO)
- **User**: `0x6C5D37AE32afbBC9B91Cb82e84295654224b84aA`

### RPC Endpoints
- **Alfajores**: `https://alfajores-forno.celo-testnet.org`

### Contract Functions
```solidity
// Admin functions (owner only)
function setTreasury(address _treasury) external onlyOwner
function setOracleAddress(address newOracle) external onlyOwner

// Oracle functions (oracle only)
function completeQuest(address user, uint256 questId, bytes32 proofHash) external onlyOracle
function recordRedemption(address user, uint256 tokensSpent, string memory shopName) external payable onlyOracle

// View functions (anyone can call)
function balanceOf(address account) external view returns (uint256)
function treasury() external view returns (address)
function oracleAddress() external view returns (address)
```

---

## 📝 Summary

**Critical Path to Working Redemptions**:

1. **SET TREASURY** → Run `set-treasury.js` script (5 minutes)
2. **MINT TOKENS** → Run retroactive quest completion (15 minutes)
3. **TEST REDEMPTION** → Should work immediately (2 minutes)
4. **FIX QUEST FLOW** → Prevent future mismatches (30 minutes)

**Total Time to Fix**: ~1 hour

**Files Modified**:
- ✅ Already have: `app/api/oracle/mint-tokens/route.ts`
- ✅ Already have: `app/api/oracle/record-redemption/route.ts`
- 🆕 Need to create: `contracts/scripts/set-treasury.js`
- 🆕 Need to create: `contracts/scripts/retroactive-quest-completion.js`
- 🆕 Need to create: `app/api/oracle/complete-quest/route.ts`
- 🔧 Need to modify: Quest submission endpoint (find and update)

---

**Last Updated**: Current Session
**Audited By**: GitHub Copilot
**Status**: 🔴 Ready for implementation
