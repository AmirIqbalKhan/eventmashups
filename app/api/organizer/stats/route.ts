import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events, tickets, ticketTiers } from '@/lib/database/schema';
import { requireOrganizer } from '@/lib/auth';
import { eq, and, sum, count, gte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await requireOrganizer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Get organizer's events with real data
    const organizerEvents = await db
      .select({
        id: events.id,
        title: events.title,
        startDate: events.startDate,
        endDate: events.endDate,
        isPublished: events.isPublished
      })
      .from(events)
      .where(eq(events.organizerId, user.id));

    // Get ticket sales data
    const ticketSales = await db
      .select({
        eventId: tickets.eventId,
        ticketsSold: count(tickets.id),
        revenue: sum(ticketTiers.price)
      })
      .from(tickets)
      .leftJoin(ticketTiers, eq(tickets.ticketTierId, ticketTiers.id))
      .where(eq(tickets.buyerId, user.id))
      .groupBy(tickets.eventId);

    // Calculate totals
    const totalEvents = organizerEvents.length;
    const totalTickets = ticketSales.reduce((sum, sale) => sum + (Number(sale.ticketsSold) || 0), 0);
    const totalRevenue = ticketSales.reduce((sum, sale) => sum + (Number(sale.revenue) || 0), 0);
    const upcomingEvents = organizerEvents.filter(event => 
      new Date(event.startDate) > now && event.isPublished
    ).length;

    // Get top performing events
    const topEvents = await db
      .select({
        title: events.title,
        ticketsSold: count(tickets.id),
        revenue: sum(ticketTiers.price)
      })
      .from(events)
      .leftJoin(tickets, eq(events.id, tickets.eventId))
      .leftJoin(ticketTiers, eq(tickets.ticketTierId, ticketTiers.id))
      .where(eq(events.organizerId, user.id))
      .groupBy(events.id, events.title)
      .orderBy(desc(count(tickets.id)))
      .limit(5);

    // Calculate monthly growth (simplified)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastMonthEvents = organizerEvents.filter(event => 
      new Date(event.startDate) >= lastMonth
    ).length;

    const monthlyGrowth = {
      events: lastMonthEvents > 0 ? Math.round(((totalEvents - lastMonthEvents) / lastMonthEvents) * 100) : 0,
      tickets: 0, // Would need more complex calculation
      revenue: 0 // Would need more complex calculation
    };

    return NextResponse.json({
      totalEvents,
      totalTickets,
      totalRevenue,
      upcomingEvents,
      monthlyGrowth,
      topEvents: topEvents.map(event => ({
        title: event.title,
        tickets: Number(event.ticketsSold) || 0,
        revenue: Number(event.revenue) || 0
      }))
    });
  } catch (error) {
    console.error('Organizer stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizer statistics' },
      { status: 500 }
    );
  }
} 