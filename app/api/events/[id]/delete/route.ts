import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events } from '@/lib/database/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only organizers and admins can delete events
    if (!user.isOrganizer && !user.isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const eventId = params.id;

    // Check if event exists
    const existingEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (existingEvent.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const event = existingEvent[0];

    // Organizers can only delete their own events, admins can delete any event
    if (user.isOrganizer && !user.isAdmin && event.organizerId !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own events' }, { status: 403 });
    }

    // Delete the event
    await db
      .delete(events)
      .where(eq(events.id, eventId));

    return NextResponse.json({ 
      message: 'Event deleted successfully',
      eventId: eventId 
    });
  } catch (error) {
    console.error('Event deletion error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the event' },
      { status: 500 }
    );
  }
} 