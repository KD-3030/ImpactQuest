# ImpactQuest Smart Contract

🌱 A gamified impact tracking system on the Celo blockchain that rewards users for completing real-world environmental and community service quests.

## 🎯 Features

### Core Functionality
- **ERC20 Token (IMP)**: Reward tokens for quest completion
- **Soulbound Reputation**: User levels that cannot be transferred
- **AI-Verified Quests**: Blockchain records of AI-verified impact
- **Progressive Evolution**: Seedling → Sprout → Sapling → Tree
- **Anti-Fraud**: Proof hash system prevents replay attacks
- **Cooldown System**: Prevents quest spam

### User Levels & Thresholds
- **Seedling**: 10+ impact score
- **Sprout**: 50+ impact score  
- **Sapling**: 150+ impact score
- **Tree**: 500+ impact score

## 📁 Contract Structure

```
ImpactQuest.sol
├── User Management
│   ├── joinImpactQuest() - Register new user
│   ├── getUserProfile() - View user stats
│   └── getUserLevelName() - Get level as string
├── Quest System
│   ├── completeQuest() - Record verified quest (Oracle only)
│   ├── canCompleteQuest() - Check cooldown status
│   └── getCompletion() - View completion history
├── Quest Management (Owner)
│   ├── createQuest() - Add new quest
│   ├── setQuestActive() - Enable/disable quest
│   └── getQuest() - View quest details
└── Token (ERC20)
    ├── Mint on quest completion
    └── Optional: Soulbound (non-transferable)
```

## 🚀 Deployment

### Prerequisites
```bash
cd contracts
npm install
```

### Setup Environment
```bash
cp .env.example .env
# Edit .env with your private key
```

### Deploy to Alfajores Testnet
```bash
npm run deploy:alfajores
```

### Deploy to Celo Mainnet
```bash
npm run deploy:celo
```

## 🔧 Usage Examples

### 1. User Joins ImpactQuest
```javascript
const tx = await impactQuest.joinImpactQuest();
await tx.wait();
console.log("User registered!");
```

### 2. Complete a Quest (Oracle)
```javascript
// This is called by your backend after AI verification
const proofHash = ethers.keccak256(
  ethers.toUtf8Bytes(imageHash + aiResponse)
);

const tx = await impactQuest.completeQuest(
  userAddress,
  questId,
  proofHash
);
await tx.wait();
```

### 3. Check User Profile
```javascript
const profile = await impactQuest.getUserProfile(userAddress);
console.log({
  level: profile.level, // 0=None, 1=Seedling, 2=Sprout, 3=Sapling, 4=Tree
  totalImpactScore: profile.totalImpactScore,
  questsCompleted: profile.questsCompleted,
  lastQuestTimestamp: profile.lastQuestTimestamp
});
```

### 4. Get User Level Name
```javascript
const levelName = await impactQuest.getUserLevelName(userAddress);
console.log(`User is a ${levelName}!`); // "Seedling", "Sprout", etc.
```

### 5. Check Quest Cooldown
```javascript
const canComplete = await impactQuest.canCompleteQuest(userAddress, questId);
if (canComplete) {
  console.log("User can complete this quest!");
}
```

## 🎮 Quest Flow

```
1. User completes real-world quest
   ↓
2. User takes photo with native camera
   ↓
3. Photo sent to AI Oracle (your backend)
   ↓
4. AI verifies: "Is this a beach cleanup photo?"
   ↓
5. Backend calls contract.completeQuest()
   ↓
6. Smart Contract:
   - Checks cooldown ✓
   - Validates proof hash ✓
   - Mints IMP tokens ✓
   - Updates impact score ✓
   - Checks for level up ✓
   ↓
7. User sees: +10 IMP tokens, Level Up! 🌱→🌿
```

## 🔐 Security Features

### 1. Proof Hash System
```solidity
// Prevents users from reusing the same proof
mapping(bytes32 => bool) public usedProofHashes;
```

### 2. Cooldown Protection
```solidity
// Prevents quest spam
require(
  block.timestamp >= lastCompletion + cooldownPeriod,
  "Quest cooldown not expired"
);
```

### 3. Oracle Authorization
```solidity
// Only authorized backend can record completions
modifier onlyOracle() {
  require(msg.sender == oracleAddress, "Only oracle can call this");
  _;
}
```

### 4. Reentrancy Guard
```solidity
// Protects against reentrancy attacks
function completeQuest(...) external onlyOracle nonReentrant {
  // ...
}
```

## 📊 Gas Estimates

| Function | Gas Cost (approx) |
|----------|-------------------|
| joinImpactQuest | ~80,000 |
| completeQuest | ~120,000 |
| createQuest | ~90,000 |
| getUserProfile | ~free (view) |

## 🧪 Testing

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Test coverage
npx hardhat coverage
```

## 📝 Contract Verification

After deployment, verify your contract on CeloScan:

```bash
npx hardhat verify --network alfajores CONTRACT_ADDRESS ORACLE_ADDRESS
```

## 🌐 Frontend Integration

### Install ethers.js
```bash
npm install ethers
```

### Connect to Contract
```javascript
import { ethers } from 'ethers';
import ImpactQuestABI from './ImpactQuest.json';

const CONTRACT_ADDRESS = "0x..."; // Your deployed contract

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ImpactQuestABI.abi,
  signer
);

// Use the contract
const profile = await contract.getUserProfile(await signer.getAddress());
```

## 🎨 Optional: Make Tokens Soulbound

To make IMP tokens non-transferable (soulbound), uncomment these functions in the contract:

```solidity
function transfer(address, uint256) public pure override returns (bool) {
  revert("IMP tokens are soulbound and non-transferable");
}

function transferFrom(address, address, uint256) public pure override returns (bool) {
  revert("IMP tokens are soulbound and non-transferable");
}
```

## 🔄 Upgrading to NFTs Later

The current design uses tokens + levels. To add NFTs later:

1. Add ERC721 inheritance
2. Mint NFT on first quest completion  
3. Use `tokenURI` to point to evolving metadata
4. Keep current token system for rewards

The architecture is designed to support this upgrade path!

## 📞 Contract Events

```solidity
event UserJoined(address indexed user, uint256 timestamp);
event QuestCompleted(address indexed user, uint256 indexed questId, ...);
event LevelUp(address indexed user, UserLevel oldLevel, UserLevel newLevel, ...);
event QuestCreated(uint256 indexed questId, string name, ...);
```

Listen to these events in your frontend for real-time updates!

## 🎯 Production Checklist

- [ ] Deploy to Alfajores testnet first
- [ ] Test all functions thoroughly
- [ ] Set up proper Oracle address (your backend)
- [ ] Verify contract on CeloScan
- [ ] Set up event listeners
- [ ] Test cooldown periods
- [ ] Test level progression
- [ ] Audit proof hash generation
- [ ] Deploy to Celo mainnet
- [ ] Update frontend environment variables

## 🤝 Support

For issues or questions:
1. Check the Celo documentation: https://docs.celo.org
2. Join Celo Discord: https://chat.celo.org
3. Review Hardhat docs: https://hardhat.org

## 📄 License

MIT License - Built for ImpactQuest Hackathon 🌱
