import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { users, events, tickets } from '@/lib/database/schema';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || '';
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get user and their interests
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, payload.userId),
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const interests = user.interests || [];
    // Get event IDs the user already attended or bought tickets for
    const userTickets = await db.query.tickets.findMany({
      where: (tickets, { eq }) => eq(tickets.buyerId, user.id),
    });
    const attendedEventIds = userTickets.map((t) => t.eventId);
    // Recommend events matching interests
    const allMatching = await db.query.events.findMany({
      where: (events, { eq, or, and }) =>
        and(
          or(...interests.map((i: string) => eq(events.category, i))),
          eq(events.isPublished, true)
        ),
      limit: 20,
    });
    // Filter out already attended events
    const recommended = allMatching.filter(e => !attendedEventIds.includes(e.id)).slice(0, 6);
    return NextResponse.json({ events: recommended });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 