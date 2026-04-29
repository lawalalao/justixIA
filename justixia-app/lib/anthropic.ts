import Anthropic from '@anthropic-ai/sdk';
import { env } from './env';

let _client: Anthropic | null = null;
export function anthropic(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: env.anthropicKey });
  return _client;
}

// Default to Opus 4.7 — the most capable Claude model.
// If we ever need to drop chat cost on high-volume persona turns, swap
// MODEL_CHAT to 'claude-sonnet-4-6' (same API surface, ~70% cheaper).
export const MODEL_CHAT = 'claude-opus-4-7';
export const MODEL_GRADER = 'claude-opus-4-7';
