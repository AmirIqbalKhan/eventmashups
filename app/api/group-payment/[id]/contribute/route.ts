import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { groupPayments, groupPaymentContributions, users, events, ticketTiers } from '@/lib/database/schema';
import { getCurrentUser } from '@/lib/auth';
import { createStripeCheckoutSession } from '@/lib/stripe';
import { eq } from 'drizzle-orm';

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

    const { amount } = await request.json();
    const groupPaymentId = params.id;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
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

    // Calculate total contributed so far
    const existingContributions = await db
      .select()
      .from(groupPaymentContributions)
      .where(eq(groupPaymentContributions.group_payment_id, groupPaymentId));

    const totalContributed = existingContributions
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const remainingAmount = Number(groupPayment[0].total_amount) - totalContributed;

    // Check if contribution amount is valid
    if (amount > remainingAmount) {
      return NextResponse.json(
        { error: `Contribution amount cannot exceed remaining amount of ${remainingAmount}` },
        { status: 400 }
      );
    }

    // Check if user already contributed
    const existingContribution = existingContributions.find(c => c.contributor_id === currentUser.id);
    if (existingContribution) {
      return NextResponse.json(
        { error: 'You have already contributed to this group payment' },
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
        contributor_email: currentUser.email,
        amount: amount.toString(),
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
      customerEmail: currentUser.email,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/group-payment/${groupPaymentId}?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/group-payment/${groupPaymentId}?canceled=true`,
      ticketPrice: amount,
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
    console.error('Group payment contribution error:', error);
    return NextResponse.json(
      { error: 'Failed to create contribution' },
      { status: 500 }
    );
  }
} 