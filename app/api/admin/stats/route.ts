import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events, users, tickets, ticketTiers } from '@/lib/database/schema';
import { count, sum, desc, gte } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    
    // Get total events
    const totalEvents = await db.select({ count: count() }).from(events);
    
    // Get total users
    const totalUsers = await db.select({ count: count() }).from(users);
    
    // Get total tickets sold
    const totalTickets = await db.select({ count: count() }).from(tickets);
    
    // Get total revenue
    const totalRevenue = await db.select({ 
      sum: sum(ticketTiers.price) 
    }).from(ticketTiers);
    
    // Get upcoming events (events starting in next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingEvents = await db.select({ count: count() })
      .from(events)
      .where(gte(events.startDate, new Date()));
    
    return NextResponse.json({
      totalEvents: totalEvents[0]?.count || 0,
      totalTickets: totalTickets[0]?.count || 0,
      totalRevenue: parseFloat(totalRevenue[0]?.sum || '0'),
      upcomingEvents: upcomingEvents[0]?.count || 0
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
} 