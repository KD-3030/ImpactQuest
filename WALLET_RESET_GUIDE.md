# Complete Wallet Reset Guide

## Current Problem
Your browser is still using the oracle wallet address (0x459841F0675b084Ec3929e3D4425652ec165F6af) instead of YOUR actual MetaMask wallet.

## Solution: Complete Reset

### Step 1: Clear Browser Data
1. Open your browser where the app is running
2. Press `F12` to open Developer Tools
3. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
4. Clear ALL:
   - **Local Storage** - Right click → Clear
   - **Session Storage** - Right click → Clear
   - **Cookies** - Delete all for localhost:3000
5. Close Developer Tools

### Step 2: Hard Refresh
- Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or `Ctrl+F5` (Windows/Linux)

### Step 3: Disconnect Any Connected Wallet
1. Look for wallet connection in the top right of your app
2. If it shows the oracle address (0x459841F0675b084Ec3929e3D4425652ec165F6af), click disconnect
3. Close the page completely

### Step 4: Install MetaMask (if not installed)
1. Go to https://metamask.io/download/
2. Install the browser extension
3. Create a new wallet OR import existing
4. **Write down your seed phrase somewhere safe!**

### Step 5: Add Celo Sepolia Network to MetaMask
Once MetaMask is installed, run this in browser console (F12):

```javascript
async function setupCeloSepolia() {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0xaa044c', // 11142220 in decimal
        chainName: 'Celo Sepolia Testnet',
        nativeCurrency: {
          name: 'CELO',
          symbol: 'CELO',
          decimals: 18
        },
        rpcUrls: ['https://forno.celo-sepolia.celo-testnet.org'],
        blockExplorerUrls: ['https://celo-sepolia.blockscout.com']
      }]
    });
    console.log('✅ Celo Sepolia added successfully!');
    
    // Show your wallet address
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    console.log('📱 Your Wallet Address:', accounts[0]);
    console.log('');
    console.log('⚠️ Make sure this is NOT:', '0x459841F0675b084Ec3929e3D4425652ec165F6af');
    console.log('');
    console.log('Next: Get test CELO from https://faucet.celo.org/celo-sepolia');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

setupCeloSepolia();
```

### Step 6: Get Test CELO
1. Go to https://faucet.celo.org/celo-sepolia
2. Enter YOUR wallet address (the one from console, NOT the oracle address)
3. Click "Get CELO"
4. Wait for tokens (may take 1-2 minutes)

OR use Google's faucet:
- https://cloud.google.com/application/web3/faucet/celo/sepolia

### Step 7: Connect to App
1. Go to http://localhost:3000
2. Click "Connect Wallet" button
3. Select MetaMask
4. **Verify the address shown is YOUR address, not 0x459841F0675b084Ec3929e3D4425652ec165F6af**
5. Approve the connection

### Step 8: Verify Connection
Run this in browser console (F12) after connecting:

```javascript
async function verifyConnection() {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [accounts[0], 'latest']
    });
    
    console.log('=== WALLET CONNECTION STATUS ===');
    console.log('✅ Connected Address:', accounts[0]);
    console.log('✅ Network:', chainId === '0xaa044c' ? 'Celo Sepolia ✓' : 'Wrong Network ✗');
    console.log('✅ CELO Balance:', (parseInt(balance, 16) / 1e18).toFixed(4), 'CELO');
    console.log('');
    
    if (accounts[0].toLowerCase() === '0x459841F0675b084Ec3929e3D4425652ec165F6af'.toLowerCase()) {
      console.error('❌❌❌ PROBLEM: You are still connected with ORACLE wallet!');
      console.error('❌ Disconnect and connect with YOUR MetaMask wallet');
    } else {
      console.log('✅ Perfect! You are connected with YOUR wallet');
      console.log('Next step: The app will register you automatically');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyConnection();
```

---

## Why This Is Happening

You don't actually have a wallet connected, or:
1. Your browser has old session data cached
2. The app is using a fallback address (the oracle wallet)
3. You haven't actually clicked "Connect Wallet" in the app

The oracle wallet (0x459841F0675b084Ec3929e3D4425652ec165F6af) should ONLY be used by the backend server, never by frontend users.

---

## Expected Result After Reset

When you connect YOUR wallet:
1. Console shows YOUR address (not oracle address)
2. Network shows "Celo Sepolia" (Chain ID: 11142220)
3. You have some test CELO for gas
4. App automatically registers you on first action
5. You can complete quests and earn tokens

---

## Troubleshooting

### "No wallet detected"
- Install MetaMask: https://metamask.io/download/

### "Wrong network"
- Run the setupCeloSepolia() script above
- Or manually add Celo Sepolia in MetaMask settings

### "Still showing oracle address"
- Clear ALL browser data (Application tab in DevTools)
- Close and reopen browser completely
- Make sure MetaMask is actually connected (check extension icon)

### "Connection rejected"
- Click the MetaMask extension icon
- Approve the connection request
- Make sure you're on Celo Sepolia network

---

## Quick Commands Reference

**Check what address app is using:**
```javascript
// Run in browser console
const accounts = await window.ethereum.request({ method: 'eth_accounts' });
console.log('Current address:', accounts[0]);
```

**Switch to Celo Sepolia:**
```javascript
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0xaa044c' }]
});
```

**Get your balance:**
```javascript
const accounts = await window.ethereum.request({ method: 'eth_accounts' });
const balance = await window.ethereum.request({
  method: 'eth_getBalance',
  params: [accounts[0], 'latest']
});
console.log('Balance:', (parseInt(balance, 16) / 1e18), 'CELO');
```

---

## Once Connected Successfully

You can:
1. ✅ Browse quests at /dashboard
2. ✅ Complete quests to earn tokens
3. ✅ View rewards at /dashboard/rewards
4. ✅ Redeem tokens at shops /dashboard/shops
5. ✅ Check your submissions at /dashboard/my-submissions

All blockchain transactions will use YOUR wallet, not the oracle wallet!

---

## Need Help?

If you're still seeing the oracle address after following ALL steps:
1. Tell me what browser you're using
2. Show me the output of verifyConnection() script
3. Check if MetaMask is actually installed and unlocked
