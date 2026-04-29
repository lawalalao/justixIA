// POST /api/stripe/webhook
// Met à jour profiles.plan / stripe_customer_id selon les events Stripe.

import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

function planFromPriceId(priceId: string | null | undefined): 'pro' | 'studio' | 'team' | null {
  if (!priceId) return null;
  if (priceId === env.pricePro) return 'pro';
  if (priceId === env.priceStudio) return 'studio';
  if (priceId === env.priceTeam) return 'team';
  return null;
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  const buf = await req.text();
  let evt: Stripe.Event;
  try {
    evt = stripe().webhooks.constructEvent(buf, sig, env.stripeWebhookSecret);
  } catch (e) {
    return NextResponse.json({ error: `Webhook signature failed: ${(e as Error).message}` }, { status: 400 });
  }

  const sb = supabaseAdmin();

  switch (evt.type) {
    case 'checkout.session.completed': {
      const session = evt.data.object;
      const clerkUserId = (session.metadata?.clerk_user_id ?? session.client_reference_id) as string | undefined;
      const customerId = typeof session.customer === 'string' ? session.customer : null;
      if (clerkUserId && customerId) {
        await sb.from('profiles').upsert(
          { clerk_user_id: clerkUserId, stripe_customer_id: customerId },
          { onConflict: 'clerk_user_id' },
        );
      }
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = evt.data.object;
      const customerId = typeof sub.customer === 'string' ? sub.customer : null;
      const priceId = sub.items.data[0]?.price?.id ?? null;
      const plan = planFromPriceId(priceId);
      if (customerId && plan) {
        await sb.from('profiles').update({ plan }).eq('stripe_customer_id', customerId);
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = evt.data.object;
      const customerId = typeof sub.customer === 'string' ? sub.customer : null;
      if (customerId) {
        await sb.from('profiles').update({ plan: 'free' }).eq('stripe_customer_id', customerId);
      }
      break;
    }
    default:
      // Other events ignored for now.
      break;
  }

  return NextResponse.json({ received: true });
}
