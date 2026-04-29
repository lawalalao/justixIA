// POST /api/stripe/checkout
// body: { plan: 'pro' | 'studio' | 'team' }
// Crée une Checkout Session Stripe et renvoie l'URL.

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const BodySchema = z.object({ plan: z.enum(['pro', 'studio', 'team']) });

const PRICE_BY_PLAN = {
  pro: () => env.pricePro,
  studio: () => env.priceStudio,
  team: () => env.priceTeam,
} as const;

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const priceId = PRICE_BY_PLAN[parsed.data.plan]();
  if (!priceId) return NextResponse.json({ error: 'Plan not configured' }, { status: 503 });

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  // Re-use existing customer if known.
  const sb = supabaseAdmin();
  const { data: profile } = await sb.from('profiles').select('stripe_customer_id').eq('clerk_user_id', userId).single();

  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : email,
    client_reference_id: userId,
    success_url: `${env.appUrl}/dashboard?upgraded=1`,
    cancel_url: `${env.appUrl}/pricing`,
    allow_promotion_codes: true,
    metadata: { clerk_user_id: userId, plan: parsed.data.plan },
  });

  return NextResponse.json({ url: session.url });
}
