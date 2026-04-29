// POST /api/stt — transcription audio via Whisper.
// multipart/form-data: file=<audio blob>

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { openai, MODEL_TRANSCRIBE } from '@/lib/openai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    // Démo: on tolère la transcription si l'origine est /demo (best-effort).
    const referer = req.headers.get('referer') ?? '';
    if (!referer.endsWith('/demo')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: 'File too large' }, { status: 413 });

  const transcription = await openai().audio.transcriptions.create({
    file,
    model: MODEL_TRANSCRIBE,
    language: 'fr',
  });

  return NextResponse.json({ text: transcription.text });
}
