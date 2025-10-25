# 🔥 ImpactQuest - Quick Reference

## One-Command Deploy

```bash
# 1. Setup environment
cp .env.example .env.local
# Edit .env.local with your keys

# 2. Install and deploy
pnpm install && cd contracts && npm install && npx hardhat run scripts/deploy.js --network alfajores

# 3. Copy contract address to .env.local
# NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# 4. Start app
cd .. && pnpm dev
```

## Environment Variables Checklist

```bash
# .env.local (root)
✅ MONGODB_URI
✅ PRIVATE_KEY (64 chars, no 0x)
✅ ORACLE_PRIVATE_KEY (with 0x)
✅ NEXT_PUBLIC_CONTRACT_ADDRESS (after deploy)
✅ NEXTAUTH_URL

# contracts/.env.local
✅ PRIVATE_KEY (64 chars, no 0x)
✅ ORACLE_PRIVATE_KEY (with 0x)
✅ NEXT_PUBLIC_CONTRACT_ADDRESS (after deploy)
```

## Quest Flow

```
1. User submits → /api/submit-proof
2. AI verifies → Mock returns true
3. Call oracle → /api/oracle/verify-and-mint
4. Oracle calls → contract.completeQuest()
5. Tokens minted → User receives IMP
6. Dashboard updates → Shows blockchain balance
```

## Key Functions

### Frontend (`lib/blockchain.ts`)
```typescript
getUserProfile(address)         // Get on-chain user data
getTokenBalance(address)        // Get IMP token balance
joinPlatform(walletClient)      // Register user on-chain
isUserRegistered(address)       // Check if registered
```

### Smart Contract (`ImpactQuest.sol`)
```solidity
joinImpactQuest()                          // Register new user
completeQuest(user, questId, proofHash)    // Oracle mints tokens
getUserProfile(address)                     // Get user stats
quests(questId)                            // Get quest details
```

### API Endpoints
```
GET  /api/blockchain/register?address=0x...  // Check registration
POST /api/oracle/verify-and-mint             // Oracle service
POST /api/submit-proof                       // Submit quest
GET  /api/oracle/verify-and-mint             // Health check
```

## MongoDB Schema

### Quest Schema
```javascript
{
  title: String,
  description: String,
  category: String,
  impactPoints: Number,
  blockchainQuestId: Number,  // ⚡ Maps to contract quest ID
  isActive: Boolean,
  location: {
    type: "Point",
    coordinates: [lng, lat]
  }
}
```

## Smart Contract Quest IDs

After deployment, these quests are created (IDs 1-6):

1. Beach Cleanup (Environmental, 50 pts, 1 day cooldown)
2. Tree Planting (Environmental, 75 pts, 7 days cooldown)
3. Community Service (Community, 40 pts, 1 day cooldown)
4. Educational Workshop (Education, 60 pts, 3 days cooldown)
5. Recycling Drive (Waste Reduction, 30 pts, 12 hours cooldown)
6. Energy Saving (Sustainability, 45 pts, 1 day cooldown)

## Level Thresholds

```
Level 0: None (0 pts)
Level 1: Seedling (10+ pts)
Level 2: Sprout (50+ pts)
Level 3: Sapling (150+ pts)
Level 4: Tree (500+ pts)
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "User not registered" | Call `joinImpactQuest()` first |
| "Quest cooldown not expired" | Wait for cooldown period |
| "Proof already used" | Each submission needs unique proof |
| "Insufficient funds" | Get test CELO from faucet |
| Oracle returns 500 | Check ORACLE_PRIVATE_KEY and CONTRACT_ADDRESS |
| No blockchain stats | Contract not deployed or address wrong |

## Testing Checklist

- [ ] Deploy contract successfully
- [ ] Contract address in .env.local
- [ ] Oracle health check returns "ready"
- [ ] Connect wallet shows address
- [ ] Register on blockchain (joinImpactQuest)
- [ ] Submit quest with blockchainQuestId
- [ ] Receive transaction hash
- [ ] Dashboard shows IMP tokens
- [ ] On-chain level updates

## Useful Commands

```bash
# Check balance
cd contracts && npx hardhat run scripts/check-balance.js --network alfajores

# Compile contracts
npx hardhat compile

# Deploy contract
npx hardhat run scripts/deploy.js --network alfajores

# Test contract
npx hardhat run scripts/test-contract.js --network alfajores

# Clean and recompile
npx hardhat clean && npx hardhat compile

# Start frontend
pnpm dev

# Check logs
# Check browser console for blockchain calls
# Check terminal for API logs
```

## Contract Addresses

```bash
# Celo Alfajores Testnet
RPC: https://alfajores-forno.celo-testnet.org
Chain ID: 44787
Explorer: https://alfajores.celoscan.io

# Your Deployed Contract
Address: [Set in .env.local]
View on Explorer: https://alfajores.celoscan.io/address/YOUR_ADDRESS
```

## Development Workflow

```bash
# 1. Make changes to frontend
# Changes auto-reload with pnpm dev

# 2. Make changes to smart contract
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network alfajores
# Update CONTRACT_ADDRESS in .env.local
cd ..
pnpm dev  # Restart

# 3. Update blockchain integration
# Edit lib/blockchain.ts
# Changes auto-reload

# 4. Test end-to-end
# Submit quest → Check transaction → Verify dashboard
```

## Production Checklist

- [ ] Real AI verification implemented
- [ ] Image upload to IPFS/cloud
- [ ] Rate limiting on APIs
- [ ] Error handling and user feedback
- [ ] Transaction status tracking
- [ ] User registration flow
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] Domain and hosting
- [ ] Monitoring and analytics

## Key Files

```
lib/blockchain.ts                   # Blockchain integration
app/api/submit-proof/route.ts       # Quest submission
app/api/oracle/verify-and-mint/     # Oracle service
app/dashboard/page.tsx              # Dashboard with blockchain stats
models/index.ts                     # MongoDB schemas
contracts/contracts/ImpactQuest.sol # Smart contract
contracts/scripts/deploy.js         # Deployment script
```

## Support

- Check `COMPLETE_SETUP_GUIDE.md` for detailed instructions
- Review `DEPLOYMENT_FIX.md` for common deployment issues
- Smart contract docs in `contracts/README.md`

---

**Need Help?**
1. Check logs (browser console + terminal)
2. Verify environment variables
3. Test oracle health endpoint
4. Check transaction on Celoscan
