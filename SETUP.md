# 🚀 ImpactQuest Setup Guide

This guide will walk you through setting up ImpactQuest from scratch.

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] A code editor (VS Code recommended)
- [ ] Git installed (optional, for version control)

## 🔧 Step-by-Step Setup

### Step 1: Install Dependencies

The dependencies are already installed! If you need to reinstall:

```bash
npm install
```

### Step 2: Set Up MongoDB Atlas (Free Tier)

1. **Create Account**:
   - Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create Cluster**:
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select a cloud provider and region (closest to you)
   - Click "Create Cluster"

3. **Configure Database Access**:
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these!)
   - Set privileges to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**:
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ For production, restrict to specific IPs
   - Click "Confirm"

5. **Get Connection String**:
   - Go back to "Database" view
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<database>` with `impactquest`

Example:
```
mongodb+srv://myuser:mypassword123@cluster0.abcde.mongodb.net/impactquest?retryWrites=true&w=majority
```

### Step 3: Set Up WalletConnect

1. **Create Project**:
   - Go to [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)
   - Sign in with GitHub or email
   - Click "Create New Project"
   - Name it "ImpactQuest"
   - Select "App" as project type

2. **Get Project ID**:
   - Click on your new project
   - Copy the "Project ID" (looks like: `abc123def456...`)

### Step 4: Configure Environment Variables

1. **Create .env.local file**:
```bash
cp .env.example .env.local
```

2. **Edit .env.local**:
Open the file and replace the placeholders:

```env
# Your MongoDB connection string from Step 2
MONGODB_URI=mongodb+srv://myuser:mypassword123@cluster0.abcde.mongodb.net/impactquest?retryWrites=true&w=majority

# Your WalletConnect Project ID from Step 3
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123def456ghi789jkl012mno345pq

# Optional: For future AI verification
OPENAI_API_KEY=sk-your_key_here

# Keep this as is for local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Seed Sample Data (Optional)

Add sample quests to your database:

```bash
npm run seed
```

You should see output like:
```
✅ Connected to MongoDB
✅ Cleared existing quests
✅ Successfully created 5 quests:
   1. Beach Cleanup at Juhu (+50 pts)
   2. Plant Trees in Aarey Forest (+75 pts)
   ...
```

### Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 🎮 Testing the App

### 1. Connect Your Wallet

- Click "Connect Wallet to Start Questing"
- Choose your wallet (MetaMask, Coinbase Wallet, etc.)
- Switch to **Celo Alfajores Testnet** in your wallet
- Approve the connection

**Get Testnet CELO**:
- Go to [https://faucet.celo.org/alfajores](https://faucet.celo.org/alfajores)
- Paste your wallet address
- Request test tokens

### 2. Browse Quests

- You'll be redirected to the Quest Hub
- See quests on the map and in the list
- Click on any quest to view details

### 3. Complete a Quest

- Click "Open Camera" to capture a photo
- Take a photo as proof
- Click "Submit Proof"
- Watch your impact points grow! 🌱

### 4. Check Your Garden

- Click "My Garden" tab
- See your level, points, and current stage
- Track your progression from Seedling → Sprout → Tree → Forest

## 🛠️ Customization

### Add Your Own Quests

Edit `scripts/seedQuests.js` and add your quest:

```javascript
{
  title: 'Your Quest Title',
  description: 'What needs to be done',
  location: {
    type: 'Point',
    coordinates: [longitude, latitude], // Get from Google Maps
    address: 'Your Location',
  },
  category: 'cleanup', // cleanup, planting, recycling, education, other
  impactPoints: 50,
  verificationPrompt: 'What to capture in the photo',
  isActive: true,
}
```

Then run: `npm run seed`

### Change Map Center

Edit `components/QuestMap.tsx`:

```typescript
const defaultCenter: [number, number] = [19.0760, 72.8777]; // [lat, lng]
```

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check your MongoDB connection string in `.env.local`
- Verify your IP is whitelisted in MongoDB Atlas Network Access
- Ensure your MongoDB user has correct permissions

### "Invalid Project ID"
- Check your WalletConnect Project ID is correct
- Make sure it's prefixed with `NEXT_PUBLIC_`
- Restart the dev server after changing .env.local

### "Camera not working"
- Grant camera permissions in your browser
- Use HTTPS in production (localhost works for testing)
- Try a different browser

### "Map not loading"
- Check browser console for errors
- Verify `react-leaflet` and `leaflet` are installed
- Clear browser cache and reload

## 📱 Building for Production

```bash
# Build the app
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Important for Production:
- Set `NEXT_PUBLIC_APP_URL` to your actual domain
- Restrict MongoDB Network Access to specific IPs
- Enable HTTPS for camera access
- Set up proper error logging

## 📚 Next Steps

- [ ] Integrate real AI verification with OpenAI Vision API
- [ ] Deploy smart contract for ERC20 tokens on Celo
- [ ] Add admin panel for quest management
- [ ] Implement social features and leaderboards
- [ ] Create Local Perks system for businesses
- [ ] Add push notifications

## 💡 Tips

- Keep your `.env.local` file secure and never commit it
- Test on Celo Alfajores testnet before mainnet
- Use browser dev tools to debug issues
- Check the Next.js documentation for advanced features

## 🆘 Need Help?

- Check the [Next.js docs](https://nextjs.org/docs)
- Review [MongoDB Atlas docs](https://docs.atlas.mongodb.com/)
- Read [RainbowKit docs](https://www.rainbowkit.com/docs/introduction)
- Open an issue on GitHub

---

Happy building! 🌱✨
