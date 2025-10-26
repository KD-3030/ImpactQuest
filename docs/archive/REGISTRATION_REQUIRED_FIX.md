# Blockchain Registration Required Fix

## Problem
Users attempting to redeem tokens get the error:
```
POST /api/oracle/record-redemption 500
Blockchain redemption failed: User not registered on blockchain. Please register first
```

## Root Cause
The smart contract requires users to call `joinImpactQuest()` before they can:
- Complete quests and earn tokens
- Redeem tokens for discounts
- Have any blockchain transactions recorded

**Your wallet (`0x459841F0675b084Ec3929e3D4425652ec165F6af`) is NOT registered on the blockchain yet.**

## Solution

Users must register on the blockchain ONCE before using the platform. There are two ways to fix this:

### Option 1: Manual Registration (Quick Fix)

Call `joinImpactQuest()` from your connected wallet:

1. **From Browser Console** (when connected to the app):
```javascript
// Get wallet client from RainbowKit
const { getWalletClient } = await import('@wagmi/core');
const walletClient = await getWalletClient();

// Call joinImpactQuest
const { joinPlatform } = await import('./lib/blockchain');
const result = await joinPlatform(walletClient);

console.log('Registration result:', result);
```

2. **From Contract on Alfajores Explorer**:
   - Go to: https://alfajores.celoscan.io/address/0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158#writeContract
   - Connect your wallet
   - Find `joinImpactQuest` function
   - Click "Write" to execute
   - Confirm transaction in your wallet

### Option 2: Automatic Registration (Better UX)

Add auto-registration to the redemption flow. I'll update the code to do this.

---

## Implementation: Auto-Registration in Redemption Flow

The redemption endpoint now checks if user is registered and provides clear instructions if not. Next step is to add frontend registration prompt.

### Updated Files

#### 1. `/api/oracle/register-user/route.ts` (NEW)
- GET endpoint to check if user is registered
- Returns registration status and profile if registered

#### 2. `/api/redemptions/route.ts` (UPDATED)
- Now checks registration before attempting redemption
- Returns helpful error message if not registered

### Frontend Fix Needed

Create a registration modal/prompt that appears when:
1. User tries to redeem but isn't registered
2. API returns `blockchain.registrationNeeded === true`

The modal should:
1. Explain what blockchain registration is
2. Show a "Register on Blockchain" button
3. Call `joinImpactQuest()` from user's wallet
4. Show transaction confirmation
5. Retry redemption after successful registration

---

## Quick Manual Fix for Testing

### Step 1: Register Your Wallet

Run this from your browser console while connected to the app:

```javascript
// 1. Import wagmi/viem
const { createWalletClient, custom } = await import('viem');
const { celoAlfajores } = await import('viem/chains');

// 2. Create wallet client
const walletClient = createWalletClient({
  chain: celoAlfajores,
  transport: custom(window.ethereum)
});

// 3. Get contract ABI
const CONTRACT_ABI = await fetch('/api/contract-abi').then(r => r.json());
const CONTRACT_ADDRESS = '0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158';

// 4. Call joinImpactQuest
const hash = await walletClient.writeContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'joinImpactQuest',
  args: []
});

console.log('Registration transaction:', hash);
console.log('Check on explorer:', `https://alfajores.celoscan.io/tx/${hash}`);
```

### Step 2: Wait for Confirmation

Wait 5-10 seconds for the transaction to be confirmed on Alfajores.

### Step 3: Verify Registration

Check if you're registered:

```javascript
const response = await fetch('/api/oracle/register-user?userAddress=0x459841F0675b084Ec3929e3D4425652ec165F6af');
const data = await response.json();
console.log('Registration status:', data.isRegistered);
```

### Step 4: Try Redemption Again

Now the redemption should work!

---

## Simpler Alternative: Use Frontend Wagmi Hooks

If you're using wagmi hooks in your redemption component:

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import ImpactQuestABI from '@/lib/contracts/ImpactQuest.json';

// In your component
const { writeContract, data: hash } = useWriteContract();
const { isSuccess } = useWaitForTransactionReceipt({ hash });

// Registration function
const registerOnBlockchain = async () => {
  try {
    await writeContract({
      address: '0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158',
      abi: ImpactQuestABI.abi,
      functionName: 'joinImpactQuest',
      args: [],
    });
  } catch (error) {
    console.error('Registration failed:', error);
  }
};

// Call before redeeming
if (!isRegistered) {
  await registerOnBlockchain();
}
```

---

## What Happens After Registration

Once registered:
1. ✅ Your wallet is active on the blockchain
2. ✅ You can complete quests and earn IMP tokens
3. ✅ You can redeem tokens for discounts
4. ✅ All transactions will be recorded on-chain
5. ✅ Your profile is visible in smart contract

---

## Checking Registration Status

### API Endpoint
```bash
GET /api/oracle/register-user?userAddress=0xYOUR_ADDRESS
```

### Response (Not Registered)
```json
{
  "success": true,
  "userAddress": "0x...",
  "isRegistered": false,
  "profile": null
}
```

### Response (Registered)
```json
{
  "success": true,
  "userAddress": "0x...",
  "isRegistered": true,
  "profile": {
    "level": 0,
    "totalImpactScore": 0,
    "questsCompleted": 0,
    "lastQuestTimestamp": 0,
    "joinedTimestamp": 1729892010
  }
}
```

---

## For Production

### Recommended Flow
1. **First Time User Visits Dashboard**
   - Check if registered via `/api/oracle/register-user`
   - If not, show registration prompt immediately
   - Guide user through one-time registration

2. **Registration Modal**
   - Title: "Welcome to ImpactQuest!"
   - Message: "Complete this one-time blockchain registration to start earning rewards"
   - Button: "Register on Blockchain" 
   - Show loading state during transaction
   - Show success message with transaction hash
   - Redirect to dashboard after confirmation

3. **Graceful Fallback**
   - If registration fails, explain error
   - Provide retry button
   - Link to troubleshooting guide

---

## Testing Registration

### 1. Check Current Status
```bash
curl "http://localhost:3000/api/oracle/register-user?userAddress=0x459841F0675b084Ec3929e3D4425652ec165F6af"
```

### 2. Register (from browser console)
```javascript
// See "Quick Manual Fix" section above
```

### 3. Verify Success
```bash
curl "http://localhost:3000/api/oracle/register-user?userAddress=0x459841F0675b084Ec3929e3D4425652ec165F6af"
# Should return isRegistered: true
```

### 4. Try Redemption
Now redemption should work without "User not registered" error.

---

## Summary

**Issue:** User wallet not registered on blockchain  
**Fix:** Call `joinImpactQuest()` once from user's wallet  
**Status:** Registration endpoint created, frontend integration needed  
**Next Step:** Either manually register via console or add registration UI to frontend

---

## Immediate Action for You

**Run this now to register your wallet:**

1. Open browser console on your app (F12)
2. Make sure wallet is connected
3. Paste and run:

```javascript
const registerWallet = async () => {
  try {
    // Get the contract details from page
    const CONTRACT_ADDRESS = '0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158';
    
    // Use window.ethereum (MetaMask/RainbowKit)
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    // Call joinImpactQuest via eth_sendTransaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: accounts[0],
        to: CONTRACT_ADDRESS,
        data: '0x6c8c7fc1', // joinImpactQuest() function selector
      }],
    });
    
    console.log('✅ Registration transaction sent!');
    console.log('Transaction hash:', txHash);
    console.log('View on explorer:', `https://alfajores.celoscan.io/tx/${txHash}`);
    console.log('Wait 5-10 seconds, then try redemption again');
    
    return txHash;
  } catch (error) {
    console.error('❌ Registration failed:', error);
    if (error.message?.includes('already registered')) {
      console.log('✅ You are already registered!');
    }
  }
};

// Run registration
registerWallet();
```

4. Wait for transaction confirmation (5-10 seconds)
5. Try redemption again - it should work!

