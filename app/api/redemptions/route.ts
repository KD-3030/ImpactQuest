import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, LocalShop, Redemption, RewardTransaction } from '@/models';
import {
  calculateDiscountAmount,
  calculateFinalAmount,
  calculateTokensForPurchase,
  canRedeemTokens,
  generateRedemptionCode,
} from '@/lib/rewards';
import realtimeManager from '@/lib/realtime';

// GET /api/redemptions - Get user's redemptions
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');
    const status = searchParams.get('status');

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    let query: any = { walletAddress: walletAddress.toLowerCase() };
    if (status) {
      query.status = status;
    }

    const redemptions = await Redemption.find(query)
      .populate('shopId', 'name category location imageUrl')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      redemptions,
      count: redemptions.length,
    });
  } catch (error: any) {
    console.error('Error fetching redemptions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/redemptions - Create new redemption
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { walletAddress, shopId, purchaseAmount } = body;

    // Validate required fields
    if (!walletAddress || !purchaseAmount) {
      return NextResponse.json(
        { success: false, error: 'Wallet address and purchase amount are required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get shop if provided
    let shop = null;
    if (shopId) {
      shop = await LocalShop.findById(shopId);
      if (!shop || !shop.isActive) {
        return NextResponse.json(
          { success: false, error: 'Shop not found or inactive' },
          { status: 404 }
        );
      }
    }

    // Calculate discount and tokens needed
    const discountRate = user.discountRate;
    const discountAmount = calculateDiscountAmount(purchaseAmount, discountRate);
    const finalAmount = calculateFinalAmount(purchaseAmount, discountRate);
    const tokensRequired = calculateTokensForPurchase(purchaseAmount, discountRate);

    // Check if user has enough tokens
    if (!canRedeemTokens(user.rewardTokens, tokensRequired)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient tokens',
          required: tokensRequired,
          available: user.rewardTokens,
        },
        { status: 400 }
      );
    }

    // Generate redemption code
    const redemptionCode = generateRedemptionCode();

    // Create redemption
    const redemption = await Redemption.create({
      userId: user._id,
      walletAddress: walletAddress.toLowerCase(),
      shopId: shop?._id,
      tokensRedeemed: tokensRequired,
      discountRate,
      purchaseAmount,
      discountAmount,
      finalAmount,
      status: 'pending',
      redemptionCode,
    });

    // Deduct tokens from user
    user.rewardTokens -= tokensRequired;
    user.updatedAt = new Date();
    await user.save();

    // Create reward transaction for redemption
    await RewardTransaction.create({
      userId: user._id,
      walletAddress: walletAddress.toLowerCase(),
      type: 'redemption',
      amount: -tokensRequired, // Negative amount for redemption
      discountRate,
      description: `Redeemed ${tokensRequired} tokens for ${discountRate}% discount on ${purchaseAmount} cUSD purchase`,
    });

    // Emit real-time event
    realtimeManager.emit('redemption_created', {
      walletAddress: walletAddress.toLowerCase(),
      redemption: redemption.toObject(),
      tokensRedeemed: tokensRequired,
      discountAmount,
      timestamp: Date.now(),
    });

    // Call oracle to record redemption on blockchain
    let blockchainResult = null;
    try {
      // Always call oracle - let it handle registration errors
      const oracleResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oracle/record-redemption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: walletAddress,
          tokensSpent: tokensRequired,
          shopName: shop?.name || 'Direct Redemption',
        }),
      });

      const oracleData = await oracleResponse.json();
      
      if (oracleData.success) {
        blockchainResult = {
          success: true,
          transactionHash: oracleData.transactionHash,
          blockNumber: oracleData.blockNumber,
          gasUsed: oracleData.gasUsed,
        };
        console.log('✅ Blockchain transaction successful:', oracleData.transactionHash);
      } else {
        blockchainResult = {
          success: false,
          error: oracleData.error,
          details: oracleData.details,
          registrationNeeded: false,
          message: '',
        };
        // Check if user needs to register
        if (oracleData.error?.includes('not registered')) {
          blockchainResult.registrationNeeded = true;
          blockchainResult.message = 'User not registered on blockchain. Please register first.';
        }
        console.error('❌ Blockchain redemption failed:', oracleData.error);
      }
    } catch (oracleError: any) {
      console.error('❌ Error calling redemption oracle:', oracleError.message);
      blockchainResult = {
        success: false,
        error: 'oracle_error',
        message: oracleError.message,
      };
    }

    // Populate shop info before returning
    if (shopId) {
      await redemption.populate('shopId', 'name category location imageUrl');
    }

    return NextResponse.json({
      success: true,
      redemption,
      remainingTokens: user.rewardTokens,
      blockchain: blockchainResult, // Include blockchain transaction info
    });
  } catch (error: any) {
    console.error('Error creating redemption:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
