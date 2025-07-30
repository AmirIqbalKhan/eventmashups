import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export interface CheckoutSessionParams {
  eventId: string;
  ticketTierId: string;
  quantity: number;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  ticketPrice: number;
  eventTitle: string;
  splitPayment?: boolean;
  groupPaymentId?: string;
  contributionId?: string;
}

export async function createStripeCheckoutSession(params: CheckoutSessionParams) {
  const { 
    eventId, 
    ticketTierId, 
    quantity, 
    customerEmail, 
    successUrl, 
    cancelUrl, 
    ticketPrice, 
    eventTitle, 
    splitPayment = false,
    groupPaymentId,
    contributionId
  } = params;

  const sessionConfig: any = {
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${eventTitle} - Ticket`,
            description: `Ticket for ${eventTitle}`,
          },
          unit_amount: Math.round(ticketPrice * 100), // Convert to cents
        },
        quantity,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: {
      eventId,
      ticketTierId,
      quantity: quantity.toString(),
      splitPayment: splitPayment.toString(),
      ...(groupPaymentId && { groupPaymentId }),
      ...(contributionId && { contributionId }),
    },
  };

  const session = await stripe.checkout.sessions.create(sessionConfig);
  return session;
}

export function verifyWebhookSignature(payload: string, signature: string) {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    throw new Error('Invalid webhook signature');
  }
} 