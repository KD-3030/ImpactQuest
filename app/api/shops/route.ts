import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LocalShop } from '@/models';

// GET /api/shops - Get all active shops
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '50000'; // 50km default
    const category = searchParams.get('category');

    let query: any = { isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // If location provided, find nearby shops
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

    const shops = await LocalShop.find(query).sort({ createdAt: -1 }).limit(100);

    return NextResponse.json({
      success: true,
      shops,
      count: shops.length,
    });
  } catch (error: any) {
    console.error('Error fetching shops:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
