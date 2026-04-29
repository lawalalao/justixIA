// POST /api/chat
// Streaming GPT-4o pour le client/juge IA. Le caller fournit le caseId et l'historique.
// Pour la démo (non-authentifié), on accepte casId=cons-licenciement-demo seulement.

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { openai, MODEL_CHAT } from '@/lib/openai';
import { getCaseById } from '@/lib/cases/seed';
import { buildClientSystem, buildJudgeSystem, buildOpposingCounselSystem } from '@/lib/prompts/personas';

export const runtime = 'nodejs';

const BodySchema = z.object({
  caseId: z.string().min(1).max(64),
  speaker: z.enum(['client', 'judge', 'opposing']).default('client'),
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(4000) }))
    .max(60),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return new Response('Bad request', { status: 400 });
  const { caseId, speaker, messages } = parsed.data;

  const caseDef = getCaseById(caseId);
  if (!caseDef) return new Response('Unknown case', { status: 404 });

  // Demo case: open access. Anything else: require auth.
  const { userId } = auth();
  if (!caseDef.is_demo && !userId) return new Response('Unauthorized', { status: 401 });

  // Build system prompt depending on speaker.
  let system: string;
  if (speaker === 'client') {
    if (!caseDef.client_persona_prompt) {
      // Fallback: build a minimal persona from the case summary.
      system = buildClientSystem(
        `Tu joues le client décrit ci-après. Tu ne donnes pas toi-même de conseil juridique. Tu réponds en 2-3 phrases.\n\nCas: ${caseDef.summary}`,
      );
    } else {
      system = buildClientSystem(caseDef.client_persona_prompt);
    }
  } else if (speaker === 'judge') {
    system = buildJudgeSystem(
      caseDef.judge_persona_prompt ??
        'Tu présides l\'audience. Tu es neutre, concis, autoritaire.',
      caseDef.title,
    );
  } else {
    system = buildOpposingCounselSystem(
      caseDef.opposing_counsel_prompt ??
        'Tu plaides pour la partie adverse. Tu cites textes et jurisprudence.',
      caseDef.title,
    );
  }

  const stream = await openai().chat.completions.create({
    model: MODEL_CHAT,
    stream: true,
    temperature: 0.8,
    max_tokens: 350,
    messages: [{ role: 'system', content: system }, ...messages],
  });

  // Re-stream as plain text chunks (Server-Sent style).
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
