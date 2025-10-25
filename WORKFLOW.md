# 📊 ImpactQuest Workflow & Architecture

## 🔄 Complete User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER OPENS APP (/)                            │
│                                                                   │
│  🌱 Landing Page                                                 │
│  - Hero section with branding                                    │
│  - "Connect Wallet" button (RainbowKit)                         │
│  - Feature highlights                                            │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │ Wallet Connected?│
              └────┬───────┬─────┘
                   │ NO    │ YES
                   │       │
                   ▼       ▼
            [Stay on /]  [Redirect to /quest-hub]
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              QUEST HUB (/quest-hub)                              │
│                                                                   │
│  Tab 1: 🗺️  Nearby Quests                                        │
│  ┌────────────────┬──────────────────┐                          │
│  │   Quest List   │  Interactive Map │                          │
│  │   - Title      │  - Markers       │                          │
│  │   - Points     │  - Popups        │                          │
│  │   - Location   │  - Clusters      │                          │
│  └────────────────┴──────────────────┘                          │
│                                                                   │
│  Tab 2: 🌱 My Garden                                             │
│  ┌──────────────────────────────────┐                           │
│  │  Stats Dashboard                 │                           │
│  │  - Level: 5                      │                           │
│  │  - Points: 250                   │                           │
│  │  - Quests: 5                     │                           │
│  │  - Stage: 🌿 Sprout              │                           │
│  └──────────────────────────────────┘                           │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼ (User clicks quest)
┌─────────────────────────────────────────────────────────────────┐
│              QUEST DETAIL (/quest/[id])                          │
│                                                                   │
│  📋 Quest Information                                            │
│  - Title: "Beach Cleanup at Juhu"                               │
│  - Description: Help clean up the beach                          │
│  - Points: +50                                                   │
│  - What to capture: "trash bag on beach"                        │
│                                                                   │
│  📸 Proof Submission                                             │
│  ┌──────────────────────────┐                                   │
│  │  [Open Camera] Button    │                                   │
│  └──────────────────────────┘                                   │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼ (User clicks "Open Camera")
┌─────────────────────────────────────────────────────────────────┐
│                  CAMERA ACTIVE                                   │
│                                                                   │
│  ┌──────────────────────────────┐                               │
│  │                               │                               │
│  │     📹 Live Camera Feed       │                               │
│  │    (navigator.mediaDevices)   │                               │
│  │                               │                               │
│  └──────────────────────────────┘                               │
│                                                                   │
│  [📸 Capture Photo]  [Cancel]                                   │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼ (User captures photo)
┌─────────────────────────────────────────────────────────────────┐
│                  PHOTO PREVIEW                                   │
│                                                                   │
│  ┌──────────────────────────────┐                               │
│  │                               │                               │
│  │     Captured Image Preview    │                               │
│  │                               │                               │
│  └──────────────────────────────┘                               │
│                                                                   │
│  [✅ Submit Proof]  [🔄 Retake]                                  │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼ (User submits)
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND PROCESSING                                  │
│                                                                   │
│  POST /api/submit-proof                                          │
│  ┌────────────────────────────────┐                             │
│  │ 1. Validate inputs             │                             │
│  │ 2. Get quest details           │                             │
│  │ 3. Get/create user             │                             │
│  │ 4. Check for duplicate         │                             │
│  │ 5. AI verification (mock)      │◄── 🤖 Future: OpenAI Vision│
│  │ 6. Create submission record    │                             │
│  │ 7. Update user stats           │                             │
│  │ 8. Calculate new level/stage   │                             │
│  │ 9. Return result               │                             │
│  └────────────────────────────────┘                             │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                  RESULT SCREEN                                   │
│                                                                   │
│  ✅ Impact Verified!                                             │
│  ┌──────────────────────────────┐                               │
│  │  🎉 Amazing! You earned      │                               │
│  │     50 impact points!        │                               │
│  │                               │                               │
│  │  [Your photo displayed]      │                               │
│  │                               │                               │
│  │  New Stats:                  │                               │
│  │  - Level: 6 (+1)             │                               │
│  │  - Points: 300 (+50)         │                               │
│  │  - Stage: 🌳 Tree (upgraded!)│                               │
│  └──────────────────────────────┘                               │
│                                                                   │
│  [Return to Quest Hub]                                           │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
             [Back to Quest Hub]
```

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│                      (Next.js 14)                                │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Landing    │  │  Quest Hub   │  │ Quest Detail │         │
│  │   page.tsx   │  │  page.tsx    │  │  page.tsx    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────┐               │
│  │         providers.tsx (Context)             │               │
│  │  - RainbowKitProvider                       │               │
│  │  - WagmiProvider (Celo config)              │               │
│  │  - QueryClientProvider                      │               │
│  └─────────────────────────────────────────────┘               │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BLOCKCHAIN                                 │
│                      (Celo Network)                              │
│                                                                   │
│  ┌────────────────┐         ┌────────────────┐                 │
│  │ Celo Mainnet   │         │ Alfajores Test │                 │
│  │ (Production)   │         │  (Development) │                 │
│  └────────────────┘         └────────────────┘                 │
│         │                            │                           │
│         └────────────────────────────┘                          │
│                      │                                           │
│                      ▼                                           │
│         ┌───────────────────────┐                               │
│         │   Wallet Connection   │                               │
│         │   - MetaMask          │                               │
│         │   - Coinbase Wallet   │                               │
│         │   - WalletConnect     │                               │
│         │   - Valora            │                               │
│         └───────────────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND API                                │
│                    (Next.js API Routes)                          │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  GET /api/quests │  │ POST /api/quests │                    │
│  │  (List quests)   │  │ (Create quest)   │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                   │
│  ┌───────────────────────────┐  ┌─────────────────────────┐   │
│  │ GET /api/user/[address]   │  │ POST /api/submit-proof  │   │
│  │ (Get/create user profile) │  │ (Verify & award points) │   │
│  └───────────────────────────┘  └─────────────────────────┘   │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
│                    (MongoDB Atlas)                               │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Users     │  │    Quests    │  │ Submissions  │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │ walletAddr   │  │ title        │  │ userId       │         │
│  │ level        │  │ description  │  │ questId      │         │
│  │ points       │  │ location     │  │ imageUrl     │         │
│  │ stage        │  │ category     │  │ verified     │         │
│  │ completed    │  │ points       │  │ points       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                   │
│  ┌─────────────────────────────────────────┐                   │
│  │  lib/mongodb.ts (Connection Handler)    │                   │
│  │  models/index.ts (Mongoose Schemas)     │                   │
│  └─────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Example: Quest Completion

```
1. USER ACTION
   └─► User clicks "Submit Proof" with captured image

2. FRONTEND
   └─► app/quest/[id]/page.tsx
       └─► submitProof() function
           └─► POST request to /api/submit-proof
               Body: {
                 walletAddress: "0x123...",
                 questId: "abc123",
                 imageData: "data:image/jpeg;base64,..."
               }

3. API ROUTE
   └─► app/api/submit-proof/route.ts
       ├─► Connect to MongoDB
       ├─► Validate inputs
       ├─► Fetch Quest from database
       │   └─► Quest.findById(questId)
       │       └─► Returns: { title, points: 50, verificationPrompt: "..." }
       │
       ├─► Get or Create User
       │   └─► User.findOne({ walletAddress })
       │       └─► Returns: { level: 5, points: 250, stage: "sprout" }
       │
       ├─► Check for Duplicate Submission
       │   └─► Submission.findOne({ userId, questId, verified: true })
       │       └─► Returns: null (not completed yet)
       │
       ├─► AI Verification (Mock)
       │   └─► verifyImageWithAI(imageData, verificationPrompt)
       │       └─► Returns: true (always, for now)
       │       └─► 🔮 Future: Call OpenAI Vision API
       │
       ├─► Create Submission Record
       │   └─► Submission.create({
       │         userId, questId, imageUrl,
       │         verified: true,
       │         impactPointsEarned: 50
       │       })
       │
       └─► Update User Stats
           ├─► newPoints = 250 + 50 = 300
           ├─► newLevel = Math.floor(300 / 50) + 1 = 7
           ├─► newStage = calculateStage(300) = "tree" 🌳
           └─► user.save()

4. RESPONSE
   └─► Return JSON: {
         success: true,
         verified: true,
         pointsEarned: 50,
         user: {
           level: 7,
           totalImpactPoints: 300,
           stage: "tree",
           completedQuests: 6
         }
       }

5. FRONTEND UPDATE
   └─► app/quest/[id]/page.tsx
       └─► setResult({ success: true, ... })
           └─► Show success screen with confetti 🎉
               └─► Display new stats and upgraded stage
```

---

## 🌐 External Services Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│                                                                   │
│  🗺️  OpenStreetMap                                              │
│  └─► Provides map tiles for react-leaflet                       │
│      └─► URL: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png│
│                                                                   │
│  🔗 WalletConnect                                                │
│  └─► Provides wallet connection infrastructure                  │
│      └─► Project ID required from cloud.walletconnect.com       │
│                                                                   │
│  💾 MongoDB Atlas                                                │
│  └─► Cloud database service                                     │
│      └─► Connection string format:                              │
│          mongodb+srv://user:pass@cluster.mongodb.net/db         │
│                                                                   │
│  🌐 Celo Network                                                │
│  └─► Blockchain RPC endpoints                                   │
│      ├─► Mainnet: https://forno.celo.org                       │
│      └─► Alfajores: https://alfajores-forno.celo-testnet.org   │
│                                                                   │
│  🤖 OpenAI Vision API (Future)                                  │
│  └─► AI image verification                                      │
│      └─► Endpoint: https://api.openai.com/v1/chat/completions  │
│          └─► Model: gpt-4-vision-preview                        │
│                                                                   │
│  📦 IPFS (Future)                                               │
│  └─► Decentralized image storage                               │
│      └─► Providers: Pinata, NFT.Storage, Web3.Storage          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION STATE                             │
│                                                                   │
│  GLOBAL STATE (via Context)                                     │
│  ┌────────────────────────────────────┐                         │
│  │ RainbowKit + wagmi                 │                         │
│  │ - isConnected: boolean             │                         │
│  │ - address: string                  │                         │
│  │ - chain: Chain                     │                         │
│  └────────────────────────────────────┘                         │
│                                                                   │
│  LOCAL STATE (per page)                                         │
│  ┌────────────────────────────────────┐                         │
│  │ Quest Hub                          │                         │
│  │ - activeTab: 'quests' | 'garden'  │                         │
│  │ - quests: Quest[]                  │                         │
│  │ - userStats: UserStats             │                         │
│  │ - loading: boolean                 │                         │
│  └────────────────────────────────────┘                         │
│                                                                   │
│  ┌────────────────────────────────────┐                         │
│  │ Quest Detail                       │                         │
│  │ - quest: Quest                     │                         │
│  │ - cameraActive: boolean            │                         │
│  │ - capturedImage: string | null     │                         │
│  │ - submitting: boolean              │                         │
│  │ - result: Result | null            │                         │
│  └────────────────────────────────────┘                         │
│                                                                   │
│  STATE UPDATES                                                   │
│  ┌────────────────────────────────────┐                         │
│  │ Wallet Connection                  │                         │
│  │ └─► Auto-redirect to /quest-hub    │                         │
│  │                                     │                         │
│  │ Quest Completion                   │                         │
│  │ └─► Update local result state      │                         │
│  │     └─► Re-fetch user stats        │                         │
│  │         └─► Show in My Garden      │                         │
│  └────────────────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Decision Points

### When to use MongoDB vs Blockchain?

```
USE MONGODB FOR:
├─► Quest metadata (title, description, location)
├─► User profiles (stats, level, stage)
├─► Submission records (photos, timestamps)
└─► Fast queries and filtering

USE BLOCKCHAIN FOR (Phase 2):
├─► Token minting and transfers
├─► Proof of ownership (SBTs)
├─► Immutable achievement records
└─► Token-gated access control
```

### When to verify on-chain vs off-chain?

```
OFF-CHAIN (Current):
├─► Mock AI verification
├─► Point assignment
├─► Level calculations
└─► Stage progression

ON-CHAIN (Future):
├─► Token minting
├─► NFT evolution
├─► Reward distribution
└─► Business verification
```

---

This workflow document provides a complete visual representation of how your ImpactQuest application works from start to finish! 🚀
