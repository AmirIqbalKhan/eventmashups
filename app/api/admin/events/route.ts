import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events, users } from '@/lib/database/schema';
import { getCurrentUser, requireAdmin } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allEvents = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        category: events.category,
        isPublished: events.isPublished,
        createdAt: events.createdAt,
        organizer: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email
        }
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .orderBy(desc(events.createdAt));

    const eventsWithOrganizer = allEvents.map(event => ({
      id: event.id,
      title: event.title,
      organizerName: event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : 'Unknown',
      startDate: event.startDate,
      status: event.isPublished ? 'published' : 'draft',
      ticketSales: 0, // TODO: Add ticket sales calculation
      location: event.location,
      category: event.category
    }));

    return NextResponse.json(eventsWithOrganizer);
  } catch (error) {
    console.error('Admin events error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching events' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, action } = await request.json();

    if (!eventId || !action) {
      return NextResponse.json(
        { error: 'Event ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const isPublished = action === 'approve';

    await db
      .update(events)
      .set({ isPublished })
      .where(eq(events.id, eventId));

    return NextResponse.json({ 
      message: `Event ${action === 'approve' ? 'approved' : 'rejected'} successfully` 
    });
  } catch (error) {
    console.error('Admin event update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating event' },
      { status: 500 }
    );
  }
} 