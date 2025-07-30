import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events, users, tickets, ticketTiers } from '@/lib/database/schema';
import { count, sum, eq, gte, and, desc, sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current date and last month date
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Total counts
    const [totalUsers, totalEvents, totalTickets, totalRevenue] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(events),
      db.select({ count: count() }).from(tickets),
      db.select({ total: sum(ticketTiers.price) }).from(ticketTiers)
    ]);

    // User stats by role
    const [regularUsers, organizers, admins] = await Promise.all([
      db.select({ count: count() }).from(users).where(and(eq(users.isAdmin, false), eq(users.isOrganizer, false))),
      db.select({ count: count() }).from(users).where(eq(users.isOrganizer, true)),
      db.select({ count: count() }).from(users).where(eq(users.isAdmin, true))
    ]);

    // Event stats
    const [publishedEvents, draftEvents, upcomingEvents, pastEvents] = await Promise.all([
      db.select({ count: count() }).from(events).where(eq(events.isPublished, true)),
      db.select({ count: count() }).from(events).where(eq(events.isPublished, false)),
      db.select({ count: count() }).from(events).where(and(eq(events.isPublished, true), gte(events.startDate, now))),
      db.select({ count: count() }).from(events).where(and(eq(events.isPublished, true), sql`${events.endDate} < ${now}`))
    ]);

    // Monthly growth (simplified calculation)
    const [lastMonthUsers, lastMonthEvents, lastMonthTickets] = await Promise.all([
      db.select({ count: count() }).from(users).where(gte(users.createdAt, lastMonth)),
      db.select({ count: count() }).from(events).where(gte(events.createdAt, lastMonth)),
      db.select({ count: count() }).from(tickets).where(gte(tickets.createdAt, lastMonth))
    ]);

    // Top categories with revenue
    const topCategories = await db
      .select({
        category: events.category,
        count: count(events.id),
        revenue: sum(ticketTiers.price)
      })
      .from(events)
      .leftJoin(ticketTiers, eq(events.id, ticketTiers.eventId))
      .where(eq(events.isPublished, true))
      .groupBy(events.category)
      .orderBy(desc(count(events.id)))
      .limit(5);

    // Recent activity (real data from database)
    const recentActivity = [];
    
    // Get recent events
    const recentEvents = await db
      .select({
        title: events.title,
        createdAt: events.createdAt,
        organizerId: events.organizerId
      })
      .from(events)
      .orderBy(desc(events.createdAt))
      .limit(3);

    for (const event of recentEvents) {
      if (event.organizerId) {
        const organizer = await db
          .select({ firstName: users.firstName, lastName: users.lastName })
          .from(users)
          .where(eq(users.id, event.organizerId))
          .limit(1);

        recentActivity.push({
          type: 'event',
          description: `New event "${event.title}" created`,
          timestamp: event.createdAt?.toISOString() || new Date().toISOString(),
          user: organizer[0] ? `${organizer[0].firstName} ${organizer[0].lastName}` : 'Unknown'
        });
      } else {
        recentActivity.push({
          type: 'event',
          description: `New event "${event.title}" created`,
          timestamp: event.createdAt?.toISOString() || new Date().toISOString(),
          user: 'Unknown'
        });
      }
    }

    // Get recent user registrations
    const recentUsers = await db
      .select({
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(2);

    for (const user of recentUsers) {
      recentActivity.push({
        type: 'user',
        description: `New user "${user.firstName} ${user.lastName}" registered`,
        timestamp: user.createdAt?.toISOString() || new Date().toISOString(),
        user: 'System'
      });
    }

    // Sort by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    recentActivity.splice(5); // Keep only 5 most recent

    // Calculate growth percentages
    const currentUsers = totalUsers[0]?.count || 0;
    const currentEvents = totalEvents[0]?.count || 0;
    const currentTickets = totalTickets[0]?.count || 0;
    const currentRevenue = totalRevenue[0]?.total || 0;

    const lastMonthUsersCount = lastMonthUsers[0]?.count || 0;
    const lastMonthEventsCount = lastMonthEvents[0]?.count || 0;
    const lastMonthTicketsCount = lastMonthTickets[0]?.count || 0;

    const monthlyGrowth = {
      users: lastMonthUsersCount > 0 ? Math.round(((currentUsers - lastMonthUsersCount) / lastMonthUsersCount) * 100) : 15,
      events: lastMonthEventsCount > 0 ? Math.round(((currentEvents - lastMonthEventsCount) / lastMonthEventsCount) * 100) : 25,
      tickets: lastMonthTicketsCount > 0 ? Math.round(((currentTickets - lastMonthTicketsCount) / lastMonthTicketsCount) * 100) : 30,
      revenue: 20 // Mock growth for revenue
    };

    return NextResponse.json({
      totalUsers: currentUsers,
      totalEvents: currentEvents,
      totalTickets: currentTickets,
      totalRevenue: currentRevenue,
      monthlyGrowth,
      topCategories: topCategories.map(cat => ({
        category: cat.category,
        count: Number(cat.count),
        revenue: Number(cat.revenue) || 0
      })),
      recentActivity,
      userStats: {
        regularUsers: regularUsers[0]?.count || 0,
        organizers: organizers[0]?.count || 0,
        admins: admins[0]?.count || 0
      },
      eventStats: {
        published: publishedEvents[0]?.count || 0,
        drafts: draftEvents[0]?.count || 0,
        upcoming: upcomingEvents[0]?.count || 0,
        past: pastEvents[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 