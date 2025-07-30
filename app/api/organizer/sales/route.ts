import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events, tickets, ticketTiers } from '@/lib/database/schema';
import { requireOrganizer } from '@/lib/auth';
import { eq, and, sum, count, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await requireOrganizer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organizer's events with sales data
    const eventsWithSales = await db
      .select({
        eventId: events.id,
        eventTitle: events.title,
        startDate: events.startDate,
        endDate: events.endDate,
        ticketsSold: count(tickets.id),
        revenue: sum(ticketTiers.price)
      })
      .from(events)
      .leftJoin(tickets, eq(events.id, tickets.eventId))
      .leftJoin(ticketTiers, eq(tickets.ticketTierId, ticketTiers.id))
      .where(eq(events.organizerId, user.id))
      .groupBy(events.id, events.title, events.startDate, events.endDate);

    // Calculate totals
    const totalRevenue = eventsWithSales.reduce((sum, event) => sum + (Number(event.revenue) || 0), 0);
    const totalTickets = eventsWithSales.reduce((sum, event) => sum + (Number(event.ticketsSold) || 0), 0);
    const totalEvents = eventsWithSales.length;

    // Generate monthly sales data (last 6 months)
    const monthlySales = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      // Calculate sales for this month (simplified)
      const monthRevenue = eventsWithSales
        .filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate.getMonth() === month.getMonth() && eventDate.getFullYear() === month.getFullYear();
        })
        .reduce((sum, event) => sum + (Number(event.revenue) || 0), 0);
      
      const monthTickets = eventsWithSales
        .filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate.getMonth() === month.getMonth() && eventDate.getFullYear() === month.getFullYear();
        })
        .reduce((sum, event) => sum + (Number(event.ticketsSold) || 0), 0);

      monthlySales.push({
        month: monthName,
        revenue: monthRevenue,
        tickets: monthTickets
      });
    }

    return NextResponse.json({
      totalRevenue,
      totalTickets,
      totalEvents,
      salesByEvent: eventsWithSales.map(event => ({
        eventId: event.eventId,
        eventTitle: event.eventTitle,
        ticketsSold: Number(event.ticketsSold) || 0,
        revenue: Number(event.revenue) || 0,
        startDate: event.startDate,
        endDate: event.endDate
      })),
      monthlySales
    });
  } catch (error) {
    console.error('Organizer sales error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales data' },
      { status: 500 }
    );
  }
} 