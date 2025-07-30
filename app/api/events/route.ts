import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events, ticketTiers } from '@/lib/database/schema';
import { getCurrentUser, requireOrganizer } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const user = await requireOrganizer();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      location,
      address,
      startDate,
      endDate,
      image,
      tags,
      ticketTypes
    } = body;

    // Validation
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
    }
    if (!description?.trim()) {
      return NextResponse.json({ error: 'Event description is required' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: 'Event category is required' }, { status: 400 });
    }
    if (!location?.trim()) {
      return NextResponse.json({ error: 'Event location is required' }, { status: 400 });
    }
    if (!startDate) {
      return NextResponse.json({ error: 'Start date is required' }, { status: 400 });
    }
    if (!endDate) {
      return NextResponse.json({ error: 'End date is required' }, { status: 400 });
    }
    if (new Date(endDate) <= new Date(startDate)) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }
    if (!ticketTypes || ticketTypes.length === 0) {
      return NextResponse.json({ error: 'At least one ticket type is required' }, { status: 400 });
    }

    // Create event
    const [event] = await db
      .insert(events)
      .values({
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        address: address?.trim() || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        image: image?.trim() || null, // Image is now optional
        organizerId: user.id,
        isPublished: true, // Events are now published by default
        type: 'in-person',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Create ticket tiers
    const ticketTierPromises = ticketTypes.map(async (ticketType: any) => {
      const [tier] = await db
        .insert(ticketTiers)
        .values({
          eventId: event.id,
          name: ticketType.name,
          description: ticketType.description || '',
          price: ticketType.price,
          quantity: ticketType.quantity,
          soldQuantity: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return tier;
    });

    const createdTicketTiers = await Promise.all(ticketTierPromises);

    return NextResponse.json({
      message: 'Event created successfully',
      event: {
        ...event,
        ticketTiers: createdTicketTiers
      }
    });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions = [eq(events.isPublished, true)];
    
    if (category) {
      whereConditions.push(eq(events.category, category));
    }

    const allEvents = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        category: events.category,
        location: events.location,
        startDate: events.startDate,
        endDate: events.endDate,
        image: events.image,
        isPublished: events.isPublished,
        createdAt: events.createdAt
      })
      .from(events)
      .where(and(...whereConditions))
      .orderBy(events.startDate);

    const totalEvents = allEvents.length;
    const paginatedEvents = allEvents.slice(offset, offset + limit);

    return NextResponse.json({
      events: paginatedEvents,
      pagination: {
        page,
        limit,
        total: totalEvents,
        pages: Math.ceil(totalEvents / limit)
      }
    });
  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching events' },
      { status: 500 }
    );
  }
} 