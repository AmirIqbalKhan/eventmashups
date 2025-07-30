import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events } from '@/lib/database/schema';
import { getCurrentUser, requireOrganizer } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await requireOrganizer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizerEvents = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        category: events.category,
        isPublished: events.isPublished,
        createdAt: events.createdAt
      })
      .from(events)
      .where(eq(events.organizerId, user.id))
      .orderBy(desc(events.createdAt));

    const eventsWithStats = organizerEvents.map(event => ({
      ...event,
      ticketSales: 0, // TODO: Add ticket sales calculation
      revenue: 0 // TODO: Add revenue calculation
    }));

    return NextResponse.json(eventsWithStats);
  } catch (error) {
    console.error('Organizer events error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching events' },
      { status: 500 }
    );
  }
} 