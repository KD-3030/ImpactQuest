# ✅ ImpactQuest Quick Start Checklist

Use this checklist to get your ImpactQuest app running in **15 minutes**!

---

## 📋 Pre-Setup (5 minutes)

- [ ] **Node.js 18+** installed
  ```bash
  node --version  # Should be 18.0.0 or higher
  ```

- [ ] **npm** installed
  ```bash
  npm --version   # Should be 8.0.0 or higher
  ```

- [ ] Dependencies installed
  ```bash
  npm install     # ✅ Already done!
  ```

---

## 🔧 MongoDB Atlas Setup (5 minutes)

- [ ] Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [ ] Create free account / Sign in
- [ ] Click "Build a Database"
- [ ] Select **FREE tier (M0)**
- [ ] Choose closest region
- [ ] Click "Create Cluster"
- [ ] Wait 1-3 minutes for cluster creation

### Database Access
- [ ] Go to "Database Access" in sidebar
- [ ] Click "Add New Database User"
- [ ] Choose "Password" method
- [ ] Set username (e.g., `impactquest`)
- [ ] Set password (e.g., `MySecurePassword123!`)
- [ ] **SAVE THESE CREDENTIALS!** 📝
- [ ] Set privileges to "Read and write to any database"
- [ ] Click "Add User"

### Network Access
- [ ] Go to "Network Access" in sidebar
- [ ] Click "Add IP Address"
- [ ] Click "Allow Access from Anywhere" (0.0.0.0/0)
- [ ] Click "Confirm"

### Get Connection String
- [ ] Go back to "Database" view
- [ ] Click "Connect" button on your cluster
- [ ] Choose "Connect your application"
- [ ] Copy connection string
- [ ] **Replace** `<password>` with your actual password
- [ ] **Replace** `<database>` with `impactquest`

**Example:**
```
mongodb+srv://impactquest:MySecurePassword123!@cluster0.abcd123.mongodb.net/impactquest?retryWrites=true&w=majority
```

---

## 🔗 WalletConnect Setup (2 minutes)

- [ ] Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [ ] Sign in with GitHub or email
- [ ] Click "Create New Project"
- [ ] Name it: `ImpactQuest`
- [ ] Select project type: **App**
- [ ] Click on your project
- [ ] Copy the **Project ID**
- [ ] **SAVE THIS ID!** 📝

**Example:**
```
abc123def456ghi789jkl012mno345pq
```

---

## ⚙️ Environment Configuration (1 minute)

- [ ] Create `.env.local` file:
  ```bash
  cp .env.example .env.local
  ```

- [ ] Open `.env.local` in your editor

- [ ] Paste your MongoDB connection string:
  ```env
  MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/impactquest?retryWrites=true&w=majority
  ```

- [ ] Paste your WalletConnect Project ID:
  ```env
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
  ```

- [ ] Keep the rest as is:
  ```env
  OPENAI_API_KEY=sk-optional_for_future
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```

- [ ] **Save the file**

---

## 🌱 Seed Sample Data (1 minute)

- [ ] Run the seed script:
  ```bash
  npm run seed
  ```

- [ ] You should see:
  ```
  ✅ Connected to MongoDB
  ✅ Cleared existing quests
  ✅ Successfully created 5 quests:
     1. Beach Cleanup at Juhu (+50 pts)
     2. Plant Trees in Aarey Forest (+75 pts)
     3. Recycle E-Waste Drive (+40 pts)
     4. Community Garden Maintenance (+35 pts)
     5. Street Cleanup Initiative (+45 pts)
  
  🎉 Database seeding complete!
  ```

---

## 🚀 Start the App (1 minute)

- [ ] Run development server:
  ```bash
  npm run dev
  ```

- [ ] You should see:
  ```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in XXXms
  ```

- [ ] Open browser to [http://localhost:3000](http://localhost:3000)

- [ ] You should see the **ImpactQuest landing page** 🎉

---

## 🔐 Test Wallet Connection (Optional)

### Setup MetaMask for Celo Alfajores Testnet

- [ ] Install [MetaMask](https://metamask.io/) extension

- [ ] Open MetaMask

- [ ] Click network dropdown (top left)

- [ ] Click "Add Network" → "Add network manually"

- [ ] Enter Celo Alfajores details:
  ```
  Network Name: Celo Alfajores Testnet
  RPC URL: https://alfajores-forno.celo-testnet.org
  Chain ID: 44787
  Currency Symbol: CELO
  Block Explorer: https://alfajores.celoscan.io
  ```

- [ ] Click "Save"

- [ ] Get testnet tokens from [Celo Faucet](https://faucet.celo.org/alfajores)

- [ ] On ImpactQuest landing page, click "Connect Wallet"

- [ ] Choose MetaMask

- [ ] Approve connection

- [ ] You should be redirected to **Quest Hub** 🎉

---

## ✅ Final Verification

Your app is working if you can:

- [ ] See the landing page at http://localhost:3000
- [ ] Connect your Celo wallet
- [ ] Get redirected to /quest-hub
- [ ] See 5 sample quests in the list
- [ ] See quest markers on the map
- [ ] Click "My Garden" and see your stats (Level 1, 0 points)
- [ ] Click on a quest to open details
- [ ] Click "Open Camera" (allow camera permissions)
- [ ] Capture a photo
- [ ] Submit proof
- [ ] See success message and earned points! 🎉

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check your connection string in .env.local
# Verify password doesn't contain special characters that need URL encoding
# Confirm IP whitelist includes 0.0.0.0/0 in MongoDB Atlas
```

### "Invalid Project ID" error
```bash
# Verify NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local
# Make sure there are no extra spaces or quotes
# Restart dev server: Ctrl+C then npm run dev
```

### "Quest list is empty"
```bash
# Re-run seed script:
npm run seed

# Check MongoDB Atlas:
# Go to "Browse Collections"
# You should see 'quests' collection with 5 documents
```

### "Map not loading"
```bash
# Clear browser cache
# Check browser console for errors
# Make sure you're not blocking OpenStreetMap domains
# Try different browser (Chrome, Firefox, Safari)
```

### "Camera not working"
```bash
# Grant camera permissions in browser
# Check browser address bar for camera icon
# Use HTTPS in production (localhost works fine)
# Try different browser
```

---

## 🎉 Success!

If you checked all the boxes above, congratulations! You now have:

✅ A fully functional gamified impact platform  
✅ Wallet connection with Celo blockchain  
✅ Interactive quest map with OpenStreetMap  
✅ Native camera capture for proof submission  
✅ MongoDB database with sample quests  
✅ Reputation system with evolving stages  
✅ User profile tracking impact points  

---

## 📚 Next Steps

Now that your app is running:

1. **Customize Quests**: Edit `scripts/seedQuests.js` with your own locations
2. **Test the Flow**: Complete a quest and watch your points grow
3. **Deploy**: Push to Vercel for live demo
4. **Integrate AI**: Add OpenAI Vision API for real verification
5. **Add Smart Contracts**: Deploy ERC20 tokens on Celo mainnet

---

## 📞 Need Help?

- 📖 Read [SETUP.md](./SETUP.md) for detailed instructions
- 🔄 Check [WORKFLOW.md](./WORKFLOW.md) for architecture diagrams
- 📊 Review [IMPLEMENTATION.md](./IMPLEMENTATION.md) for technical details
- 📝 See [README.md](./README.md) for project overview

---

**Happy Building! 🌱✨**

Built with 💚 on Celo
