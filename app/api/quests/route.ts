import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Quest } from '@/models';
import realtimeManager, { REALTIME_EVENTS } from '@/lib/realtime';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '10000'; // 10km default

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

    const quests = await Quest.find(query).sort({ createdAt: -1 }).limit(50);

    return NextResponse.json({
      success: true,
      quests,
      count: quests.length,
    });
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
    const { title, description, coordinates, address, category, impactPoints, verificationPrompt } = body;

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
    });

    // Emit real-time event for quest creation
    realtimeManager.emit(REALTIME_EVENTS.QUEST_CREATED, {
      quest: quest.toObject(),
      timestamp: Date.now(),
    });

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
