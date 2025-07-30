import QRCode from 'qrcode';

export const generateQRCode = async (ticketId: string): Promise<string> => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(ticketId, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const generateUniqueTicketId = (): string => {
  return `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}; 