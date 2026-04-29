import OpenAI from 'openai';
import { env } from './env';

let _client: OpenAI | null = null;
export function openai(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: env.openaiKey });
  return _client;
}

export const MODEL_CHAT = 'gpt-4o';
export const MODEL_TRANSCRIBE = 'whisper-1';
