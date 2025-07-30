import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events, users, ticketTiers } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    // Fetch event with organizer details
    const event = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        image: events.image,
        category: events.category,
        location: events.location,
        address: events.address,
        latitude: events.latitude,
        longitude: events.longitude,
        startDate: events.startDate,
        endDate: events.endDate,
        type: events.type,
        joinLink: events.joinLink,
        maxAttendees: events.maxAttendees,
        allowResale: events.allowResale,
        allowSplitPayments: events.allowSplitPayments,
        organizerId: events.organizerId,
        organizerFirstName: users.firstName,
        organizerLastName: users.lastName,
        organizerEmail: users.email,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Fetch ticket tiers for this event
    const tiers = await db
      .select({
        id: ticketTiers.id,
        name: ticketTiers.name,
        description: ticketTiers.description,
        price: ticketTiers.price,
        quantity: ticketTiers.quantity,
        soldQuantity: ticketTiers.soldQuantity,
        isActive: ticketTiers.isActive,
      })
      .from(ticketTiers)
      .where(eq(ticketTiers.eventId, eventId))
      .orderBy(ticketTiers.price);

    // Calculate aggregated values
    const totalTickets = tiers.reduce((sum, tier) => sum + Number(tier.quantity), 0);
    const soldTickets = tiers.reduce((sum, tier) => sum + Number(tier.soldQuantity), 0);
    const prices = tiers.map(tier => Number(tier.price)).filter(price => price > 0);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Transform ticket tiers to match frontend expectations
    const tickets = tiers.map(tier => ({
      id: tier.id,
      name: tier.name,
      description: tier.description || '',
      price: Number(tier.price),
      available: Number(tier.quantity) - Number(tier.soldQuantity),
      total: Number(tier.quantity),
    }));

    // Create event object matching frontend expectations
    const eventData = {
      event: {
        id: event[0].id,
        title: event[0].title,
        description: event[0].description,
        image: event[0].image,
        category: event[0].category,
        location: event[0].location,
        address: event[0].address,
        startDate: event[0].startDate,
        endDate: event[0].endDate,
        lowestPrice,
        highestPrice,
        organizerName: `${event[0].organizerFirstName || ''} ${event[0].organizerLastName || ''}`.trim(),
        organizerEmail: event[0].organizerEmail,
        ticketCount: totalTickets,
        soldTickets,
        tags: [], // Add tags if you have them in your schema
      },
      tickets,
    };

    return NextResponse.json(eventData);
  } catch (error) {
    console.error('Event fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
} 