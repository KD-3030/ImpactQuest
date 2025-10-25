# Reward System Implementation Progress

## ✅ Completed (Steps 1-3)

### 1. MongoDB Models Updated
- **User Model**: Added `rewardTokens`, `discountRate`, `totalRewardsEarned`
- **Quest Model**: Added `creatorAddress`, `creatorRewardAmount`, `completionCount`
- **Submission Model**: Added `rewardTokensEarned`
- **New Models Created**:
  - `RewardTransaction`: Tracks all reward earnings
  - `LocalShop`: Stores shop information for redemptions
  - `Redemption`: Tracks token redemptions for discounts

### 2. Reward Calculation Logic (`lib/rewards.ts`)
- Stage-based rewards:
  - Seedling: 10% discount, 1 token/quest
  - Sprout: 15% discount, 2 tokens/quest, +10 upgrade bonus
  - Tree: 20% discount, 3 tokens/quest, +20 upgrade bonus
  - Forest: 25% discount, 5 tokens/quest, +50 upgrade bonus
- Creator rewards: 5% of quest points (min 1, max 10 tokens)
- Discount calculations and token redemption logic

### 3. Submit Proof Route Updated
- Automatic reward distribution on quest completion
- Stage upgrade bonuses
- Creator rewards when quest completed
- Real-time event emissions for rewards
- Updated response includes full reward details

### 4. Quest Creation Updated
- Captures `creatorAddress` when quest is created
- Sets up future creator rewards

## 🚧 In Progress (Steps 4-10)

### Next Steps:
1. Create Rewards API endpoints (/api/rewards)
2. Create Shops API endpoints (/api/shops)
3. Create Redemption API endpoints (/api/redemptions)
4. Build Rewards Dashboard UI component
5. Build Shop/Marketplace UI component
6. Integrate real-time updates
7. Add rewards section to user dashboard
8. Test complete flow

## Reward System Flow

```
User Completes Quest
    ↓
Submit Proof API
    ↓
AI Verification
    ↓
Calculate Rewards:
  - Quest Tokens (1-5 based on stage)
  - Stage Upgrade Bonus (if stage changes)
  - Update Discount Rate (10-25%)
    ↓
Store Reward Transaction
    ↓
Reward Creator (5% of quest points)
    ↓
Emit Real-time Events
    ↓
Return Response with Rewards
```

## Discount Redemption Flow

```
User Views Shops
    ↓
Select Shop & Enter Purchase Amount
    ↓
Calculate Discount:
  - Discount Rate based on Stage
  - Discount Amount = Purchase × Rate
  - Tokens Required = Discount Amount
    ↓
Validate Token Balance
    ↓
Create Redemption Record
    ↓
Deduct Tokens from User
    ↓
Generate Redemption Code
    ↓
User Shows Code at Shop
    ↓
Shop Marks Redemption Complete
```

## API Endpoints Needed

### Rewards
- `GET /api/rewards` - Get user's reward transactions
- `GET /api/rewards/summary` - Get rewards summary

### Shops
- `GET /api/shops` - List all shops
- `GET /api/shops/[id]` - Get shop details
- `POST /api/admin/shops` - Create shop (admin only)
- `PUT /api/admin/shops/[id]` - Update shop (admin only)

### Redemptions
- `POST /api/redemptions` - Create new redemption
- `GET /api/redemptions` - Get user's redemptions
- `GET /api/redemptions/[id]` - Get redemption details
- `PUT /api/redemptions/[id]/complete` - Mark redemption complete (shop owner)

## UI Components Needed

### User Dashboard
1. **Rewards Card**: Shows tokens, discount rate, next upgrade
2. **Recent Rewards**: List of recent reward transactions
3. **Shops Button**: Navigate to marketplace

### Marketplace Page
1. **Shops List**: Grid of local shops with filtering
2. **Shop Card**: Name, category, location, accepts tokens badge
3. **Shop Details Modal**: Full info, redemption interface

### Redemption Interface
1. **Calculator**: Enter amount, see discount preview
2. **Confirm Button**: Creates redemption
3. **Redemption Code Display**: QR code + text code
4. **Active Redemptions**: List with status

## Real-time Events

- `reward_earned`: When user earns tokens
- `stage_upgraded`: When user reaches new stage
- `creator_rewarded`: When creator earns tokens
- `redemption_created`: When user redeems tokens
- `redemption_completed`: When shop confirms redemption

## Next Implementation Phase

Continue with creating the API routes and UI components...
