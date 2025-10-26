# 🚨 CRITICAL DISCOVERY: Contract Version Mismatch

## Issue

The deployed contract at `0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158` **does NOT have treasury functionality**.

### Evidence

1. Calling `setTreasury()` results in "execution reverted"
2. The contract source code has:
   ```solidity
   address public treasury;
   function setTreasury(address _treasury) external onlyOwner
   ```
3. But these were added AFTER deployment
4. The artifacts didn't have `setTreasury` until we recompiled

### Impact

- ❌ **Cannot set treasury address**
- ❌ **Redemptions will fail** if deployed contract requires treasury
- ❌ **Source code doesn't match deployed bytecode**

## Solution Options

### Option 1: Redeploy Contract (RECOMMENDED)

**Pros:**
- Get all latest features (treasury, any other updates)
- Clean slate with matching source code
- Can set treasury during/after deployment

**Cons:**
- Need to re-register all users
- Need to recreate quests
- Change contract address in frontend

**Steps:**
1. Deploy new contract with current source
2. Set treasury address immediately
3. Update `.env.local` with new contract address
4. Users re-register
5. Recreate quests

### Option 2: Check if Deployed Contract Works Without Treasury

**Test if the deployed contract's `recordRedemption` works differently:**

Maybe the deployed version doesn't have the treasury requirement at all. We should test this after users have tokens.

### Option 3: Modify Source to Match Deployed Contract

Remove treasury functionality from source code and work with what's deployed.

## Recommendation

**REDEPLOY THE CONTRACT** - This gives us:
- ✅ Treasury functionality working
- ✅ Source code matches deployed code  
- ✅ Clean start with all features
- ✅ Ability to verify contract on explorer

The time cost of redeployment is LOW compared to debugging mismatched contracts.

## Next Steps

1. **DECISION NEEDED**: Redeploy or work around?
2. If redeploy: Run `npx hardhat run scripts/deploy.js --network alfajores`
3. Update all references to new contract address
4. Test complete flow

---

**Status**: 🔴 **BLOCKER - Decision required before proceeding**
