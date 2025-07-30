import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events } from '@/lib/database/schema';
import { getCurrentUser, requireOrganizer } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireOrganizer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    if (!['publish', 'unpublish'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "publish" or "unpublish"' },
        { status: 400 }
      );
    }

    const isPublished = action === 'publish';

    // Update the event status, ensuring the user owns the event
    await db
      .update(events)
      .set({ isPublished })
      .where(and(
        eq(events.id, params.id),
        eq(events.organizerId, user.id)
      ));

    return NextResponse.json({ 
      message: `Event ${action === 'publish' ? 'published' : 'unpublished'} successfully` 
    });
  } catch (error) {
    console.error('Organizer event status update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating event status' },
      { status: 500 }
    );
  }
} 