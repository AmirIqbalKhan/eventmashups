import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTicketConfirmationEmail = async ({
  to,
  eventTitle,
  eventDate,
  eventLocation,
  ticketTierName,
  qrCodeDataUrl,
  ticketId,
}: {
  to: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketTierName: string;
  qrCodeDataUrl: string;
  ticketId: string;
}) => {
  try {
    await resend.emails.send({
      from: 'Event Mashups <tickets@eventmashups.com>',
      to: [to],
      subject: `Your ticket for ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">🎫 Your Ticket Confirmation</h1>
          <h2>${eventTitle}</h2>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
          <p><strong>Ticket Type:</strong> ${ticketTierName}</p>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <img src="${qrCodeDataUrl}" alt="QR Code" style="max-width: 200px;" />
            <p style="font-size: 12px; color: #666;">Scan this QR code at the event entrance</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Event Details</h3>
            <p>Please arrive 15 minutes before the event starts. Bring a valid ID and this ticket.</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you have any questions, please contact us at support@eventmashups.com
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending ticket confirmation email:', error);
    throw error;
  }
};

export const sendTransferNotificationEmail = async ({
  to,
  eventTitle,
  fromUserName,
  transferType,
}: {
  to: string;
  eventTitle: string;
  fromUserName: string;
  transferType: 'internal' | 'external';
}) => {
  try {
    await resend.emails.send({
      from: 'Event Mashups <transfers@eventmashups.com>',
      to: [to],
      subject: `Ticket transfer for ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">🎫 Ticket Transfer Notification</h1>
          <p>${fromUserName} has transferred a ticket to you for:</p>
          <h2>${eventTitle}</h2>
          <p><strong>Transfer Type:</strong> ${transferType === 'internal' ? 'Internal Transfer' : 'External Resale'}</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>You will receive your ticket details shortly.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending transfer notification email:', error);
    throw error;
  }
}; 