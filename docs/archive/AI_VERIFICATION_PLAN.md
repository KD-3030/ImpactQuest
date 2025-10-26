# AI Verification System - Implementation Plan

## Overview
AI-powered oracle service to verify quest completion proofs (photos) before rewarding users on-chain.

---

## Architecture Decision

### Selected Model: **OpenAI GPT-4 Vision (gpt-4o)**

**Reasoning:**
- Best accuracy for real-world image verification (95%+)
- Understands context: "Did user actually plant a tree?" vs just showing a tree
- Handles poor lighting, angles, phone camera quality
- Can detect fraud/stock photos
- Simple API integration
- Cost-effective: ~$0.01 per verification

---

## Tech Stack

### 1. Backend Oracle
**Framework:** Next.js API Routes (recommended)
- ✅ Same repo as frontend
- ✅ Serverless deployment on Vercel
- ✅ Environment variables management
- ✅ TypeScript support

**Alternative:** Express.js microservice on Railway/Render

### 2. Image Storage
**Primary:** Pinata (IPFS)
- Free tier: 1GB storage
- Easy API integration
- Decentralized (Web3 native)
- Returns IPFS hash for proof verification

**Setup:**
```bash
npm install pinata-web3
```

### 3. AI Integration
**Primary:** OpenAI GPT-4 Vision
```bash
npm install openai
```

**Backup:** Google Gemini (free tier)
```bash
npm install @google/generative-ai
```

---

## Implementation Steps

### Phase 1: Setup Backend Oracle (Week 1)

#### Step 1.1: Create API Route
**File:** `celo-next-app/app/api/verify-quest/route.ts`

**Functionality:**
- Receive: questId, userId, photoFile, proofDescription
- Upload photo to Pinata → get IPFS hash
- Send to GPT-4V for verification
- Generate proof hash (keccak256)
- Call smart contract: `completeQuest(userId, questId, reward, proofHash)`
- Return: success/failure + reasoning

#### Step 1.2: Environment Setup
```env
# .env.local
OPENAI_API_KEY=sk-...
PINATA_JWT=eyJ...
ORACLE_PRIVATE_KEY=0x... # Wallet that calls contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # ImpactQuest contract
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
```

#### Step 1.3: Install Dependencies
```bash
cd celo-next-app
npm install openai pinata-web3 viem
```

---

### Phase 2: AI Verification Logic (Week 1-2)

#### Step 2.1: Quest Verification Prompts

**Environmental Quest Example:**
```javascript
const prompt = `You are an environmental impact verifier. Analyze this photo and determine if it genuinely shows: "${questDescription}"

Quest Category: ${category}
User Description: ${userProofText}

Verification Criteria:
1. Is this a real photo (not stock image/AI generated)?
2. Does it genuinely show the claimed action?
3. Is there evidence of actual effort/impact?
4. Are there any red flags (fraud, reused photos)?

Respond in JSON:
{
  "verified": true/false,
  "confidence": 0-100,
  "reasoning": "detailed explanation",
  "redFlags": ["list any concerns"]
}
`;
```

#### Step 2.2: Verification Thresholds
```javascript
const VERIFICATION_RULES = {
  minConfidence: 75,        // Minimum confidence to approve
  requireHumanReview: 60,   // Below this, flag for manual review
  autoReject: 40,           // Below this, auto-reject
  
  categoryWeights: {
    Environmental: 0.8,      // Stricter for high-reward
    CommunityService: 0.7,
    Education: 0.6,
    WasteReduction: 0.8,
    Sustainability: 0.7
  }
};
```

---

### Phase 3: Frontend Integration (Week 2)

#### Step 3.1: Camera Capture Component
**File:** `celo-next-app/components/QuestProofCapture.tsx`

**Features:**
- Camera access (mobile optimized)
- Preview before submit
- Add text description
- Upload progress indicator
- Success/failure feedback

#### Step 3.2: Quest Completion Flow
```
User Opens Quest → Takes Photo → Adds Description → 
Submit → [Loading: "AI verifying..."] → 
SUCCESS: Tokens awarded! / FAILURE: Reason shown
```

---

### Phase 4: Smart Contract Integration (Week 2-3)

#### Step 4.1: Oracle Wallet Setup
```javascript
// Backend only - NEVER expose on frontend
const oracleWallet = privateKeyToAccount(process.env.ORACLE_PRIVATE_KEY);
const contract = getContract({
  address: contractAddress,
  abi: ImpactQuestABI,
  client: walletClient(oracleWallet)
});
```

#### Step 4.2: Call Contract
```javascript
// After AI verification passes
const tx = await contract.write.completeQuest([
  userAddress,      // User who completed quest
  questId,          // Quest ID
  rewardAmount,     // IMP tokens to award
  proofHash         // keccak256(ipfsHash + timestamp)
]);
```

---

## Security Considerations

### 1. Proof Hash Anti-Replay
```javascript
// Ensure each proof is unique
const proofHash = keccak256(
  encodePacked(
    ['string', 'address', 'uint256', 'uint256'],
    [ipfsHash, userAddress, questId, Date.now()]
  )
);
```

### 2. Rate Limiting
```javascript
// Prevent spam/abuse
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // Max 5 verifications per user per 15min
});
```

### 3. Oracle Wallet Security
- Use Vercel/Railway environment variables (encrypted)
- Fund with minimal CELO (only for gas)
- Monitor for suspicious activity
- Rotate keys regularly

---

## Cost Estimation

### Development Phase (Alfajores Testnet)
- Celo Gas: FREE (testnet)
- OpenAI API: ~$20/month (200 verifications)
- Pinata: FREE (1GB)
- Vercel Hosting: FREE

### Production (Mainnet)
- Celo Gas: ~$0.001 per transaction (ultra-low)
- OpenAI API: ~$0.01 per verification
- Pinata: $20/month (100GB)
- Vercel Pro: $20/month

**Total per 1000 users:** ~$50-100/month

---

## Testing Strategy

### 1. Unit Tests
- Mock OpenAI responses
- Test all verification scenarios
- Test fraud detection

### 2. Integration Tests
- Test full flow: upload → verify → reward
- Test error handling
- Test edge cases (blurry photos, wrong quest type)

### 3. Beta Testing
- 10-20 real users on Alfajores
- Monitor accuracy
- Collect feedback on false positives/negatives

---

## Monitoring & Improvements

### 1. Analytics to Track
- Verification success rate
- Average confidence scores
- False positive rate (user disputes)
- AI response time
- Cost per verification

### 2. Continuous Improvement
- Fine-tune prompts based on failures
- Add human review queue for low-confidence
- Train custom model if >10k verifications/month
- A/B test different AI models

---

## Alternative: Hybrid Approach

For higher accuracy + lower cost:

```javascript
// Step 1: Quick classification (free/cheap model)
const isLikelyValid = await quickCheck(photo); // Google Gemini

// Step 2: Only use GPT-4V for borderline cases
if (isLikelyValid.confidence < 90) {
  finalVerdict = await detailedCheck(photo); // OpenAI GPT-4V
}
```

**Cost Savings:** ~40% reduction while maintaining accuracy

---

## Next Steps

1. **Set up OpenAI account** → Get API key
2. **Set up Pinata account** → Get JWT token
3. **Create oracle wallet** → Fund with testnet CELO
4. **Implement API route** → Basic verification endpoint
5. **Test with sample photos** → Validate accuracy
6. **Build frontend component** → Camera capture UI
7. **Deploy to Vercel** → Test end-to-end
8. **Beta test with real users** → Gather feedback

---

## Resources

- [OpenAI Vision API Docs](https://platform.openai.com/docs/guides/vision)
- [Pinata IPFS Guide](https://docs.pinata.cloud/)
- [Viem Contract Interaction](https://viem.sh/docs/contract/writeContract.html)
- [Celo Alfajores Faucet](https://faucet.celo.org)

---

## Estimated Timeline

- **Week 1:** Backend oracle + AI integration
- **Week 2:** Frontend camera component + testing
- **Week 3:** Deploy to testnet + beta testing
- **Week 4:** Refinements + production deployment

**Total:** 3-4 weeks to production-ready AI verification system
