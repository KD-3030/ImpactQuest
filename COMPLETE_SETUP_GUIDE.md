# 🚀 ImpactQuest - Complete Deployment & Setup Guide

This guide walks you through the complete setup process to get ImpactQuest running with full blockchain integration.

## 📋 Prerequisites

- Node.js 18+ and pnpm installed
- MetaMask wallet with Celo Alfajores testnet configured
- MongoDB Atlas account (or local MongoDB)
- Basic understanding of blockchain and smart contracts

## 🔧 Step 1: Environment Setup

### 1.1 Get Testnet CELO Tokens

1. Visit [Celo Faucet](https://faucet.celo.org)
2. Select "Alfajores Testnet"
3. Enter your wallet address
4. Request test CELO tokens (you'll need at least 1 CELO)

### 1.2 Export Your Private Key from MetaMask

**⚠️ IMPORTANT: Never share your mainnet private key. Use a testnet-only wallet!**

1. Open MetaMask
2. Click the three dots menu → Account Details
3. Click "Show Private Key"
4. Enter your password
5. Copy the 64-character hex string (without 0x prefix)

### 1.3 Create Environment Files

Create `.env.local` in the root directory:

```bash
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Blockchain - Contract Deployment
PRIVATE_KEY=your_64_character_private_key_from_metamask

# Oracle Wallet (can be same as PRIVATE_KEY for testing)
ORACLE_PRIVATE_KEY=0xyour_64_character_oracle_private_key

# Will be set after deployment
NEXT_PUBLIC_CONTRACT_ADDRESS=

# Next.js
NEXTAUTH_URL=http://localhost:3000
```

Create `contracts/.env.local`:

```bash
# Same private key for contract deployment
PRIVATE_KEY=your_64_character_private_key_from_metamask

# Oracle wallet (can be same as PRIVATE_KEY for testing)
ORACLE_PRIVATE_KEY=0xyour_64_character_oracle_private_key

# Will be set after deployment
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

## 📦 Step 2: Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install contract dependencies
cd contracts
npm install
cd ..
```

## 🔨 Step 3: Deploy Smart Contract

### 3.1 Check Your Balance

```bash
cd contracts
npx hardhat run scripts/check-balance.js --network alfajores
```

Expected output:
```
Account: 0xYourAddress...
Balance: 1.5 CELO
✅ You have enough CELO to deploy
```

### 3.2 Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiled 8 Solidity files successfully
```

### 3.3 Deploy to Alfajores

```bash
npx hardhat run scripts/deploy.js --network alfajores
```

Expected output:
```
Deploying contracts with account: 0xYourAddress...
Account balance: 1.5 CELO
Oracle address: 0xOracleAddress...

Deploying ImpactQuest...
✅ ImpactQuest deployed to: 0xContractAddress...

Seeding initial quests...
✅ Created 6 quests successfully!

🎉 Deployment complete!
📝 Contract Address: 0xContractAddress...
```

### 3.4 Save Contract Address

Copy the deployed contract address and update both `.env.local` files:

**Root `.env.local`:**
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

**contracts/.env.local:**
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

## 🗄️ Step 4: Setup MongoDB

### 4.1 Create Database and Collections

The collections will be created automatically when you first run the app, but you can verify:

1. Log into MongoDB Atlas
2. Select your cluster
3. Click "Browse Collections"
4. You should see database: `impactquest`
5. Collections: `users`, `quests`, `submissions`

### 4.2 Seed Quests with Blockchain IDs

You need to manually add quests to MongoDB with their corresponding `blockchainQuestId`:

**Important:** The `blockchainQuestId` must match the quest IDs created in the smart contract (1-6 from deploy.js).

You can use the MongoDB shell or create a seed script. Example document:

```json
{
  "title": "Beach Cleanup Challenge",
  "description": "Help clean up local beaches",
  "location": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749],
    "address": "San Francisco, CA"
  },
  "category": "cleanup",
  "impactPoints": 50,
  "verificationPrompt": "Show a photo of you at the beach with collected trash",
  "imageUrl": "/quest-images/beach-cleanup.jpg",
  "isActive": true,
  "blockchainQuestId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 Step 5: Start the Application

```bash
# From root directory
pnpm dev
```

The app will start at: `http://localhost:3000`

## ✅ Step 6: Test the Integration

### 6.1 Connect Wallet

1. Open `http://localhost:3000`
2. Click "Connect Wallet"
3. Select MetaMask
4. Approve the connection

### 6.2 Register on Blockchain

When you first connect, you'll need to register on the blockchain:

1. The dashboard will show "Not registered" for blockchain stats
2. You'll need to call `joinImpactQuest()` from your wallet
3. This can be done through the frontend or manually

**To register manually:**

```javascript
// Open browser console on the app
// Make sure you're connected with your wallet

const { writeContract } = await import('wagmi/actions');
const CONTRACT_ABI = await fetch('/api/contract-abi').then(r => r.json());

await writeContract({
  address: '0xYourContractAddress',
  abi: CONTRACT_ABI.abi,
  functionName: 'joinImpactQuest',
});
```

### 6.3 Complete a Quest

1. Go to "Browse Quests"
2. Select a quest with `blockchainQuestId` set
3. Take a photo or upload an image
4. Submit the quest
5. Wait for AI verification (currently mock, returns true)
6. Check the response - you should see `blockchain.transactionHash`
7. Check your dashboard - IMP tokens should appear!

### 6.4 Verify on Blockchain

Check transaction on Celo Explorer:
```
https://alfajores.celoscan.io/tx/YOUR_TRANSACTION_HASH
```

## 🔍 Step 7: Verify Everything Works

### 7.1 Check Dashboard

Your dashboard should show:

- **MongoDB Stats**: Level, Impact Points (off-chain tracking)
- **Blockchain Stats**: 
  - IMP Token Balance (e.g., "10.00")
  - On-Chain Level (e.g., "Seedling")
  - On-Chain Score (e.g., "10")
  - Verified Quests (e.g., "1")

### 7.2 Check Oracle Health

Visit: `http://localhost:3000/api/oracle/verify-and-mint`

Should return:
```json
{
  "status": "ready",
  "oracleAddress": "0xYourOracleAddress",
  "contractAddress": "0xYourContractAddress"
}
```

### 7.3 Check Contract State

```bash
cd contracts
npx hardhat run scripts/test-contract.js --network alfajores
```

## 🎯 Complete Flow Diagram

```
User Submits Quest
       ↓
Frontend (Next.js)
       ↓
/api/submit-proof
       ↓
AI Verification (Mock)
       ↓ (if verified)
/api/oracle/verify-and-mint
       ↓
Smart Contract: completeQuest()
       ↓
Tokens Minted 🎉
       ↓
User Dashboard Updates
```

## 🐛 Troubleshooting

### Issue: "Cannot read properties of undefined (reading 'address')"

**Solution:** Check that `PRIVATE_KEY` in `.env.local` is a valid 64-character private key, not a wallet address.

### Issue: "User not registered"

**Solution:** User must call `joinImpactQuest()` first. Add a registration check in your frontend.

### Issue: "Quest cooldown not expired"

**Solution:** Each quest has a cooldown period. Wait before attempting again.

### Issue: "Quest not found on blockchain"

**Solution:** Make sure the MongoDB quest has the correct `blockchainQuestId` that matches the deployed contract quest ID.

### Issue: "Insufficient funds"

**Solution:** Get more test CELO from the faucet: https://faucet.celo.org

### Issue: Oracle not configured

**Solution:** Check that `ORACLE_PRIVATE_KEY` and `NEXT_PUBLIC_CONTRACT_ADDRESS` are set in `.env.local`.

## 📝 Next Steps

### Production Deployment

1. **Real AI Verification**: Replace mock AI with OpenAI Vision API
2. **Image Storage**: Upload images to IPFS or cloud storage
3. **User Registration Flow**: Add automatic registration prompt on first wallet connect
4. **Error Handling**: Add user-friendly error messages
5. **Transaction Tracking**: Show pending/confirmed states
6. **Mainnet Deployment**: Deploy to Celo mainnet with real CELO

### Security Considerations

1. Never commit `.env.local` to git
2. Use different wallets for testnet and mainnet
3. Store private keys securely (use secrets manager in production)
4. Implement rate limiting on oracle endpoints
5. Add signature verification for oracle calls

## 📚 Additional Resources

- [Celo Documentation](https://docs.celo.org)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Viem Documentation](https://viem.sh)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎉 Congratulations!

You now have a fully functional Web3 impact tracking platform with:
- ✅ Smart contract deployed on Celo
- ✅ ERC20 token rewards
- ✅ AI verification (mock)
- ✅ Oracle backend
- ✅ Frontend integration
- ✅ Blockchain data display

Start building impact! 🌱→🌿→🌳→🌲
