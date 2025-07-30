import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events } from '@/lib/database/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const featuredEvents = await db
      .select()
      .from(events)
      .orderBy(desc(events.createdAt))
      .limit(6);
    
    return NextResponse.json(featuredEvents);
  } catch (error) {
    console.error('Error fetching featured events:', error);
    return NextResponse.json({ error: 'Failed to fetch featured events' }, { status: 500 });
  }
} 