import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { tickets, events } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user's tickets with event information
    const userTickets = await db.select({
      id: tickets.id,
      eventTitle: events.title,
      eventDate: events.startDate,
      status: tickets.status,
      qrCode: tickets.qrCode
    })
    .from(tickets)
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(eq(tickets.currentOwnerId, user.id))
    .orderBy(events.startDate);
    
    return NextResponse.json(userTickets);
  } catch (error) {
    console.error('My tickets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
} 