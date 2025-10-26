# 🔌 ImpactQuest API Documentation

## Base URL
```
http://localhost:3000/api (Development)
https://your-domain.com/api (Production)
```

---

## ✅ API Endpoint Status

All endpoints tested and functional! ✓

---

## 📋 Quest Endpoints

### 1. GET /api/quests
Get list of all active quests

**Query Parameters:**
- `lat` (optional): Latitude for nearby search
- `lng` (optional): Longitude for nearby search
- `radius` (optional): Search radius in meters (default: 10000)

**Response:**
```json
{
  "success": true,
  "quests": [
    {
      "_id": "68fcab286ed67d10d2ee693a",
      "title": "Beach Cleanup at Juhu",
      "description": "Help clean up the beautiful Juhu Beach...",
      "location": {
        "type": "Point",
        "coordinates": [72.8263, 19.0896],
        "address": "Juhu Beach, Mumbai, Maharashtra"
      },
      "category": "cleanup",
      "impactPoints": 50,
      "verificationPrompt": "A person holding a trash bag...",
      "isActive": true,
      "createdAt": "2025-10-25T10:49:12.672Z"
    }
  ],
  "count": 5
}
```

**Example Usage:**
```bash
# Get all quests
curl http://localhost:3000/api/quests

# Get nearby quests
curl "http://localhost:3000/api/quests?lat=19.0760&lng=72.8777&radius=5000"
```

---

### 2. POST /api/quests
Create a new quest (Admin only - no auth check yet)

**Request Body:**
```json
{
  "title": "Beach Cleanup at Marina",
  "description": "Clean up Marina Beach and collect waste",
  "coordinates": [72.8236, 18.9432],
  "address": "Marine Drive, Mumbai, Maharashtra",
  "category": "cleanup",
  "impactPoints": 50,
  "verificationPrompt": "Person collecting trash on beach"
}
```

**Response:**
```json
{
  "success": true,
  "quest": {
    "_id": "68fcaf072029cacd7a7c8ea4",
    "title": "Beach Cleanup at Marina",
    ...
  }
}
```

**Categories:**
- `cleanup`
- `planting`
- `recycling`
- `education`
- `other`

---

### 3. GET /api/quests/[id]
Get a single quest by ID

**Response:**
```json
{
  "success": true,
  "quest": {
    "_id": "68fcab286ed67d10d2ee6936",
    "title": "Beach Cleanup at Juhu",
    ...
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Quest not found"
}
```

---

### 4. PUT /api/quests/[id]
Update a quest (Admin only - no auth check yet)

**Request Body:**
```json
{
  "title": "Updated Beach Cleanup",
  "description": "Updated description",
  "location": {
    "type": "Point",
    "coordinates": [72.8263, 19.0896],
    "address": "Juhu Beach, Mumbai"
  },
  "category": "cleanup",
  "impactPoints": 60,
  "verificationPrompt": "Updated prompt",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "quest": {
    "_id": "68fcab286ed67d10d2ee6936",
    "title": "Updated Beach Cleanup",
    ...
  }
}
```

---

### 5. DELETE /api/quests/[id]
Delete a quest (Admin only - no auth check yet)

**Response:**
```json
{
  "success": true,
  "message": "Quest deleted successfully"
}
```

---

## 👤 User Endpoints

### 6. GET /api/user/[address]
Get user stats by wallet address

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "68fcafe12029cacd7a7c8ea6",
    "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
    "level": 1,
    "totalImpactPoints": 45,
    "completedQuests": 1,
    "stage": "seedling",
    "createdAt": "2025-10-25T11:00:01.234Z",
    "updatedAt": "2025-10-25T11:05:30.123Z"
  }
}
```

**Stages:**
- `seedling` (0-99 points) 🌱
- `sprout` (100-299 points) 🌿
- `tree` (300-599 points) 🌳
- `forest` (600+ points) 🌲

**Level Calculation:**
```javascript
level = Math.floor(totalImpactPoints / 50) + 1
```

---

## 📸 Submission Endpoints

### 7. POST /api/submit-proof
Submit quest completion proof with photo

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "questId": "68fcab286ed67d10d2ee6936",
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "verified": true,
  "submission": {
    "_id": "68fcafe62029cacd7a7c8ea8",
    "userId": "68fcafe12029cacd7a7c8ea6",
    "questId": "68fcab286ed67d10d2ee6936",
    "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
    "imageUrl": "data:image/jpeg;base64,...",
    "verified": true,
    "aiResponse": "Verified successfully",
    "impactPointsEarned": 50,
    "submittedAt": "2025-10-25T11:05:30.123Z"
  },
  "user": {
    "level": 2,
    "totalImpactPoints": 50,
    "completedQuests": 1,
    "stage": "seedling"
  },
  "pointsEarned": 50
}
```

**Error Response (Already Completed):**
```json
{
  "success": false,
  "error": "You have already completed this quest"
}
```

**Features:**
- ✅ Creates user if doesn't exist
- ✅ Validates quest exists
- ✅ Prevents duplicate submissions
- ✅ Mock AI verification (returns true)
- ✅ Updates user stats (points, level, stage)
- ✅ Records submission with timestamp

---

## 👨‍💼 Admin Endpoints

### 8. GET /api/admin/submissions
Get all quest submissions (Admin only - no auth check yet)

**Query Parameters:**
- `status` (optional): Filter by status
  - `pending` - Unverified submissions
  - `verified` - Verified submissions
  - `all` or omit - All submissions

**Response:**
```json
{
  "success": true,
  "submissions": [
    {
      "_id": "68fcafe62029cacd7a7c8ea8",
      "userId": {
        "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
        "level": 2,
        "totalImpactPoints": 50
      },
      "questId": {
        "title": "Beach Cleanup at Juhu",
        "impactPoints": 50
      },
      "verified": true,
      "impactPointsEarned": 50,
      "submittedAt": "2025-10-25T11:05:30.123Z"
    }
  ],
  "count": 1
}
```

**Example Usage:**
```bash
# Get all submissions
curl http://localhost:3000/api/admin/submissions

# Get only verified
curl http://localhost:3000/api/admin/submissions?status=verified

# Get only pending
curl http://localhost:3000/api/admin/submissions?status=pending
```

---

### 9. GET /api/admin/users
Get all users and total platform stats (Admin only - no auth check yet)

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "_id": "68fcafe12029cacd7a7c8ea6",
      "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
      "level": 2,
      "totalImpactPoints": 50,
      "completedQuests": 1,
      "stage": "seedling",
      "createdAt": "2025-10-25T11:00:01.234Z"
    }
  ],
  "count": 1,
  "totalPoints": 50
}
```

---

## 🧪 Testing the API

### Using cURL

```bash
# 1. Get all quests
curl http://localhost:3000/api/quests

# 2. Get single quest
curl http://localhost:3000/api/quests/QUEST_ID

# 3. Create quest
curl -X POST http://localhost:3000/api/quests \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Quest",
    "description": "Description here",
    "coordinates": [72.8777, 19.0760],
    "address": "Mumbai",
    "category": "cleanup",
    "impactPoints": 25,
    "verificationPrompt": "Photo of cleanup"
  }'

# 4. Update quest
curl -X PUT http://localhost:3000/api/quests/QUEST_ID \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "impactPoints": 30}'

# 5. Delete quest
curl -X DELETE http://localhost:3000/api/quests/QUEST_ID

# 6. Get user stats
curl http://localhost:3000/api/user/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1

# 7. Submit quest proof
curl -X POST http://localhost:3000/api/submit-proof \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xYourAddress",
    "questId": "QUEST_ID",
    "imageData": "data:image/jpeg;base64,..."
  }'

# 8. Get all submissions
curl http://localhost:3000/api/admin/submissions

# 9. Get all users
curl http://localhost:3000/api/admin/users
```

### Using the Test Script

```bash
# Run comprehensive API tests
bash scripts/test-api.sh
```

---

## 🔒 Security Notes (For Production)

### Current State (MVP/Development)
- ❌ No authentication middleware
- ❌ No rate limiting
- ❌ No admin role verification
- ✅ Input validation on required fields
- ✅ MongoDB injection prevention (Mongoose)
- ✅ Wallet address normalization (lowercase)

### TODO for Production
```typescript
// 1. Add authentication middleware
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of the code
}

// 2. Add admin role check
if (!user.isAdmin) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// 3. Add rate limiting
import { rateLimit } from '@/lib/rate-limit';
await rateLimit(request);

// 4. Add CORS headers
const headers = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
};
```

---

## 🚀 Integration with Smart Contracts

### Future Enhancement (Phase 2)
When you merge with your blockchain backend branch:

```typescript
// Example: Award NFT on quest completion
import { awardNFT } from '@/lib/blockchain';

// In submit-proof route
if (isVerified) {
  // Update database
  await user.save();
  
  // Mint NFT on blockchain
  const tx = await awardNFT(
    walletAddress,
    quest.impactPoints,
    quest.category
  );
  
  return NextResponse.json({
    ...response,
    nftMinted: true,
    transactionHash: tx.hash
  });
}
```

---

## 📊 Database Schema Reference

### Quest Schema
```typescript
{
  title: String,
  description: String,
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number], // [longitude, latitude]
    address: String
  },
  category: String,
  impactPoints: Number,
  verificationPrompt: String,
  isActive: Boolean,
  createdAt: Date
}
```

### User Schema
```typescript
{
  walletAddress: String (unique, lowercase),
  level: Number,
  totalImpactPoints: Number,
  completedQuests: Number,
  stage: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Submission Schema
```typescript
{
  userId: ObjectId (ref: User),
  questId: ObjectId (ref: Quest),
  walletAddress: String,
  imageUrl: String,
  verified: Boolean,
  aiResponse: String,
  impactPointsEarned: Number,
  submittedAt: Date
}
```

---

## 🎯 API Status Summary

| Endpoint | Method | Status | Auth Required |
|----------|--------|--------|---------------|
| `/api/quests` | GET | ✅ Working | No |
| `/api/quests` | POST | ✅ Working | Future: Admin |
| `/api/quests/[id]` | GET | ✅ Working | No |
| `/api/quests/[id]` | PUT | ✅ Working | Future: Admin |
| `/api/quests/[id]` | DELETE | ✅ Working | Future: Admin |
| `/api/submit-proof` | POST | ✅ Working | Future: User |
| `/api/user/[address]` | GET | ✅ Working | No |
| `/api/admin/submissions` | GET | ✅ Working | Future: Admin |
| `/api/admin/users` | GET | ✅ Working | Future: Admin |

---

## ✅ All Endpoints Tested and Functional!

The API is ready for frontend integration. All 9 endpoints are working correctly with proper:
- ✅ Input validation
- ✅ Error handling
- ✅ Database connections
- ✅ Data relationships (populate)
- ✅ Response formatting
- ✅ HTTP status codes

---

**Built with 💚 on Celo | API v1.0**
