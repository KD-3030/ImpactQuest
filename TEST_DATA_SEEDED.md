# Test Data Successfully Seeded! 🎉

## Overview
Successfully populated the database with comprehensive test data for Quests, Local Shops, and Redemptions. All data includes locations near **Mumbai, Maharashtra** for easy testing.

---

## What Was Seeded

### 📍 **8 Quests** (All Active)
All quests are located in Mumbai areas and include:

1. **Beach Cleanup at Juhu Beach** (+50 pts)
   - Category: Cleanup
   - Location: Juhu Beach, Mumbai
   - Coordinates: [72.8263, 19.0896]

2. **Plant Trees at Sanjay Gandhi National Park** (+75 pts)
   - Category: Planting
   - Location: Borivali East, Mumbai
   - Coordinates: [72.9147, 19.2183]

3. **E-Waste Recycling Drive - Colaba** (+40 pts)
   - Category: Recycling
   - Location: Colaba, Mumbai
   - Coordinates: [72.8311, 18.9388]

4. **Community Garden Care - Bandra** (+35 pts)
   - Category: Other
   - Location: Bandra West, Mumbai
   - Coordinates: [72.8479, 19.0596]

5. **Street Cleanup - Andheri West** (+45 pts)
   - Category: Cleanup
   - Location: Andheri West, Mumbai
   - Coordinates: [72.8347, 19.1136]

6. **Plastic-Free Market Initiative** (+60 pts)
   - Category: Recycling
   - Location: Dadar West, Mumbai
   - Coordinates: [72.8561, 19.0748]

7. **Mangrove Restoration - Mahim Creek** (+80 pts)
   - Category: Planting
   - Location: Mahim, Mumbai
   - Coordinates: [72.8406, 19.0383]

8. **School Garden Workshop - Powai** (+55 pts)
   - Category: Other
   - Location: Powai, Mumbai
   - Coordinates: [72.9047, 19.1176]

---

### 🏪 **6 Local Shops** (All Active & Accept Reward Tokens)

1. **Green Earth Café**
   - Category: Food
   - Location: Bandra West, Mumbai
   - Minimum Stage: Seedling
   - Contact: +91 22 2640 1234

2. **EcoWear Fashion**
   - Category: Clothing
   - Location: Juhu, Mumbai
   - Minimum Stage: Sprout
   - Contact: +91 22 2660 5678

3. **Tech Recycle Hub**
   - Category: Electronics
   - Location: Andheri West, Mumbai
   - Minimum Stage: Seedling
   - Contact: +91 22 2673 9012

4. **Nature's Basket Organic**
   - Category: Groceries
   - Location: Dadar West, Mumbai
   - Minimum Stage: Seedling
   - Contact: +91 22 2444 1234

5. **Green Clean Services**
   - Category: Services
   - Location: Bandra West, Mumbai
   - Minimum Stage: Sprout
   - Contact: +91 22 2651 7890

6. **Recycle & Repair Workshop**
   - Category: Services
   - Location: Powai, Mumbai
   - Minimum Stage: Seedling
   - Contact: +91 22 2570 3456

---

### 🎟️ **3 Redemptions** (Test User)

1. **Completed Redemption** - Green Earth Café
   - Tokens Redeemed: 10
   - Discount: 10% (₹50 off ₹500)
   - Code: RDM-M0L8U7LOE
   - Status: Completed (7 days ago)

2. **Completed Redemption** - Nature's Basket Organic
   - Tokens Redeemed: 15
   - Discount: 10% (₹80 off ₹800)
   - Code: RDM-3N53J3NGV
   - Status: Completed (3 days ago)

3. **Pending Redemption** - EcoWear Fashion
   - Tokens Redeemed: 20
   - Discount: 15% (₹180 off ₹1200)
   - Code: RDM-DLBD859GI
   - Status: Pending (Today)

---

### 👤 **Test User Created**

**Wallet Address:** `0x1234567890123456789012345678901234567890`

**Stats:**
- Impact Points: 250
- Total Impact Points: 500
- Reward Tokens: 50
- Current Stage: Sprout 🌿
- Role: User

---

## Real-Time Updates & Performance

### ✅ API Optimization Active
All API routes are using:
- **In-memory caching** (30-60 second TTL)
- **Database indexes** for fast queries
- **Lean queries** (plain objects, not Mongoose documents)
- **Field selection** (only fetching needed data)
- **Pagination** support

### 🔄 Polling-Based Auto-Refresh
Admin pages auto-refresh every **30 seconds** using `setInterval`:
- Admin Dashboard → Fetches users, quests, submissions
- Manage Quests → Fetches quest list
- Cache hits show "Returning cached..." in terminal logs

### 📊 Terminal Logs Show:
```
✅ MongoDB connected successfully
GET /api/admin/users 200 in 2686ms
GET /api/quests 200 in 3079ms
GET /api/admin/submissions 200 in 3127ms
Returning cached user stats
GET /api/admin/users 200 in 30ms
```

**First load:** ~2-3 seconds (database query)  
**Cached requests:** ~20-50ms (in-memory cache)

---

## Testing Instructions

### 1. **View Quests on Map**
```
http://localhost:3000/quest-hub
```
- All 8 quests should appear on the interactive map
- Click on markers to view quest details
- Filter by category (cleanup, planting, recycling, other)
- Search quests by name or description

### 2. **View Local Shops**
Access via API:
```bash
# Get all shops
curl http://localhost:3000/api/shops

# Get shops near location
curl "http://localhost:3000/api/shops?lat=19.0760&lng=72.8777&radius=50000"

# Filter by category
curl "http://localhost:3000/api/shops?category=food"
```

### 3. **View Redemptions**
```bash
# Get user's redemptions
curl "http://localhost:3000/api/redemptions?walletAddress=0x1234567890123456789012345678901234567890"

# Filter by status
curl "http://localhost:3000/api/redemptions?walletAddress=0x1234567890123456789012345678901234567890&status=completed"
```

### 4. **Admin Dashboard**
```
http://localhost:3000/admin/dashboard
```
- View total users, quests, submissions
- Auto-refreshes every 30 seconds
- Check browser Network tab to see polling

### 5. **Manage Quests**
```
http://localhost:3000/admin/quests
```
- View all 8 seeded quests
- Edit, delete, or create new quests
- Auto-refreshes every 30 seconds

---

## API Endpoints Available

### Quests
- `GET /api/quests` - List all active quests
- `GET /api/quests/:id` - Get quest details
- `POST /api/quests` - Create quest (admin only)
- `PUT /api/quests/:id` - Update quest (admin only)
- `DELETE /api/quests/:id` - Delete quest (admin only)

### Local Shops
- `GET /api/shops` - List all shops (with geolocation filtering)
- Query params: `lat`, `lng`, `radius`, `category`

### Redemptions
- `GET /api/redemptions` - Get user's redemptions
- `POST /api/redemptions` - Create new redemption
- Query params: `walletAddress`, `status`

### Users
- `GET /api/admin/users` - List all users (admin only)
- `GET /api/user/:address` - Get user profile

### Submissions
- `GET /api/admin/submissions` - List all submissions (admin only)

---

## Location Details

### Center Point
**Mumbai, Maharashtra**
- Coordinates: `[72.8777, 19.0760]` (Longitude, Latitude)

### Quest Locations Coverage
- **North:** Sanjay Gandhi National Park (Borivali)
- **South:** Colaba Causeway
- **East:** Powai
- **West:** Juhu Beach, Bandra
- **Central:** Dadar, Mahim, Andheri

### Distance Range
All locations are within **10-15 km** from Mumbai center, making them easily accessible for testing.

---

## Re-seeding Instructions

If you need to clear and re-seed the database:

```bash
# Run the seed script
node scripts/seedTestData.js
```

The script will:
1. Connect to MongoDB (using .env.local)
2. Clear existing quests, shops, and redemptions
3. Create 8 new quests
4. Create 6 new local shops
5. Create 1 test user (if doesn't exist)
6. Create 3 redemptions for the test user

---

## Performance Metrics

### Database Queries (First Load)
- Users API: ~2.6 seconds
- Quests API: ~3 seconds
- Submissions API: ~3.1 seconds

### Cached Requests
- All APIs: 20-50ms (98% faster!)

### Auto-Refresh
- Interval: 30 seconds
- Browser: Automatic (no manual refresh needed)
- Network Load: Minimal (uses cache when possible)

---

## Next Steps

1. ✅ **Quest Hub** - View quests on map (/quest-hub)
2. ✅ **Admin Dashboard** - Monitor real-time stats (/admin/dashboard)
3. ✅ **Local Shops** - Test shop discovery (/api/shops)
4. ✅ **Redemptions** - View test redemptions (/api/redemptions)
5. 🔄 **Connect Wallet** - Use test wallet address to see user data
6. 🔄 **Complete Quest** - Submit quest completion and earn points
7. 🔄 **Redeem Tokens** - Test token redemption at local shops

---

## Notes

- All shops accept reward tokens
- Test user has **50 tokens** available
- Shops require minimum stages (seedling or sprout)
- Redemption codes are auto-generated
- All data includes realistic contact info and descriptions
- Images use Unsplash placeholder URLs

---

## Troubleshooting

### If quests don't appear on map:
1. Check browser console for errors
2. Verify MongoDB connection in terminal
3. Clear browser cache and refresh
4. Check /api/quests endpoint directly

### If caching not working:
1. Check terminal logs for "Returning cached..." messages
2. Verify lib/cache.ts is being used
3. Wait 30-60 seconds for first cache to populate

### If polling not working:
1. Open browser DevTools → Network tab
2. Should see API calls every 30 seconds
3. Check admin page console for intervals

---

## Success! 🎉

Your database is now fully populated with test data. All quests are near Mumbai, Maharashtra, and ready for testing. Visit **http://localhost:3000/quest-hub** to see them on the map!

**Happy Testing!** 🌱🌿🌳🌲
