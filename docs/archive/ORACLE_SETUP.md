# Oracle Setup Instructions

## 🔐 Setting Up the Oracle Private Key

The oracle is a **backend service** that executes blockchain transactions on behalf of users. It needs a private key to sign transactions.

### What You Need:

1. **A dedicated wallet** (DO NOT use your personal wallet!)
2. **The private key** from that wallet
3. **CELO tokens** in that wallet for gas fees (~0.1 CELO for testing)

### Steps:

#### 1. Get the Private Key

If you have a wallet from the main branch:
- **MetaMask**: Account Details → Show Private Key → Copy
- **Other Wallets**: Look for "Export Private Key" or "Show Private Key"

**⚠️ SECURITY WARNING:**
- NEVER share this private key
- NEVER commit it to GitHub
- Only use it in `.env.local` (which is gitignored)
- Use a dedicated wallet, not your personal one

#### 2. Add to `.env.local`

Open `c:\Impact-quest\celo-composer\.env.local` and replace:

```bash
ORACLE_PRIVATE_KEY=your_oracle_wallet_private_key_here
```

With:

```bash
ORACLE_PRIVATE_KEY=0xYOUR_64_CHARACTER_PRIVATE_KEY_HERE
```

Example format (this is NOT a real key):
```bash
ORACLE_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### 3. Fund the Oracle Wallet

The oracle wallet needs CELO to pay for gas fees:

1. Go to: https://faucet.celo.org/alfajores
2. Enter your oracle wallet address
3. Request CELO tokens
4. Wait ~30 seconds for tokens to arrive

#### 4. Verify Setup

After adding the private key and restarting the server:

```bash
cd c:\Impact-quest\celo-composer
npm run dev
```

Then try redeeming tokens. You should see in the terminal:
```
✅ Blockchain transaction successful: 0x...
```

### Troubleshooting:

**Error: "Invalid private key"**
- Make sure it starts with `0x`
- Should be 66 characters total (0x + 64 hex characters)
- No spaces or line breaks

**Error: "Insufficient funds for gas"**
- Send CELO to the oracle wallet address
- Check balance on: https://alfajores.celoscan.io/

**Error: "fetch failed"**
- Make sure `NEXT_PUBLIC_APP_URL=http://localhost:3001` (correct port)
- Restart the dev server after changing `.env.local`

### Current Oracle Wallet Address:

Once you add the private key, you can find the wallet address in the terminal logs or by using this tool:

```javascript
// In browser console after starting server
import { privateKeyToAccount } from 'viem/accounts';
const account = privateKeyToAccount('YOUR_PRIVATE_KEY');
console.log('Oracle Address:', account.address);
```

---

## 📊 How It Works:

1. User redeems tokens in the frontend
2. Frontend calls `/api/redemptions`
3. API calls `/api/oracle/record-redemption`
4. Oracle uses private key to sign and broadcast transaction
5. Smart contract burns tokens from user's balance
6. Transaction hash returned to frontend

The oracle is the **only account** that can call `recordRedemption()` on the smart contract (due to the `onlyOracle` modifier).
