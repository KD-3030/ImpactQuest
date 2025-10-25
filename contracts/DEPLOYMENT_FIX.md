# 🔧 Fix Deployment Error

## ❌ Error You're Seeing:
```
TypeError: Cannot read properties of undefined (reading 'address')
```

## 🎯 The Problem:
Your `contracts/.env.local` file has the wrong value for `PRIVATE_KEY`:

```bash
# ❌ WRONG - This is a wallet ADDRESS, not a private key
PRIVATE_KEY=0x459841f0675b084ec3929e3d4425652ec165f6af
```

A **private key** should be 64 hexadecimal characters, not an address!

---

## ✅ How to Fix It:

### Step 1: Get Your Private Key from MetaMask

1. **Open MetaMask** browser extension
2. **Click the three dots** (•••) next to your account name
3. **Select "Account Details"**
4. **Click "Export Private Key"**
5. **Enter your MetaMask password**
6. **Copy the private key** (64 characters of letters and numbers)

⚠️ **IMPORTANT**: Never share this with anyone or commit it to GitHub!

### Step 2: Update Your .env.local File

Open `contracts/.env.local` and replace the `PRIVATE_KEY` line:

```bash
# Replace this line:
PRIVATE_KEY=0x459841f0675b084ec3929e3d4425652ec165f6af

# With your actual private key (example format):
PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**Note**: Some wallets give you the private key with `0x` prefix, some without. Either works!

### Step 3: Make Sure You Have Testnet Tokens

Before deploying, you need **Celo testnet tokens**:

1. **Visit Celo Faucet**: https://faucet.celo.org
2. **Paste your wallet address**: `0x459841f0675b084ec3929e3d4425652ec165f6af`
3. **Select "Alfajores Testnet"**
4. **Click "Get Tokens"**
5. **Wait** 10-30 seconds for tokens to arrive

### Step 4: Verify Your Wallet Has Tokens

```bash
# In contracts folder
npx hardhat run scripts/check-balance.js --network alfajores
```

If you don't have that script, create `contracts/scripts/check-balance.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Checking balance for:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "CELO");
  
  if (balance === 0n) {
    console.log("\n❌ You need testnet tokens!");
    console.log("Get them from: https://faucet.celo.org");
  } else {
    console.log("\n✅ You have enough tokens to deploy!");
  }
}

main().catch(console.error);
```

### Step 5: Try Deploying Again

```bash
npx hardhat run scripts/deploy.js --network alfajores
```

---

## 🔐 Security Reminders

### DO:
✅ Keep private keys in `.env.local` (already in .gitignore)  
✅ Use different wallets for testnet and mainnet  
✅ Store private keys in password managers  
✅ Use hardware wallets for mainnet deployments  

### DON'T:
❌ **NEVER** commit private keys to GitHub  
❌ **NEVER** share private keys in Discord/Slack  
❌ **NEVER** take screenshots of private keys  
❌ **NEVER** store private keys in cloud notes  

---

## 📝 Full Example .env.local

Here's what your `contracts/.env.local` should look like:

```bash
# Google Gemini API Key
GEMINI_API_KEY=AIzaSyA3HuWABFkuj5_xSndbGwSUbDaQakQaqZI

# Pinata IPFS Configuration
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PINATA_GATEWAY=harlequin-efficient-rat-449.mypinata.cloud

# Oracle Wallet (for completing quests)
ORACLE_PRIVATE_KEY=0d2b81c99f5f007b2fb7865218c42d2de42f177dc907ac5ef1bc996e15d1167e

# Smart Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=

# Celo RPC URL
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org

# YOUR PRIVATE KEY HERE (64 hex characters)
PRIVATE_KEY=your_actual_64_character_private_key_here_without_0x
```

---

## 🆘 Still Having Issues?

### Error: "insufficient funds"
- Get testnet tokens from https://faucet.celo.org

### Error: "invalid sender"  
- Your private key format is wrong (should be 64 hex characters)

### Error: "network not found"
- Make sure you're running the command from the `contracts/` folder

---

## ✅ Success Looks Like:

When deployment works, you'll see:

```
🚀 Deploying ImpactQuest to Celo...

📝 Deploying with account: 0x459841...
💰 Account balance: 10.0 CELO

🔨 Deploying ImpactQuest contract...
✅ ImpactQuest deployed to: 0xABC123...
🔮 Oracle address set to: 0x459841...

🎯 Creating initial quests...
   ✓ Created quest: Beach Cleanup (Environmental)
   ✓ Created quest: Tree Planting (Environmental)
   ...

🎉 Deployment Complete!
```

Then save that contract address! 🎊
