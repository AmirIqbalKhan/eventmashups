import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { tickets, events, users } from '@/lib/database/schema';

export async function POST(request: NextRequest) {
  try {
    const { ticketId, qrCode } = await request.json();
    let ticket;
    if (ticketId) {
      ticket = await db.query.tickets.findFirst({
        where: (tickets, { eq }) => eq(tickets.id, ticketId),
        with: { event: true, currentOwner: true },
      });
    } else if (qrCode) {
      ticket = await db.query.tickets.findFirst({
        where: (tickets, { eq }) => eq(tickets.qrCode, qrCode),
        with: { event: true, currentOwner: true },
      });
    } else {
      return NextResponse.json({ error: 'Missing ticketId or qrCode' }, { status: 400 });
    }
    if (!ticket) {
      return NextResponse.json({ valid: false, error: 'Ticket not found' }, { status: 404 });
    }
    // Optionally, check if ticket is active and not refunded/cancelled
    const isValid = ticket.status === 'active' || ticket.status === 'external' || ticket.status === 'transferred';
    return NextResponse.json({
      valid: isValid,
      ticket: {
        id: ticket.id,
        status: ticket.status,
        event: ticket.event ? {
          id: ticket.event.id,
          title: ticket.event.title,
          startDate: ticket.event.startDate,
          location: ticket.event.location,
        } : null,
        owner: ticket.currentOwner ? {
          id: ticket.currentOwner.id,
          firstName: ticket.currentOwner.firstName,
          lastName: ticket.currentOwner.lastName,
        } : null,
      },
    });
  } catch (error) {
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 });
  }
} 