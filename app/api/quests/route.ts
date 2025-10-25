import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Quest } from '@/models';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '10000'; // 10km default
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Check cache only for non-location queries on first page
    const cacheKey = lat && lng 
      ? `quests:nearby:${lat}:${lng}:${radius}:${limit}:${skip}`
      : `${CACHE_KEYS.QUESTS_ACTIVE}:${limit}:${skip}`;
    
    const cached = cache.get(cacheKey);
    if (cached && skip === 0) {
      console.log('Returning cached quests');
      return NextResponse.json(cached);
    }

    let query: any = { 
      isActive: true,
      status: { $ne: 'archived' } // Exclude archived quests
    };

    // If location provided, find nearby quests
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      };
    }

    // Use lean() for better performance and select only needed fields
    const quests = await Quest.find(query)
      .select('title description location category impactPoints isActive status completionCount blockchainQuestId createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count
    const total = await Quest.countDocuments(query);

    const response = {
      success: true,
      quests,
      count: quests.length,
      total,
      hasMore: skip + quests.length < total,
    };

    // Cache for 30 seconds
    cache.set(cacheKey, response, CACHE_TTL.SHORT);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching quests:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { 
      title, 
      description, 
      coordinates, 
      address, 
      category, 
      impactPoints, 
      verificationPrompt, 
      creatorAddress // Wallet address of admin creating the quest
    } = body;

    // Validate required fields
    if (!title || !description || !coordinates || !category || !impactPoints || !verificationPrompt) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const quest = await Quest.create({
      title,
      description,
      location: {
        type: 'Point',
        coordinates, // [longitude, latitude]
        address: address || 'Unknown location',
      },
      category,
      impactPoints,
      verificationPrompt,
      creatorAddress: creatorAddress?.toLowerCase(), // Store creator address for rewards
    });

    // Invalidate quest cache
    cache.invalidatePattern('quests:');

    return NextResponse.json({
      success: true,
      quest,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating quest:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
