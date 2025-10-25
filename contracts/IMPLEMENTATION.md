# 🌱 ImpactQuest Smart Contract - Complete Implementation

## ✅ What We Built

### Token-Based System (Phase 1)
Your smart contract is now **COMPLETE** and ready for deployment! Here's what it does:

## 🎯 Core Features Implemented

### 1. **User System** 
- ✅ Join ImpactQuest (user registration)
- ✅ User profiles with stats
- ✅ Progressive leveling: Seedling → Sprout → Sapling → Tree
- ✅ Timestamps for all activities

### 2. **Quest System**
- ✅ Quest creation and management
- ✅ Quest completion recording
- ✅ Cooldown periods (prevents spam)
- ✅ Quest active/inactive toggle

### 3. **Token Rewards (IMP)**
- ✅ ERC20 token (ImpactQuest Token - IMP)
- ✅ Auto-minting on quest completion
- ✅ Customizable reward amounts per quest
- ✅ Optional: Can make soulbound (non-transferable)

### 4. **Impact Scoring**
- ✅ Each quest has an impact score
- ✅累积 impact scores unlock levels
- ✅ Level thresholds: 10, 50, 150, 500
- ✅ Automatic level-up events

### 5. **Security & Anti-Fraud**
- ✅ Proof hash system (prevents replay attacks)
- ✅ Each proof can only be used once
- ✅ Oracle-only quest completion (AI verification)
- ✅ Reentrancy protection
- ✅ Owner-only admin functions

### 6. **Timestamps & Hashing**
- ✅ Block timestamps for all completions
- ✅ Proof hashes (keccak256) for verification
- ✅ Last quest completion tracking
- ✅ Join date recording

## 📊 How It Works (The Full Flow)

```
USER ACTION → FRONTEND → AI ORACLE (Backend) → SMART CONTRACT → BLOCKCHAIN
```

### Step-by-Step:

1. **User Joins** (`joinImpactQuest()`)
   - Creates user profile
   - Sets joined timestamp
   - Emits `UserJoined` event

2. **User Completes Quest in Real World**
   - Takes photo with native camera
   - Frontend sends to your AI Oracle backend

3. **AI Oracle Verifies** (Your Backend)
   ```javascript
   // Backend generates proof hash
   const proofHash = ethers.keccak256(
     ethers.toUtf8Bytes(imageHash + aiVerification)
   );
   ```

4. **Backend Calls Smart Contract** (`completeQuest()`)
   - Validates cooldown period ✓
   - Checks proof hasn't been used ✓
   - Records completion with timestamp ✓
   - Mints IMP tokens ✓
   - Updates impact score ✓
   - Checks for level up ✓
   - Emits events ✓

5. **User Sees Results**
   - Wallet balance: +10 IMP tokens
   - Profile: Impact score increased
   - Level: "You leveled up to Sprout! 🌿"

## 🎮 Quest Examples (Pre-Configured)

The deployment script creates 3 quests automatically:

| Quest | Reward | Impact Score | Cooldown |
|-------|--------|--------------|----------|
| Beach Cleanup | 10 IMP | 10 | 1 hour |
| Tree Planting | 25 IMP | 25 | 24 hours |
| Community Garden | 15 IMP | 15 | 1 hour |

## 🔐 Security Features

### 1. Proof Hash Anti-Replay
```solidity
mapping(bytes32 => bool) public usedProofHashes;
require(!usedProofHashes[proofHash], "Proof already used");
```
**Why**: Prevents users from reusing the same photo multiple times.

### 2. Cooldown System
```solidity
uint256 lastCompletion = lastQuestCompletionTime[user][questId];
require(
  block.timestamp >= lastCompletion + cooldownPeriod,
  "Quest cooldown not expired"
);
```
**Why**: Prevents quest spam (e.g., submitting 100 beach cleanups in 1 minute).

### 3. Oracle Authorization
```solidity
modifier onlyOracle() {
  require(msg.sender == oracleAddress, "Only oracle can call this");
  _;
}
```
**Why**: Only your verified backend can record completions (not random users).

### 4. Reentrancy Guard
```solidity
function completeQuest(...) external onlyOracle nonReentrant {
  // Protected from reentrancy attacks
}
```
**Why**: Prevents advanced attack vectors.

## 📁 Files Created

```
contracts/
├── contracts/
│   └── ImpactQuest.sol          ✅ Main smart contract
├── scripts/
│   └── deploy.js                ✅ Deployment script
├── hardhat.config.js            ✅ Hardhat configuration
├── package.json                 ✅ Dependencies
├── .env.example                 ✅ Environment template
├── .gitignore                   ✅ Git ignore
└── README.md                    ✅ Documentation
```

## 🚀 Next Steps

### 1. Deploy to Alfajores Testnet

```bash
# 1. Copy environment file
cd contracts
cp .env.example .env

# 2. Edit .env and add your private key
# Get test CELO from: https://faucet.celo.org

# 3. Deploy
npm run deploy:alfajores
```

### 2. Expected Output
```
🚀 Deploying ImpactQuest to Celo...
📝 Deploying with account: 0x...
💰 Account balance: 10.0 CELO

✅ ImpactQuest deployed to: 0xYourContractAddress
🔮 Oracle address set to: 0xYourAddress

🎯 Creating initial quests...
   ✓ Created quest: Beach Cleanup
   ✓ Created quest: Tree Planting
   ✓ Created quest: Community Garden

🎉 Deployment Complete!
```

### 3. Save Contract Address
Copy the contract address and save it - you'll need it for your frontend!

### 4. Verify on CeloScan
```bash
npx hardhat verify --network alfajores CONTRACT_ADDRESS ORACLE_ADDRESS
```

## 🎨 Optional: Make Tokens Soulbound

Currently, IMP tokens CAN be transferred (standard ERC20).

To make them **soulbound** (non-transferable), edit `ImpactQuest.sol` and uncomment:

```solidity
function transfer(address, uint256) public pure override returns (bool) {
  revert("IMP tokens are soulbound and non-transferable");
}

function transferFrom(address, address, uint256) public pure override returns (bool) {
  revert("IMP tokens are soulbound and non-transferable");
}
```

**Recommendation**: Start with transferable tokens for testing, make them soulbound later.

## 🔄 Upgrading to NFTs (Phase 2)

The current architecture is designed to easily add NFTs later:

### What You'll Add:
1. Inherit from ERC721 (alongside ERC20)
2. Mint NFT on first quest completion
3. Use `tokenURI` with IPFS to show evolving images
4. Keep current IMP tokens for rewards

### Why Wait:
- Get core loop working first ✓
- Test with tokens (simpler) ✓
- Add NFTs once mechanics are proven ✓

## 📊 Gas Costs (Estimated)

| Action | Gas | Cost on Celo |
|--------|-----|--------------|
| Join ImpactQuest | ~80k | ~$0.001 |
| Complete Quest | ~120k | ~$0.002 |
| Create Quest | ~90k | ~$0.001 |
| Get Profile | 0 | Free (read) |

*Celo has very low gas fees!*

## 🎯 What Makes This Production-Ready

1. ✅ **OpenZeppelin Contracts** - Industry standard, audited code
2. ✅ **Reentrancy Guards** - Protected against attacks
3. ✅ **Event Logging** - Full audit trail
4. ✅ **Access Control** - Owner/Oracle separation
5. ✅ **Timestamp Tracking** - All actions timestamped
6. ✅ **Proof Hashing** - Cryptographic verification
7. ✅ **Cooldown System** - Spam protection
8. ✅ **Level Thresholds** - Clear progression

## 🔮 Integration with Frontend

Your Next.js app will:

```javascript
import { ethers } from 'ethers';

// 1. Connect to contract
const contract = new ethers.Contract(address, abi, signer);

// 2. Join ImpactQuest
await contract.joinImpactQuest();

// 3. Get user profile
const profile = await contract.getUserProfile(userAddress);

// 4. Check level
const levelName = await contract.getUserLevelName(userAddress);
// Returns: "Seedling", "Sprout", "Sapling", or "Tree"

// 5. Check if can complete quest
const canDo = await contract.canCompleteQuest(userAddress, questId);
```

## 🎊 Success Metrics

Your smart contract enables:
- ✅ Verifiable impact tracking
- ✅ Transparent reward distribution
- ✅ Fraud-resistant proof system
- ✅ Progressive gamification
- ✅ Local business integration (token-gating)
- ✅ Scalable to thousands of users
- ✅ Low-cost transactions on Celo

## 🤝 Ready to Deploy!

Your smart contract is:
- ✅ Compiled successfully
- ✅ Fully documented
- ✅ Security hardened
- ✅ Ready for testnet

**Next**: Deploy to Alfajores and integrate with your frontend! 🚀

---

Built with ❤️ for ImpactQuest Hackathon 🌱
