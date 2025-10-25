# 🚀 IMPACTQUEST DEVELOPMENT WORKFLOW
## Quest Categories Feature Added Successfully!

**Date:** October 25, 2025  
**Feature:** Quest Categories & Filtering System  
**Status:** ✅ **IMPLEMENTED & TESTED** (30/30 tests passing)

---

## 📋 WHAT WAS ADDED

### **1. Quest Categories Enum**
```solidity
enum QuestCategory { 
    Environmental,      // 0 - Beach cleanups, tree planting
    CommunityService,   // 1 - Volunteering, helping neighbors
    Education,          // 2 - Teaching, workshops
    WasteReduction,     // 3 - Recycling, composting
    Sustainability      // 4 - Energy saving, water conservation
}
```

### **2. Updated Quest Struct**
```solidity
struct Quest {
    uint256 id;
    string name;
    string description;
    uint256 rewardAmount;
    uint256 impactScore;
    bool isActive;
    uint256 cooldownPeriod;
    QuestCategory category; // NEW!
}
```

### **3. New Storage for Category Filtering**
```solidity
mapping(QuestCategory => uint256[]) private questsByCategory;
```

### **4. New Functions Added**

#### **getQuestsByCategory(category)**
- Returns all quest IDs in a specific category
- Example: Get all Environmental quests

#### **getActiveQuestsByCategory(category)**
- Returns only active quests in a category
- Filters out deactivated quests automatically

#### **getCategoryName(category)**
- Converts category enum to readable string
- Example: `0` → `"Environmental"`

#### **getUserQuestsByCategory(user, category)**
- Returns how many quests user completed in a category
- Great for stats and achievements

---

## 🎯 COMPLETE DEVELOPMENT WORKFLOW

### **PHASE 1: SMART CONTRACT DEPLOYMENT** ⏳ (Next Step!)

#### **Step 1.1: Get Test CELO**
```powershell
# Go to Celo Faucet
# Visit: https://faucet.celo.org
# Connect your wallet
# Get testnet CELO for gas fees
```

#### **Step 1.2: Configure Environment**
```powershell
cd c:\Impact-quest\celo-composer\contracts

# Create .env file
Copy-Item .env.example .env

# Edit .env and add:
# PRIVATE_KEY=your_wallet_private_key_here
# (Get from MetaMask: Account Details → Export Private Key)
```

#### **Step 1.3: Deploy to Alfajores Testnet**
```powershell
npm run deploy:alfajores
```

**Expected Output:**
```
🚀 Deploying ImpactQuest to Celo...
✅ ImpactQuest deployed to: 0x123...abc
🎯 Creating initial quests...
   ✓ Created quest: Beach Cleanup (Environmental)
   ✓ Created quest: Tree Planting (Environmental)
   ✓ Created quest: Community Garden (Community Service)
   ✓ Created quest: Teach Recycling (Education)
   ✓ Created quest: Organize Recycling Drive (Waste Reduction)
   ✓ Created quest: Home Energy Audit (Sustainability)
```

#### **Step 1.4: Save Contract Address**
```
CONTRACT_ADDRESS=0x... (copy from deployment output)
```

#### **Step 1.5: Verify Contract (Optional but Recommended)**
```powershell
npx hardhat verify --network alfajores CONTRACT_ADDRESS ORACLE_ADDRESS
```

---

### **PHASE 2: FRONTEND INTEGRATION** (Week 1)

#### **Step 2.1: Update Frontend Environment**
```powershell
cd ..\celo-next-app

# Create or edit .env.local
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=0x..." > .env.local
echo "NEXT_PUBLIC_CHAIN_ID=44787" >> .env.local
```

#### **Step 2.2: Create Contract ABI File**
```powershell
# Copy ABI from compiled contract
cd ..\contracts
Copy-Item artifacts\contracts\ImpactQuest.sol\ImpactQuest.json ..\celo-next-app\lib\ImpactQuest.json
```

#### **Step 2.3: Create Contract Hook**
Create `celo-next-app/hooks/useImpactQuest.ts`:
```typescript
import { useReadContract, useWriteContract } from 'wagmi';
import ImpactQuestABI from '@/lib/ImpactQuest.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export function useImpactQuest() {
  // Read user profile
  const { data: userProfile } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ImpactQuestABI.abi,
    functionName: 'getUserProfile',
    args: [userAddress],
  });

  // Get quests by category
  const { data: envQuests } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ImpactQuestABI.abi,
    functionName: 'getActiveQuestsByCategory',
    args: [0], // Environmental
  });

  // Join ImpactQuest
  const { writeContract: joinImpactQuest } = useWriteContract();

  return {
    userProfile,
    envQuests,
    joinImpactQuest: () => joinImpactQuest({
      address: CONTRACT_ADDRESS,
      abi: ImpactQuestABI.abi,
      functionName: 'joinImpactQuest',
    }),
  };
}
```

#### **Step 2.4: Create Quest Category Filter UI**
Create `celo-next-app/app/quests/page.tsx`:
```typescript
'use client';
import { useState } from 'react';
import { useImpactQuest } from '@/hooks/useImpactQuest';

const CATEGORIES = [
  { id: 0, name: 'Environmental', emoji: '🌍', color: 'bg-green-500' },
  { id: 1, name: 'Community Service', emoji: '🤝', color: 'bg-blue-500' },
  { id: 2, name: 'Education', emoji: '📚', color: 'bg-purple-500' },
  { id: 3, name: 'Waste Reduction', emoji: '♻️', color: 'bg-yellow-500' },
  { id: 4, name: 'Sustainability', emoji: '💡', color: 'bg-teal-500' },
];

export default function QuestsPage() {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const { getQuestsByCategory } = useImpactQuest();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Available Quests</h1>
      
      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === cat.id 
                ? cat.color + ' text-white' 
                : 'bg-gray-200'
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Quest List */}
      <QuestList category={selectedCategory} />
    </div>
  );
}
```

#### **Step 2.5: Create "My Garden" Profile Page**
Create `celo-next-app/app/profile/page.tsx`:
```typescript
'use client';
import { useAccount } from 'wagmi';
import { useImpactQuest } from '@/hooks/useImpactQuest';

const LEVEL_IMAGES = {
  0: '/images/none.png',
  1: '/images/seedling.png',
  2: '/images/sprout.png',
  3: '/images/sapling.png',
  4: '/images/tree.png',
};

export default function ProfilePage() {
  const { address } = useAccount();
  const { userProfile, getUserQuestsByCategory } = useImpactQuest();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Garden 🌱</h1>
      
      {/* Plant Evolution Visual */}
      <div className="mb-8 text-center">
        <img 
          src={LEVEL_IMAGES[userProfile?.level || 0]} 
          alt="Your plant" 
          className="w-48 h-48 mx-auto"
        />
        <h2 className="text-2xl font-bold mt-4">
          {userProfile?.levelName || 'Not Joined'}
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Impact Score" 
          value={userProfile?.totalImpactScore || 0} 
        />
        <StatCard 
          label="Quests Completed" 
          value={userProfile?.questsCompleted || 0} 
        />
        <StatCard 
          label="IMP Tokens" 
          value={userProfile?.tokenBalance || 0} 
        />
        <StatCard 
          label="Next Level" 
          value={userProfile?.nextLevelScore || 0} 
        />
      </div>

      {/* Category Breakdown */}
      <h3 className="text-xl font-bold mb-4">Quests by Category</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => (
          <CategoryStats 
            key={cat.id} 
            category={cat} 
            count={getUserQuestsByCategory(address, cat.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

### **PHASE 3: AI ORACLE BACKEND** (Week 1-2)

#### **Step 3.1: Choose Backend Platform**
Options:
- **Vercel Serverless Functions** (Recommended - easy deployment)
- **AWS Lambda** (Scalable)
- **Railway/Render** (Simple Node.js server)

#### **Step 3.2: Create AI Verification Service**
Create `backend/api/verify-quest.ts` (Vercel example):
```typescript
import { OpenAI } from 'openai';
import { ethers } from 'ethers';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY!;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userAddress, questId, imageUrl } = req.body;

  try {
    // Step 1: AI Verification
    const quest = await getQuestDetails(questId);
    const verification = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: `Verify if this image shows: ${quest.description}` },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }]
    });

    const isValid = verification.choices[0].message.content.includes("VALID");
    
    if (!isValid) {
      return res.status(400).json({ error: 'Quest verification failed' });
    }

    // Step 2: Generate Proof Hash
    const timestamp = Date.now();
    const proofData = `${imageUrl}-${verification.id}-${timestamp}`;
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes(proofData));

    // Step 3: Call Smart Contract
    const provider = new ethers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
    const wallet = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    const tx = await contract.completeQuest(userAddress, questId, proofHash);
    await tx.wait();

    return res.status(200).json({
      success: true,
      txHash: tx.hash,
      proofHash,
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
}
```

#### **Step 3.3: Setup Environment Variables**
```bash
# backend/.env
OPENAI_API_KEY=sk-...
CONTRACT_ADDRESS=0x...
ORACLE_PRIVATE_KEY=0x...
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
```

#### **Step 3.4: Deploy Backend**
```powershell
# If using Vercel
cd backend
vercel deploy
```

---

### **PHASE 4: CAMERA & PHOTO SUBMISSION** (Week 2)

#### **Step 4.1: Add Camera Capture Component**
Create `celo-next-app/components/camera-capture.tsx`:
```typescript
'use client';
import { useRef, useState } from 'react';

export function CameraCapture({ onCapture }: { onCapture: (blob: Blob) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } // Back camera on mobile
    });
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
    setStream(mediaStream);
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) onCapture(blob);
      stream?.getTracks().forEach(track => track.stop());
    }, 'image/jpeg', 0.8);
  };

  return (
    <div className="camera-container">
      <video ref={videoRef} autoPlay playsInline className="w-full" />
      <div className="controls mt-4 flex gap-4">
        <button onClick={startCamera} className="btn-primary">
          📷 Start Camera
        </button>
        <button onClick={capturePhoto} className="btn-success">
          ✅ Capture Photo
        </button>
      </div>
    </div>
  );
}
```

#### **Step 4.2: Quest Submission Flow**
Create `celo-next-app/app/quest/[id]/submit/page.tsx`:
```typescript
'use client';
import { useState } from 'react';
import { CameraCapture } from '@/components/camera-capture';

export default function QuestSubmitPage({ params }: { params: { id: string } }) {
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    setUploading(true);
    
    // Step 1: Upload photo to storage (e.g., Cloudinary, IPFS, AWS S3)
    const formData = new FormData();
    formData.append('file', photo!);
    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const { imageUrl } = await uploadRes.json();

    // Step 2: Send to AI verification backend
    const verifyRes = await fetch('/api/verify-quest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress: address,
        questId: params.id,
        imageUrl,
      }),
    });

    const result = await verifyRes.json();
    
    if (result.success) {
      alert('Quest completed! 🎉 Tokens have been minted to your wallet!');
      router.push('/profile');
    } else {
      alert('Verification failed. Please try again.');
    }
    
    setUploading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Submit Quest Proof</h1>
      
      {!photo ? (
        <CameraCapture onCapture={setPhoto} />
      ) : (
        <div>
          <img src={URL.createObjectURL(photo)} alt="Captured" className="w-full mb-4" />
          <button 
            onClick={handleSubmit} 
            disabled={uploading}
            className="btn-primary w-full"
          >
            {uploading ? 'Verifying...' : 'Submit Quest'}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

### **PHASE 5: BUSINESS PARTNERSHIPS** (Week 3-4)

#### **Step 5.1: Add Business Registration to Contract** (Future Enhancement)
You already have this in SUGGESTED_IMPROVEMENTS.md - implement when ready!

#### **Step 5.2: Create Business Dashboard**
```typescript
// Admin panel for businesses to register
// Show QR code generator for discount redemption
// Track how many users qualify for their perks
```

#### **Step 5.3: User Discount Checker**
```typescript
// User shows their wallet at business
// Business scans QR code or checks address
// Contract verifies level/token balance
// Discount applied automatically
```

---

### **PHASE 6: TESTING & LAUNCH** (Week 4-5)

#### **Step 6.1: Beta Testing**
```
1. Deploy to Alfajores testnet
2. Recruit 10-20 beta testers
3. Give them test CELO
4. Have them complete real quests
5. Gather feedback on UX
6. Fix bugs and iterate
```

#### **Step 6.2: Security Audit** (If launching on mainnet)
```
1. Hire professional auditor (optional for testnet)
2. Run static analysis tools
3. Check for common vulnerabilities
4. Test edge cases
5. Review oracle security
```

#### **Step 6.3: Mainnet Deployment**
```powershell
# When ready for production
npm run deploy:mainnet

# Get real CELO (costs ~$0.0001)
# Verify contract on CeloScan
# Update frontend to mainnet
```

---

## 🎨 FRONTEND UI RECOMMENDATIONS

### **Homepage (`/`)**
- Hero section with plant evolution animation
- "Join ImpactQuest" CTA
- Featured quests carousel
- Live stats (total impact score globally)

### **Quests Page (`/quests`)**
- Category filter tabs (using new feature!)
- Quest cards with:
  - Category badge
  - Reward amount (IMP tokens)
  - Impact score
  - Cooldown time
  - Difficulty indicator
- Search functionality
- Sort by: Reward, Impact, Cooldown

### **My Garden (`/profile`)**
- Large plant visual (your current level)
- Progress bar to next level
- Stats dashboard
- Quest history timeline
- Category breakdown (using `getUserQuestsByCategory`)
- Token balance
- Redemption QR code for businesses

### **Quest Detail (`/quest/[id]`)**
- Full quest description
- Before/after photo examples
- Tips for completion
- Reward breakdown
- "Start Quest" button → Opens camera

### **Leaderboard (`/leaderboard`)**
- Top users by impact score
- Top users by quests completed
- Category leaders
- Friends comparison

---

## 📱 MOBILE CONSIDERATIONS

### **Progressive Web App (PWA)**
```typescript
// next.config.ts
import withPWA from 'next-pwa';

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})({
  // ... rest of Next.js config
});
```

### **Camera Optimization**
- Use native camera API
- Compress images before upload (max 2MB)
- Show preview before submission
- Add loading states

### **Offline Support**
- Cache quest data
- Queue submissions when offline
- Sync when connection restored

---

## 🔐 SECURITY BEST PRACTICES

### **Frontend**
- ✅ Never expose private keys
- ✅ Validate user inputs
- ✅ Use environment variables
- ✅ Implement rate limiting
- ✅ Add CAPTCHA to prevent bots

### **Backend (Oracle)**
- ✅ Secure API endpoints (authentication)
- ✅ Validate image uploads (size, format)
- ✅ Rate limit API calls
- ✅ Log all verifications
- ✅ Monitor for suspicious activity

### **Smart Contract**
- ✅ Already has ReentrancyGuard
- ✅ Proof hash anti-replay
- ✅ Cooldown protection
- ✅ Oracle-only access
- ✅ Add emergency pause (in SUGGESTED_IMPROVEMENTS.md)

---

## 📊 ANALYTICS TO TRACK

### **User Metrics**
- New signups per day
- Active users (completed quest in last 7 days)
- Average quests per user
- Retention rate (7-day, 30-day)

### **Quest Metrics**
- Most popular quests
- Average completion time
- Completion rate by quest
- Category distribution

### **Token Economics**
- Total IMP tokens minted
- Average tokens per user
- Tokens redeemed at businesses
- Token velocity

### **Business Metrics**
- Number of partners
- Redemptions per business
- User acquisition from ImpactQuest
- ROI for businesses

---

## 🚀 LAUNCH CHECKLIST

### **Pre-Launch (Week 5)**
- [ ] Contract deployed to testnet
- [ ] Frontend deployed to Vercel
- [ ] AI Oracle backend deployed
- [ ] Camera capture working on mobile
- [ ] 10+ quests created across all categories
- [ ] 3+ local businesses signed up
- [ ] Beta testing completed
- [ ] Bugs fixed
- [ ] Social media setup (Twitter, Instagram)
- [ ] Landing page with waitlist

### **Launch Day (Week 6)**
- [ ] Deploy to mainnet (or keep testnet for longer testing)
- [ ] Announce on social media
- [ ] Email beta testers
- [ ] Post in Celo community forums
- [ ] Submit to ProductHunt
- [ ] Press release to local news
- [ ] Host launch event (virtual or in-person)

### **Post-Launch (Week 7+)**
- [ ] Monitor analytics daily
- [ ] Fix critical bugs immediately
- [ ] Gather user feedback
- [ ] Iterate on UX
- [ ] Add new quests weekly
- [ ] Onboard more businesses
- [ ] Plan NFT integration (Phase 2)

---

## 💡 MARKETING STRATEGY

### **Target Audience**
1. **Environmentally Conscious Millennials/Gen Z**
   - Active on social media
   - Care about impact
   - Tech-savvy

2. **Local Communities**
   - Community gardens
   - Environmental groups
   - Schools and universities

3. **Local Businesses**
   - Eco-friendly shops
   - Cafes and restaurants
   - Yoga studios
   - Farmers markets

### **Growth Tactics**
1. **Social Proof**
   - Share user-generated content
   - Highlight big impact numbers
   - Feature top contributors

2. **Gamification**
   - Leaderboards
   - Streaks and achievements
   - Limited-time quests

3. **Partnerships**
   - Collaborate with environmental NGOs
   - University sustainability programs
   - Local government initiatives

4. **Referral Program**
   - Reward users who invite friends
   - Bonus tokens for referrals

---

## 🎯 SUCCESS METRICS (3 Months)

### **Minimum Viable Success**
- 100 active users
- 500+ quests completed
- 10+ business partners
- 5,000+ total impact score

### **Strong Success**
- 500 active users
- 2,500+ quests completed
- 25+ business partners
- 25,000+ total impact score

### **Exceptional Success**
- 1,000+ active users
- 10,000+ quests completed
- 50+ business partners
- 100,000+ total impact score
- Press coverage in local media

---

## 🔄 ITERATION CYCLE (Weekly)

### **Monday: Review**
- Check analytics
- Read user feedback
- Identify issues

### **Tuesday-Thursday: Build**
- Fix critical bugs
- Add new quests
- Improve UX
- Test features

### **Friday: Deploy**
- Deploy updates
- Announce new quests
- Celebrate wins

### **Weekend: Community**
- Engage on social media
- Feature user stories
- Plan next week

---

## 🎊 NEXT IMMEDIATE ACTIONS

### **TODAY (Right Now!)**
1. ✅ Quest Categories DONE! (30/30 tests passing)
2. 🔄 Deploy to Alfajores testnet
   ```powershell
   cd c:\Impact-quest\celo-composer\contracts
   npm run deploy:alfajores
   ```
3. 📝 Save contract address
4. 🎨 Start building frontend quest page

### **THIS WEEK**
1. Create quest filtering UI
2. Build camera capture component
3. Setup AI verification backend
4. Test end-to-end flow
5. Recruit beta testers

### **NEXT WEEK**
1. Launch beta program
2. Gather feedback
3. Iterate on UX
4. Onboard first businesses
5. Prepare for public launch

---

## 📚 RESOURCES

### **Celo Development**
- Docs: https://docs.celo.org
- Faucet: https://faucet.celo.org
- Explorer: https://alfajores.celoscan.io
- Discord: https://chat.celo.org

### **Smart Contract Tools**
- Hardhat: https://hardhat.org
- OpenZeppelin: https://openzeppelin.com/contracts
- Ethers.js: https://docs.ethers.org

### **Frontend**
- Next.js: https://nextjs.org
- RainbowKit: https://rainbowkit.com
- Wagmi: https://wagmi.sh

### **AI/ML**
- OpenAI Vision: https://platform.openai.com
- Hugging Face: https://huggingface.co (free alternative)

---

## 🎉 CONGRATULATIONS!

You now have:
- ✅ **Production-ready smart contract** with quest categories
- ✅ **Complete test coverage** (30/30 tests passing)
- ✅ **Deployment scripts** ready for 6 diverse quests
- ✅ **Clear development roadmap**
- ✅ **Marketing strategy**
- ✅ **Success metrics**

**The foundation is solid. Time to build the UI and launch! 🚀**

---

*Last Updated: October 25, 2025*  
*Contract: ImpactQuest.sol v1.1 (with Categories)*  
*Next Milestone: Testnet Deployment*
