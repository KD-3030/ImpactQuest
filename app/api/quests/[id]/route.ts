import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Quest } from '@/models';
import { cache } from '@/lib/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const quest = await Quest.findById(params.id);

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quest,
    });
  } catch (error: any) {
    console.error('Error fetching quest:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();

    const quest = await Quest.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true, runValidators: true }
    );

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    // Invalidate quest cache
    cache.invalidatePattern('quests:');

    return NextResponse.json({
      success: true,
      quest,
    });
  } catch (error: any) {
    console.error('Error updating quest:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const quest = await Quest.findByIdAndDelete(params.id);

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    // Invalidate quest cache
    cache.invalidatePattern('quests:');

    return NextResponse.json({
      success: true,
      message: 'Quest deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting quest:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
