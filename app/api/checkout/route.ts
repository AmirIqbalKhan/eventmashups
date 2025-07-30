import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events, ticketTiers, groupPayments, groupPaymentContributions } from '@/lib/database/schema';
import { getCurrentUser } from '@/lib/auth';
import { createStripeCheckoutSession } from '@/lib/stripe';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { eventId, ticketTierId, quantity = 1, splitPayment = false } = await request.json();

    // Validate input
    if (!eventId || !ticketTierId || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch event and ticket tier
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const ticketTier = await db
      .select()
      .from(ticketTiers)
      .where(eq(ticketTiers.id, ticketTierId))
      .limit(1);

    if (ticketTier.length === 0) {
      return NextResponse.json(
        { error: 'Ticket tier not found' },
        { status: 404 }
      );
    }

    // Check ticket availability
    const availableTickets = ticketTier[0].quantity - (ticketTier[0].soldQuantity ?? 0);
    if (availableTickets < quantity) {
      return NextResponse.json(
        { error: 'Not enough tickets available' },
        { status: 400 }
      );
    }

    if (splitPayment && quantity > 1) {
      // Handle group payment
      return await handleGroupPayment(event[0], ticketTier[0], quantity, currentUser);
    } else {
      // Handle regular payment
      return await handleRegularPayment(event[0], ticketTier[0], quantity, currentUser);
    }
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

async function handleGroupPayment(event: any, ticketTier: any, quantity: number, currentUser: any) {
  const totalAmount = Number(ticketTier.price) * quantity;

  const [groupPayment] = await db
    .insert(groupPayments)
    .values({
      event_id: event.id,
      ticket_tier_id: ticketTier.id,
      total_quantity: quantity,
      total_amount: totalAmount.toString(),
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  // For the first contribution, we'll let the user specify their amount
  // For now, we'll create a minimal contribution record and redirect to group payment page
  const [contribution] = await db
    .insert(groupPaymentContributions)
    .values({
      group_payment_id: groupPayment.id,
      contributor_id: currentUser.id,
      contributor_email: currentUser.email,
      amount: '0', // Will be updated when user specifies amount
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  // Redirect to group payment page where user can specify their contribution amount
  return NextResponse.json({
    groupPaymentId: groupPayment.id,
    type: 'group',
    totalAmount,
    totalQuantity: quantity,
    ticketPrice: Number(ticketTier.price),
    eventTitle: event.title,
  });
}

async function handleRegularPayment(event: any, ticketTier: any, quantity: number, currentUser: any) {
  // Create Stripe checkout session
  const session = await createStripeCheckoutSession({
    eventId: event.id,
    ticketTierId: ticketTier.id,
    quantity,
    customerEmail: currentUser.email,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}?canceled=true`,
    ticketPrice: Number(ticketTier.price),
    eventTitle: event.title,
    splitPayment: false,
  });

  return NextResponse.json({
    sessionId: session.id,
    url: session.url,
    type: 'regular',
  });
} 