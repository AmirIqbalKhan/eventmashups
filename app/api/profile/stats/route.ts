import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events, tickets } from '@/lib/database/schema';
import { count, eq, gte } from 'drizzle-orm';
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
    
    // Get user's tickets
    const userTickets = await db.select({ count: count() })
      .from(tickets)
      .where(eq(tickets.currentOwnerId, user.id));
    
    // Get user's events (if they're an organizer)
    const userEvents = await db.select({ count: count() })
      .from(events)
      .where(eq(events.organizerId, user.id));
    
    // Get upcoming events user is attending
    const upcomingEvents = await db.select({ count: count() })
      .from(tickets)
      .innerJoin(events, eq(tickets.eventId, events.id))
      .where(eq(tickets.currentOwnerId, user.id))
      .where(gte(events.startDate, new Date()));
    
    // Calculate total spent (simplified - would need to join with ticket tiers for actual amounts)
    const totalSpent = userTickets[0]?.count * 50 || 0; // Placeholder calculation
    
    return NextResponse.json({
      totalEvents: userEvents[0]?.count || 0,
      totalTickets: userTickets[0]?.count || 0,
      totalRevenue: totalSpent,
      upcomingEvents: upcomingEvents[0]?.count || 0
    });
  } catch (error) {
    console.error('Profile stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile statistics' },
      { status: 500 }
    );
  }
} 