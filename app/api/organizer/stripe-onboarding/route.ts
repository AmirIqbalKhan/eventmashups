import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { users } from '@/lib/database/schema';
import { verifyToken, requireOrganizer } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const user = await requireOrganizer();
    // Create Stripe Connect account if not exists
    let connectAccountId = user.stripeConnectAccountId;
    if (!connectAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: { transfers: { requested: true } },
      });
      connectAccountId = account.id;
      await db.update(users).set({ stripeConnectAccountId: connectAccountId }).where(eq(users.id, user.id));
    }
    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: connectAccountId,
      refresh_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard',
      return_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard',
      type: 'account_onboarding',
    });
    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 