// POST /api/tts — génère un audio MP3 via ElevenLabs.
// body: { text: string, voice: VoiceKey }

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { tts, VOICES } from '@/lib/elevenlabs';

export const runtime = 'nodejs';

const BodySchema = z.object({
  text: z.string().min(1).max(2000),
  voice: z.enum(Object.keys(VOICES) as [keyof typeof VOICES]),
  allowDemo: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return new Response('Bad request', { status: 400 });

  // Sans compte: TTS autorisé uniquement avec allowDemo=true.
  const { userId } = auth();
  if (!userId && !parsed.data.allowDemo) return new Response('Unauthorized', { status: 401 });

  try {
    const audio = await tts(parsed.data.text, parsed.data.voice);
    return new Response(audio, {
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return new Response((e as Error).message, { status: 502 });
  }
}
