# 🔧 Token Redemption Issue - CRITICAL FIX NEEDED

## Problem Summary

**Redemption transactions are failing with "execution reverted" error.**

### Root Cause
User has **14 tokens in MongoDB** but **ZERO tokens on blockchain**.

**Blockchain Check Result:**
```bash
curl -X POST https://alfajores-forno.celo-testnet.org \
  -d '{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158","data":"0x70a082310000000000000000000000006c5d37ae32afbbc9b91cb82e84295654224b84aa"},"latest"],"id":1}'

Response: {"result":"0x0000000000000000000000000000000000000000000000000000000000000000"}
# This means: 0 tokens on blockchain!
```

**MongoDB Check Result:**
- User `0x6c5d37ae32afbbc9b91cb82e84295654224b84aa` has 14 tokens

### Why This Happens

The `recordRedemption` smart contract function requires:
```solidity
require(balanceOf(user) >= tokensSpent, "Insufficient token balance");
```

Since user has 0 tokens on blockchain but trying to redeem 1 token, transaction reverts.

### The Core Issue

**Quest completions are ONLY updating MongoDB, NOT calling the blockchain `completeQuest` function!**

When users complete quests:
1. ✅ MongoDB gets updated (tokens added to database)
2. ❌ Blockchain does NOT get updated (no tokens minted)
3. ❌ Redemptions fail because blockchain balance is 0

## ✅ Solutions

### Option 1: Fix Quest Completion (RECOMMENDED)

Update the quest completion API to call the oracle's `completeQuest` function:

**File:** `app/api/submit-proof/route.ts` or quest completion endpoint

Add after MongoDB update:
```typescript
// Call oracle to record quest completion on blockchain
try {
  const oracleResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/oracle/complete-quest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userAddress: walletAddress,
      questId: questBlockchainId, // Map MongoDB ID to blockchain quest ID
      proofHash: `0x${crypto.randomBytes(32).toString('hex')}`, // Generate unique proof
    }),
  });
  
  const oracleData = await oracleResponse.json();
  if (oracleData.success) {
    console.log('✅ Quest completed on blockchain:', oracleData.transactionHash);
  }
} catch (error) {
  console.error('❌ Blockchain quest completion failed:', error);
}
```

### Option 2: Sync Existing Tokens (TEMPORARY)

For users who already have tokens in MongoDB:

**Created files:**
- `app/api/oracle/mint-tokens/route.ts` - Endpoint to transfer tokens from oracle to users
- `scripts/sync-tokens-to-blockchain.js` - Script to sync all MongoDB tokens to blockchain

**Run sync:**
```bash
# Make sure server is running
npm run dev

# In another terminal
node scripts/sync-tokens-to-blockchain.js
```

This will:
1. Read all users with tokens from MongoDB
2. Transfer tokens from oracle wallet to each user on blockchain
3. Now users can redeem!

### Option 3: Disable Blockchain Redemption (NOT RECOMMENDED)

Only use MongoDB for redemptions (no blockchain integration).

**File:** `app/api/redemptions/route.ts`

Comment out the oracle call section (lines ~160-180).

## 🎯 Recommended Action Plan

1. **Immediate:** Run token sync script to fix current users
   ```bash
   node scripts/sync-tokens-to-blockchain.js
   ```

2. **Long-term:** Fix quest completion to call blockchain
   - Find quest completion endpoint
   - Add oracle call after MongoDB update
   - Test with new quest completion

3. **Verify:** Check user balance on blockchain after quest completion
   ```bash
   curl -X POST https://alfajores-forno.celo-testnet.org \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"CONTRACT_ADDRESS","data":"0x70a08231000000000000000000000000USER_ADDRESS"},"latest"],"id":1}'
   ```

## 📊 Current State

**Affected Users:**
- `0x6c5d37ae32afbbc9b91cb82e84295654224b84aa` - 14 tokens (MongoDB), 0 tokens (blockchain)
- `0x459841f0675b084ec3929e3d4425652ec165f6af` - 8 tokens (MongoDB), 0 tokens (blockchain)  
- `0x1234567890123456789012345678901234567890` - 50 tokens (MongoDB), 0 tokens (blockchain)

**Oracle Wallet:**
- Address: `0x459841F0675b084Ec3929e3D4425652ec165F6af`
- Has enough CELO for gas fees
- Has tokens to transfer

##  🚨 Critical Files

1. **app/api/oracle/mint-tokens/route.ts** - NEW: Mints/transfers tokens
2. **app/api/oracle/record-redemption/route.ts** - Burns tokens on redemption
3. **app/api/redemptions/route.ts** - Calls oracle for redemption
4. **contracts/contracts/ImpactQuest.sol** - Smart contract (line 715: balance check)
5. **scripts/sync-tokens-to-blockchain.js** - NEW: Sync existing tokens

## 🔍 Debugging Commands

**Check user blockchain balance:**
```bash
# balanceOf(address)
curl -X POST https://alfajores-forno.celo-testnet.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_call","params":[{
    "to":"0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158",
    "data":"0x70a082310000000000000000000000006c5d37ae32afbbc9b91cb82e84295654224b84aa"
  },"latest"],"id":1}'
```

**Check if user is registered:**
```bash
# userProfiles(address)
curl -X POST https://alfajores-forno.celo-testnet.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_call","params":[{
    "to":"0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158",
    "data":"0x987ee1560000000000000000000000006c5d37ae32afbbc9b91cb82e84295654224b84aa"
  },"latest"],"id":1}'
```

**View transaction on explorer:**
```
https://alfajores.celoscan.io/address/0x6C5D37AE32afbBC9B91Cb82e84295654224b84aA
```

## ✅ Success Criteria

After fix:
1. User completes quest → Tokens appear in BOTH MongoDB AND blockchain
2. User tries redemption → Transaction succeeds
3. Check blockchain balance → Decreases by redeemed amount
4. MetaMask shows successful transaction (not "failed")

---

**Last Updated:** October 26, 2025
**Status:** 🔴 CRITICAL - Redemptions are blocked
**Priority:** P0 - Must fix before users can redeem tokens
