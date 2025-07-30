import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { tickets, users, ticketTransfers } from '@/lib/database/schema';
import { verifyToken } from '@/lib/auth';
import { generateQRCode, generateUniqueTicketId } from '@/lib/qr-code';
import { sendTransferNotificationEmail } from '@/lib/email';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || '';
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { ticketId, type, toEmail, resalePrice } = body;
    // Find the ticket
    const ticket = await db.query.tickets.findFirst({
      where: (tickets, { eq }) => eq(tickets.id, ticketId),
    });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    if (ticket.currentOwnerId !== payload.userId) {
      return NextResponse.json({ error: 'Not your ticket' }, { status: 403 });
    }
    if (type === 'internal') {
      // Internal transfer to another registered user
      const toUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, toEmail),
      });
      if (!toUser) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
      }
      // Update ticket owner
      await db.update(tickets)
        .set({ currentOwnerId: toUser.id, status: 'transferred' })
        .where(eq(tickets.id, ticketId));
      // Log transfer
      await db.insert(ticketTransfers).values({
        ticketId,
        fromUserId: payload.userId,
        toUserId: toUser.id,
        transferType: 'internal',
        status: 'completed',
      });
      // Notify recipient
      await sendTransferNotificationEmail({
        to: toUser.email,
        eventTitle: '', // Optionally fetch event title
        fromUserName: payload.email,
        transferType: 'internal',
      });
      return NextResponse.json({ success: true, message: 'Ticket transferred internally.' });
    } else if (type === 'external') {
      // External resale: generate new QR, mark as external, allow download
      const newTicketId = generateUniqueTicketId();
      const qrCode = await generateQRCode(newTicketId);
      await db.update(tickets)
        .set({
          qrCode,
          status: 'external',
          transferHistory: [
            ...((ticket.transferHistory as Array<{ fromUserId: string; toUserId: string; transferredAt: string }>) || []),
            { fromUserId: payload.userId, toUserId: '', transferredAt: new Date().toISOString() },
          ],
        })
        .where(eq(tickets.id, ticketId));
      await db.insert(ticketTransfers).values({
        ticketId,
        fromUserId: payload.userId,
        toUserId: '',
        transferType: 'external',
        transferPrice: resalePrice,
        status: 'pending',
      });
      // Optionally, email QR to seller for download
      return NextResponse.json({ success: true, qrCode });
    }
    return NextResponse.json({ error: 'Invalid transfer type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 