import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { groupPayments, groupPaymentContributions, users, events, ticketTiers } from '@/lib/database/schema';
import { getCurrentUser } from '@/lib/auth';
import { createStripeCheckoutSession } from '@/lib/stripe';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email } = await request.json();
    const groupPaymentId = params.id;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Fetch group payment details
    const groupPayment = await db
      .select()
      .from(groupPayments)
      .where(eq(groupPayments.id, groupPaymentId))
      .limit(1);

    if (groupPayment.length === 0) {
      return NextResponse.json(
        { error: 'Group payment not found' },
        { status: 404 }
      );
    }

    // Check if group payment is still pending
    if (groupPayment[0].status !== 'pending') {
      return NextResponse.json(
        { error: 'Group payment is no longer accepting contributions' },
        { status: 400 }
      );
    }

    // Check if email already contributed
    const existingContribution = await db
      .select()
      .from(groupPaymentContributions)
      .where(and(
        eq(groupPaymentContributions.group_payment_id, groupPaymentId),
        eq(groupPaymentContributions.contributor_email, email)
      ))
      .limit(1);

    if (existingContribution.length > 0) {
      return NextResponse.json(
        { error: 'This email has already contributed to this group payment' },
        { status: 400 }
      );
    }

    // Get event and ticket tier details for Stripe
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, groupPayment[0].event_id))
      .limit(1);

    const ticketTier = await db
      .select()
      .from(ticketTiers)
      .where(eq(ticketTiers.id, groupPayment[0].ticket_tier_id))
      .limit(1);

    if (event.length === 0 || ticketTier.length === 0) {
      return NextResponse.json(
        { error: 'Event or ticket tier not found' },
        { status: 404 }
      );
    }

    // Create contribution record
    const [contribution] = await db
      .insert(groupPaymentContributions)
      .values({
        group_payment_id: groupPaymentId,
        contributor_id: currentUser.id,
        contributor_email: email,
        amount: (Number(groupPayment[0].total_amount) / groupPayment[0].total_quantity).toString(),
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    // Create Stripe checkout session for the contribution
    const session = await createStripeCheckoutSession({
      eventId: groupPayment[0].event_id,
      ticketTierId: groupPayment[0].ticket_tier_id,
      quantity: 1,
      customerEmail: email,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/group-payment/${groupPaymentId}?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/group-payment/${groupPaymentId}?canceled=true`,
      ticketPrice: Number(groupPayment[0].total_amount) / groupPayment[0].total_quantity,
      eventTitle: event[0].title,
      splitPayment: false,
      groupPaymentId: groupPaymentId,
      contributionId: contribution.id,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      contributionId: contribution.id,
    });
  } catch (error) {
    console.error('Group payment invite error:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
} 