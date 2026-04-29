import Stripe from 'stripe';
import { env } from './env';

let _client: Stripe | null = null;
export function stripe(): Stripe {
  if (!_client) _client = new Stripe(env.stripeSecret, { apiVersion: '2024-09-30.acacia' });
  return _client;
}
