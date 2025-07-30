import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { groupPayments, groupPaymentContributions, events, ticketTiers } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupPaymentId = params.id;

    // Fetch group payment with event and ticket tier details
    const groupPayment = await db
      .select({
        id: groupPayments.id,
        event_id: groupPayments.event_id,
        ticket_tier_id: groupPayments.ticket_tier_id,
        total_quantity: groupPayments.total_quantity,
        total_amount: groupPayments.total_amount,
        amount_per_person: groupPayments.amount_per_person,
        status: groupPayments.status,
        created_at: groupPayments.created_at,
        updated_at: groupPayments.updated_at,
        event_title: events.title,
        event_image: events.image,
        event_startDate: events.startDate,
        event_location: events.location,
        ticket_tier_name: ticketTiers.name,
        ticket_tier_description: ticketTiers.description,
      })
      .from(groupPayments)
      .leftJoin(events, eq(groupPayments.event_id, events.id))
      .leftJoin(ticketTiers, eq(groupPayments.ticket_tier_id, ticketTiers.id))
      .where(eq(groupPayments.id, groupPaymentId))
      .limit(1);

    if (groupPayment.length === 0) {
      return NextResponse.json(
        { error: 'Group payment not found' },
        { status: 404 }
      );
    }

    // Fetch contributions for this group payment
    const contributions = await db
      .select({
        id: groupPaymentContributions.id,
        contributor_email: groupPaymentContributions.contributor_email,
        amount: groupPaymentContributions.amount,
        status: groupPaymentContributions.status,
        created_at: groupPaymentContributions.created_at,
      })
      .from(groupPaymentContributions)
      .where(eq(groupPaymentContributions.group_payment_id, groupPaymentId))
      .orderBy(groupPaymentContributions.created_at);

    const paymentData = {
      id: groupPayment[0].id,
      event_id: groupPayment[0].event_id,
      ticket_tier_id: groupPayment[0].ticket_tier_id,
      total_quantity: groupPayment[0].total_quantity,
      total_amount: Number(groupPayment[0].total_amount),
      amount_per_person: Number(groupPayment[0].amount_per_person),
      status: groupPayment[0].status,
      event: {
        title: groupPayment[0].event_title,
        image: groupPayment[0].event_image,
        startDate: groupPayment[0].event_startDate,
        location: groupPayment[0].event_location,
      },
      ticketTier: {
        name: groupPayment[0].ticket_tier_name,
        description: groupPayment[0].ticket_tier_description,
      },
      contributions: contributions.map(c => ({
        id: c.id,
        contributor_email: c.contributor_email,
        amount: Number(c.amount),
        status: c.status,
        created_at: c.created_at,
      })),
    };

    return NextResponse.json(paymentData);
  } catch (error) {
    console.error('Group payment fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group payment' },
      { status: 500 }
    );
  }
} 