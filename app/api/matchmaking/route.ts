import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { users, tickets, events } from '@/lib/database/schema';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || '';
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }
    // Get current user
    const currentUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, payload.userId),
    });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Get all users attending the event (excluding current user)
    const eventTickets = await db.query.tickets.findMany({
      where: (tickets, { eq, and, ne }) => and(eq(tickets.eventId, eventId), ne(tickets.buyerId, payload.userId)),
      with: {
        buyer: true,
      },
    });
    // Calculate match score based on shared interests
    const matches = eventTickets
      .map((ticket) => {
        const otherUser = ticket.buyer;
        if (!otherUser) return null;
        const shared = (currentUser.interests || []).filter((i: string) => (otherUser.interests || []).includes(i));
        return {
          user: {
            id: otherUser.id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            avatar: otherUser.avatar,
            bio: otherUser.bio,
            interests: otherUser.interests,
          },
          matchScore: shared.length,
          sharedInterests: shared,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b!.matchScore - a!.matchScore));
    return NextResponse.json({ matches });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 