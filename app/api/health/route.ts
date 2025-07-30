import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events, users } from '@/lib/database/schema';

export async function GET() {
  try {
    // Test database connection by counting events and users
    const eventCount = await db.select().from(events);
    const userCount = await db.select().from(users);
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      events: eventCount.length,
      users: userCount.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 