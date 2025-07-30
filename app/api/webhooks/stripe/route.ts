import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/database';
import { tickets, events, ticketTiers, users, groupPayments, groupPaymentContributions } from '@/lib/database/schema';
import { verifyWebhookSignature } from '@/lib/stripe';
import { generateQRCode, generateUniqueTicketId } from '@/lib/qr-code';
import { sendTicketConfirmationEmail } from '@/lib/email';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    const { eventId, ticketTierId, quantity, splitPayment, groupPaymentId, contributionId } = session.metadata;
    
    if (groupPaymentId && contributionId) {
      // Handle group payment contribution
      await handleGroupPaymentContribution(session, groupPaymentId, contributionId);
    } else {
      // Handle regular payment
      await handleRegularPayment(session, eventId, ticketTierId, quantity);
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handleGroupPaymentContribution(session: any, groupPaymentId: string, contributionId: string) {
  try {
    // Update contribution status to completed
    await db
      .update(groupPaymentContributions)
      .set({ 
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent,
        updated_at: new Date()
      })
      .where(eq(groupPaymentContributions.id, contributionId));

    // Check if all contributions are completed and total amount is reached
    const allContributions = await db
      .select()
      .from(groupPaymentContributions)
      .where(eq(groupPaymentContributions.group_payment_id, groupPaymentId));

    const completedContributions = allContributions.filter(c => c.status === 'completed');
    const totalContributed = completedContributions.reduce((sum, c) => sum + Number(c.amount), 0);

    const groupPayment = await db
      .select()
      .from(groupPayments)
      .where(eq(groupPayments.id, groupPaymentId))
      .limit(1);

    if (groupPayment.length > 0 && totalContributed >= Number(groupPayment[0].total_amount)) {
      // Total amount reached - allocate tickets
      await allocateGroupPaymentTickets(groupPayment[0], completedContributions);
      
      // Update group payment status to completed
      await db
        .update(groupPayments)
        .set({ 
          status: 'completed',
          updated_at: new Date()
        })
        .where(eq(groupPayments.id, groupPaymentId));
    }

    console.log(`Group payment contribution completed for ${contributionId}. Total contributed: ${totalContributed}`);
  } catch (error) {
    console.error('Error handling group payment contribution:', error);
  }
}

async function allocateGroupPaymentTickets(groupPayment: any, contributions: any[]) {
  try {
    // Get event and ticket tier details
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, groupPayment.event_id))
      .limit(1);

    const ticketTier = await db
      .select()
      .from(ticketTiers)
      .where(eq(ticketTiers.id, groupPayment.ticket_tier_id))
      .limit(1);

    if (event.length === 0 || ticketTier.length === 0) {
      console.error('Event or ticket tier not found for group payment');
      return;
    }

    // Create tickets for each contributor
    for (const contribution of contributions) {
      if (contribution.status === 'completed') {
        const ticketId = generateUniqueTicketId();
        const qrCodeDataUrl = await generateQRCode(ticketId);

        await db.insert(tickets).values({
          eventId: groupPayment.event_id,
          ticketTierId: groupPayment.ticket_tier_id,
          buyerId: contribution.contributor_id,
          currentOwnerId: contribution.contributor_id,
          qrCode: qrCodeDataUrl,
          stripePaymentIntentId: contribution.stripe_payment_intent_id,
          stripeSessionId: groupPayment.stripe_session_id,
        });

        // Update sold quantity
        await db.update(ticketTiers)
          .set({ soldQuantity: (ticketTier[0].soldQuantity ?? 0) + 1 })
          .where(eq(ticketTiers.id, groupPayment.ticket_tier_id));

        // Send confirmation email
        await sendTicketConfirmationEmail({
          to: contribution.contributor_email,
          eventTitle: event[0].title,
          eventDate: event[0].startDate.toLocaleDateString(),
          eventLocation: event[0].location,
          ticketTierName: ticketTier[0].name,
          qrCodeDataUrl,
          ticketId,
        });
      }
    }

    console.log(`Allocated ${contributions.length} tickets for group payment ${groupPayment.id}`);
  } catch (error) {
    console.error('Error allocating group payment tickets:', error);
  }
}

async function handleRegularPayment(session: any, eventId: string, ticketTierId: string, quantity: number) {
  try {
    // Get event and ticket tier details
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    const ticketTier = await db
      .select()
      .from(ticketTiers)
      .where(eq(ticketTiers.id, ticketTierId))
      .limit(1);

    // Get user from customer email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.customer_email))
      .limit(1);

    if (event.length === 0 || ticketTier.length === 0 || user.length === 0) {
      console.error('Missing event, ticket tier, or user data');
      return;
    }

    // Create tickets for the quantity purchased
    for (let i = 0; i < parseInt(quantity.toString()); i++) {
      const ticketId = generateUniqueTicketId();
      const qrCodeDataUrl = await generateQRCode(ticketId);

      await db.insert(tickets).values({
        eventId: eventId,
        ticketTierId: ticketTierId,
        buyerId: user[0].id,
        currentOwnerId: user[0].id,
        qrCode: qrCodeDataUrl,
        stripePaymentIntentId: session.payment_intent,
        stripeSessionId: session.id,
      });

      // Update sold quantity
      await db.update(ticketTiers)
        .set({ soldQuantity: (ticketTier[0].soldQuantity ?? 0) + 1 })
        .where(eq(ticketTiers.id, ticketTierId));

      // Send confirmation email
      await sendTicketConfirmationEmail({
        to: user[0].email,
        eventTitle: event[0].title,
        eventDate: event[0].startDate.toLocaleDateString(),
        eventLocation: event[0].location,
        ticketTierName: ticketTier[0].name,
        qrCodeDataUrl,
        ticketId,
      });
    }

    console.log(`Created ${quantity} tickets for event ${eventId}`);
  } catch (error) {
    console.error('Error handling regular payment:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  // Handle any additional payment success logic
  console.log('Payment intent succeeded:', paymentIntent.id);
} 