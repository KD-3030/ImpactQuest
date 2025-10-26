# 🧪 ImpactQuest Testing Guide

## ✅ What's Been Set Up

### Database
- ✅ MongoDB Atlas connected successfully
- ✅ 5 sample quests seeded in database:
  1. Beach Cleanup at Juhu (+50 pts)
  2. Plant Trees in Aarey Forest (+75 pts)
  3. Recycle E-Waste Drive (+40 pts)
  4. Community Garden Maintenance (+35 pts)
  5. Street Cleanup Initiative (+45 pts)

### Pages Created & Functional
- ✅ Landing page with wallet connect
- ✅ Role selection login page
- ✅ Admin Dashboard with stats
- ✅ Admin Create Quest page
- ✅ Admin Manage Quests page
- ✅ **Admin Edit Quest page (NEW)**
- ✅ User Dashboard with stats
- ✅ User Browse Quests with map
- ✅ User My Garden page
- ✅ **Quest Detail page with camera (UPDATED)**

---

## 🚀 Testing Instructions

### Access the Application
Open your browser and navigate to: **http://localhost:3000**

---

## 🎯 Test Flow 1: Admin (Quest Master)

### Step 1: Login as Admin
1. Click **"Get Started"** on landing page
2. Connect your Celo wallet (if not already connected)
3. Navigate to `/login` or click login
4. Select **"Quest Master"** role
5. ✅ You should be redirected to `/admin/dashboard`

### Step 2: View Admin Dashboard
1. Check the statistics cards:
   - Total Quests: Should show 5 (from seeded data)
   - Active Quests: Should show 5
   - Total Users: Will be 0 (no users yet)
   - Pending Reviews: 0
   - Approved Submissions: 0
   - Total Impact Points: 0

### Step 3: View All Quests
1. Click **"Manage Quests"** in sidebar or "Manage All Quests" button
2. ✅ Should see table with 5 quests
3. Test filters:
   - Click "All" - shows all 5 quests
   - Click "Active" - shows all 5 quests
   - Click "Inactive" - shows 0 quests

### Step 4: Toggle Quest Active/Inactive
1. Find any quest in the table
2. Click the toggle switch in the "Active" column
3. ✅ Quest should toggle between active/inactive
4. Filter by "Inactive" to confirm
5. Toggle it back to active

### Step 5: Edit a Quest
1. Click the **Edit** button (pencil icon) on any quest
2. ✅ Should navigate to `/admin/edit-quest/[id]`
3. Form should be pre-filled with quest data:
   - Title
   - Description
   - Category
   - Points
   - Location address
   - Coordinates
   - AI verification prompt
   - Active status toggle
4. Make changes (e.g., change title or points)
5. Click **"Update Quest"**
6. ✅ Should show success alert
7. ✅ Should redirect back to `/admin/quests`
8. ✅ Changes should be visible in the table

### Step 6: Create New Quest
1. Click **"Create Quest"** in sidebar or button
2. Fill in the form:
   ```
   Title: Test Quest from UI
   Description: This is a test quest created through the admin interface
   Category: Cleanup
   Points: 100
   Address: Marine Drive, Mumbai, Maharashtra
   Latitude: 18.9432
   Longitude: 72.8236
   AI Prompt: A person cleaning up trash at Marine Drive
   ```
3. Click **"Create Quest"**
4. ✅ Should show success message
5. ✅ Should redirect to `/admin/quests`
6. ✅ New quest should appear in the table (now 6 quests total)

### Step 7: Delete a Quest
1. Find the quest you just created
2. Click the **Delete** button (trash icon)
3. ✅ Confirmation dialog should appear
4. Click "OK"
5. ✅ Quest should disappear from table
6. ✅ Total should be back to 5 quests

---

## 👥 Test Flow 2: User (Quest Hunter)

### Step 1: Logout and Login as User
1. Click **"Logout"** in sidebar
2. Navigate to `/login`
3. Connect wallet (if needed)
4. Select **"Quest Hunter"** role
5. ✅ Should be redirected to `/dashboard`

### Step 2: View User Dashboard
1. Check welcome message with your wallet address
2. View stats cards:
   - Current Stage: 🌱 Seedling (0 pts)
   - Level: 1
   - Impact Points: 0
   - Quests Completed: 0
3. View progress bar (should be at 0%)
4. See "Featured Quests" section with 3 quests

### Step 3: Browse Quests
1. Click **"Browse Quests"** in sidebar or button
2. ✅ Should see `/dashboard/quests` page
3. ✅ Left side: Quest cards list
4. ✅ Right side: Interactive map with markers
5. Test category filters:
   - Click "All" - shows all 5 quests
   - Click "Cleanup" - shows cleanup quests
   - Click "Planting" - shows planting quests
   - Click back to "All"
6. Click on a map marker
   - ✅ Should show quest title in popup
7. Click on a quest card
   - ✅ Should navigate to quest detail page

### Step 4: View Quest Detail
1. Should be on `/quest/[id]` page
2. ✅ Quest title and description displayed
3. ✅ Impact points badge shown
4. ✅ Blue box with AI verification instructions
5. ✅ Location address displayed

### Step 5: Submit Quest Proof (Photo)
**Note:** This requires camera access on your device.

#### Option A: Using Real Camera (Desktop/Mobile)
1. Click **"Open Camera"** button
2. Browser will ask for camera permission - Click "Allow"
3. ✅ Camera feed should appear
4. Position camera to take a relevant photo
5. Click **"📸 Capture Photo"**
6. ✅ Photo preview should appear
7. Review the photo:
   - If good: Click **"Submit Proof"**
   - If not: Click **"Retake"** to try again

#### Option B: Testing Without Camera
If you don't have a camera or want to skip:
1. The camera will still work but you can test with any visible image
2. Or modify the code temporarily to accept file uploads

8. Click **"Submit Proof"**
9. ✅ Loading spinner appears: "Verifying..."
10. Wait for AI verification (mock verification, instant response)
11. ✅ Success screen should appear:
    - Green checkmark icon
    - "Impact Verified! ✨"
    - Message: "Amazing! You earned [X] impact points! 🎉"
    - Your submitted photo displayed
12. Click **"Return to Quest Hub"**

### Step 6: Check Updated Stats
1. Navigate to dashboard homepage
2. ✅ Stats should be updated:
   - Impact Points: Should show earned points
   - Quests Completed: Should be 1
   - Level: Should increase if enough points
   - Stage: May still be Seedling (needs 100 pts for Sprout)

### Step 7: View My Garden
1. Click **"My Garden"** in sidebar
2. ✅ Should see `/dashboard/garden` page
3. View updated garden:
   - Large emoji for current stage
   - Stats cards showing:
     - Level (based on points ÷ 50)
     - Total Impact Points
     - Quests Completed
     - Member Since date
   - Progress bar to next stage
   - All growth stages displayed
   - Current stage should be highlighted

### Step 8: Complete More Quests
1. Return to **Browse Quests**
2. Complete more quests to progress through stages:
   - 🌱 Seedling: 0-100 points
   - 🌿 Sprout: 100-300 points
   - 🌳 Tree: 300-600 points
   - 🌲 Forest: 600+ points
3. Watch your garden grow! 🌱→🌿→🌳→🌲

---

## 🔍 What to Look For (Success Criteria)

### ✅ Admin Features Working
- [ ] Can view dashboard with accurate stats
- [ ] Can see all quests in table
- [ ] Can filter quests (all/active/inactive)
- [ ] Can toggle quest active status
- [ ] Can edit quest and see changes saved
- [ ] Can create new quest via form
- [ ] Can delete quest with confirmation
- [ ] Edit quest page loads with pre-filled data
- [ ] Quest appears in user browse page after creation

### ✅ User Features Working
- [ ] Dashboard shows personalized stats
- [ ] Can browse quests with map
- [ ] Map markers appear correctly
- [ ] Category filters work
- [ ] Quest detail page loads correctly
- [ ] Camera opens and captures photo
- [ ] Photo submission works
- [ ] Success/failure message displays
- [ ] Stats update after quest completion
- [ ] Garden page shows growth progress
- [ ] Level increases with points
- [ ] Stage emoji changes at milestones

### ✅ Navigation & UI
- [ ] Sidebar navigation works on both admin and user sides
- [ ] Mobile hamburger menu works
- [ ] Role badges display correctly
- [ ] Logout works and returns to login
- [ ] Can switch between admin and user roles
- [ ] All buttons have hover effects
- [ ] Loading spinners show during async operations
- [ ] Error messages display if something fails

---

## 🐛 Known Issues to Check

### MongoDB Connection
- If you see "IP not whitelisted" error:
  1. Go to MongoDB Atlas
  2. Network Access → Add IP Address
  3. Add your current IP or use `0.0.0.0/0` (for testing only!)

### WalletConnect Warnings
- **Issue:** Console shows "403 Forbidden" for WalletConnect
- **Fix:** Get a project ID from https://cloud.walletconnect.com/
- **Impact:** Wallet connection still works, just cosmetic warnings

### Camera Access
- **Desktop:** Chrome/Edge work best
- **Mobile:** Should work on Safari (iOS) and Chrome (Android)
- **HTTPS:** Camera requires HTTPS in production (localhost is exempt)

### AI Verification
- Currently using **mock verification** (always approves)
- To enable real AI:
  1. Add OpenAI API key to `.env.local`
  2. Implement OpenAI Vision API in `/api/submit-proof/route.ts`

---

## 📊 Sample Test Data

### Test Quest Details
```javascript
// Quest 1: Beach Cleanup
{
  title: "Beach Cleanup at Juhu",
  location: [72.8263, 19.0896],
  address: "Juhu Beach, Mumbai, Maharashtra",
  points: 50,
  category: "cleanup"
}

// Quest 2: Tree Planting
{
  title: "Plant Trees in Aarey Forest",
  location: [72.8777, 19.2183],
  address: "Aarey Colony, Mumbai, Maharashtra",
  points: 75,
  category: "planting"
}
```

### Point Milestones
- **Level 1:** 0-49 points
- **Level 2:** 50-99 points
- **Level 3:** 100-149 points
- **Seedling Stage:** 0-99 points (🌱)
- **Sprout Stage:** 100-299 points (🌿)
- **Tree Stage:** 300-599 points (🌳)
- **Forest Stage:** 600+ points (🌲)

---

## 🎬 Video Walkthrough Checklist

If recording a demo:
1. ✅ Show landing page
2. ✅ Connect wallet
3. ✅ Login as admin
4. ✅ Create a quest
5. ✅ Show quest in table
6. ✅ Edit the quest
7. ✅ Logout and login as user
8. ✅ Browse quests on map
9. ✅ Open quest detail
10. ✅ Take photo and submit
11. ✅ Show success message
12. ✅ Check updated dashboard stats
13. ✅ View My Garden progression

---

## 🚨 Troubleshooting

### Server Won't Start
```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

### Database Connection Issues
```bash
# Check .env.local exists and has MONGODB_URI
cat .env.local

# Test connection by running seed script
MONGODB_URI="your_uri_here" node scripts/seedQuests.js
```

### No Quests Showing
```bash
# Re-seed the database
MONGODB_URI="mongodb+srv://..." node scripts/seedQuests.js
```

### Role Not Persisting
```javascript
// Clear localStorage in browser console
localStorage.clear()
// Then login again
```

---

## 📝 Testing Checklist Summary

### Critical Paths
- [ ] Admin can create and manage quests
- [ ] User can browse and view quests
- [ ] User can submit quest proof with photo
- [ ] Points are awarded correctly
- [ ] Dashboard stats update in real-time
- [ ] Garden progression works

### Edge Cases
- [ ] What happens with no quests?
- [ ] What happens if photo submission fails?
- [ ] Can user submit same quest multiple times?
- [ ] Does inactive quest show to users? (Should not)
- [ ] Navigation between roles works smoothly

---

## 🎉 Success!

If all the above tests pass, your ImpactQuest app is **fully functional** and ready for:
- Hackathon demo
- User testing
- Production deployment (with real AI and security added)

---

**Happy Testing! 🚀**

Built with 💚 for a better planet 🌍
