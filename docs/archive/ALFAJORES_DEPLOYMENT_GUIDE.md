# 🚀 Deploying to Celo Alfajores - Step by Step Guide

## Prerequisites Checklist

Before deploying, ensure you have:

- ✅ Wallet with private key set in `contracts/.env.local`
- ✅ CELO test tokens from Alfajores faucet
- ✅ Enhanced smart contract with transaction tracking
- ✅ Correct network configuration (Alfajores)

---

## Step 1: Get Alfajores Test Tokens (REQUIRED) 💰

### Option 1: Official Celo Faucet (RECOMMENDED)
1. Visit: **https://faucet.celo.org/alfajores**
2. Paste your wallet address: `[Your wallet address from .env.local]`
3. Complete CAPTCHA
4. Click "Get Celo"
5. Wait 10-30 seconds for tokens to arrive

### Option 2: Celo Discord Faucet
1. Join Celo Discord: https://discord.gg/celo
2. Go to #faucet channel
3. Type: `/faucet [your-wallet-address]`

### How much do you need?
- **Minimum**: 0.1 CELO (for deployment gas)
- **Recommended**: 0.5 CELO (for deployment + creating quests)

### Check Your Balance:
```bash
# Visit Celoscan
https://alfajores.celoscan.io/address/[YOUR_WALLET_ADDRESS]
```

---

## Step 2: Verify Private Key Configuration 🔑

### Check your `contracts/.env.local` file:

```bash
cd contracts
cat .env.local | grep PRIVATE_KEY
```

**Should show:**
```
PRIVATE_KEY=2f2ed52d4cc889354171b7ec9d28b099ac2cf6c1eb455e78ffd8584800a7f438
```

### ⚠️ Security Check:
- Private key should be 64 hexadecimal characters
- NO `0x` prefix needed
- This key corresponds to a wallet address
- NEVER share or commit this key!

### Get Your Wallet Address:
The private key above corresponds to a specific wallet address. You can check it in MetaMask or using:
```bash
cd contracts
node -e "const ethers = require('ethers'); const pk = process.env.PRIVATE_KEY || '2f2ed52d4cc889354171b7ec9d28b099ac2cf6c1eb455e78ffd8584800a7f438'; const wallet = new ethers.Wallet(pk); console.log('Wallet Address:', wallet.address);"
```

---

## Step 3: Deploy Contract to Alfajores 🎯

### Run Deployment Script:
```bash
cd /Users/anilavo/Desktop/impactQuest/contracts
npx hardhat run scripts/deploy.js --network alfajores
```

### Expected Output:
```
🚀 Deploying ImpactQuest to Celo...

📝 Deploying with account: 0xYourWalletAddress
💰 Account balance: 1.5 CELO

🔨 Deploying ImpactQuest contract...
✅ ImpactQuest deployed to: 0xNewContractAddress
🔮 Oracle address set to: 0xYourWalletAddress

📋 Contract Details:
   - Token Name: ImpactQuest Token
   - Token Symbol: IMP
   - Network: alfajores
   - Chain ID: 44787

🎯 Creating initial quests...
✅ Quest 1 created: Beach Cleanup
✅ Quest 2 created: Tree Planting
✅ Quest 3 created: Community Garden
✅ Quest 4 created: Teach Recycling
✅ Quest 5 created: Organize Recycling Drive
✅ Quest 6 created: Home Energy Audit

🎉 Deployment Complete!
```

### ⚠️ IMPORTANT: Save the Contract Address!
Copy the address after "ImpactQuest deployed to:" - you'll need it next!

---

## Step 4: Update Environment Variables 📝

### Update Root `.env.local`:
```bash
cd /Users/anilavo/Desktop/impactQuest
```

Open `.env.local` and update:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourNewAlfajoresAddress
```

### Update Contracts `.env.local`:
```bash
cd /Users/anilavo/Desktop/impactQuest/contracts
```

Open `.env.local` and update:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourNewAlfajoresAddress
```

---

## Step 5: Verify on Celoscan 🔍

### Visit Block Explorer:
```
https://alfajores.celoscan.io/address/0xYourNewContractAddress
```

### What to Check:
- ✅ Contract is deployed
- ✅ Balance shows 0 CELO (normal)
- ✅ Contract creation transaction succeeded
- ✅ Can see contract code

---

## Step 6: Restart Development Server 🔄

```bash
cd /Users/anilavo/Desktop/impactQuest
npm run dev
```

---

## Step 7: Test the Connection 🧪

### Test Checklist:
1. Open browser: http://localhost:3000
2. Connect your wallet
3. **Verify network shows "Celo Alfajores"**
4. Check console for no RPC errors
5. Try reading contract data

### Test Contract Interaction:
```bash
# In browser console (F12)
```

---

## Troubleshooting Common Issues 🔧

### Issue 1: "insufficient funds for gas"
**Solution:** Get more CELO from faucet (Step 1)

### Issue 2: "Invalid private key"
**Solution:** 
- Remove `0x` prefix if present
- Ensure 64 hex characters
- Check for extra spaces or newlines

### Issue 3: "Network request failed"
**Solution:** Check your internet connection and try again

### Issue 4: Deployment hangs
**Solution:**
- Wait 30 seconds
- If still hanging, press Ctrl+C
- Try deploying again

### Issue 5: "nonce too low"
**Solution:**
```bash
# Reset nonce
rm -rf contracts/cache
rm -rf contracts/artifacts
npx hardhat clean
# Then try deploying again
```

---

## Enhanced Smart Contract Features 🎨

Your newly deployed contract includes:

### 1. **Reward Transaction Tracking**
- ✅ Quest completion transactions
- ✅ Stage upgrade bonuses (10 tokens)
- ✅ Creator rewards for quest makers
- ✅ Redemption tracking (spending)
- ✅ Redemption refunds

### 2. **Transaction Types**
```solidity
enum RewardTransactionType {
    QuestCompletion,    // Earned from quests
    StageUpgrade,       // Level up bonuses
    CreatorReward,      // Quest creator earnings
    Redemption,         // Spending at shops
    RedemptionRefund    // Refunded tokens
}
```

### 3. **New Contract Functions**
- `getTotalTransactions()` - Total transaction count
- `getTransaction(id)` - Get transaction details
- `getUserTransactionIds(address)` - User's transaction IDs
- `getUserRecentTransactions(address, count)` - Last N transactions
- `recordRedemption(user, amount, shop)` - Track spending
- `recordRedemptionRefund(user, amount, reason)` - Track refunds

### 4. **Automatic Stage Bonuses**
When users level up, they automatically receive:
- 🌱 Seedling → 10 IMP tokens
- 🌿 Sprout → 10 IMP tokens
- 🌳 Sapling → 10 IMP tokens
- 🌲 Tree → 10 IMP tokens

---

## Post-Deployment Next Steps 📋

### 1. Update Frontend Contract ABI
```bash
cd /Users/anilavo/Desktop/impactQuest
cp contracts/artifacts/contracts/ImpactQuest.sol/ImpactQuest.json lib/contracts/
```

### 2. Test Quest Creation
- Login as admin
- Create a test quest
- Verify it appears on blockchain

### 3. Test Quest Completion
- Submit a quest as user
- Verify transaction recorded
- Check token balance increased

### 4. Test Stage Upgrades
- Complete multiple quests
- Watch for level up
- Verify bonus tokens received

### 5. Update Backend Oracle
Update your backend to use new contract address when calling:
- `completeQuest()`
- `recordRedemption()`
- `recordRedemptionRefund()`

---

## Network Details Summary 📊

### Celo Alfajores Testnet
- **Network Name**: Celo Alfajores
- **Chain ID**: 44787
- **RPC URL**: https://alfajores-forno.celo-testnet.org
- **Block Explorer**: https://alfajores.celoscan.io
- **Currency Symbol**: CELO
- **Faucet**: https://faucet.celo.org/alfajores

---

## Quick Command Reference 📝

```bash
# Deploy to Alfajores
cd contracts && npx hardhat run scripts/deploy.js --network alfajores

# Verify contract (optional)
npx hardhat verify --network alfajores [CONTRACT_ADDRESS] [ORACLE_ADDRESS]

# Check balance
npx hardhat run scripts/checkBalance.js --network alfajores

# Test contract
npx hardhat run scripts/test-contract.js --network alfajores

# Clean and rebuild
npx hardhat clean && npx hardhat compile

# Restart dev server
cd .. && npm run dev
```

---

## Ready to Deploy? ✅

Run this command when you have test tokens:

```bash
cd /Users/anilavo/Desktop/impactQuest/contracts
npx hardhat run scripts/deploy.js --network alfajores
```

After deployment, save the contract address and update both `.env.local` files!

🚀 Let's get started!
