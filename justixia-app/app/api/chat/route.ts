// POST /api/chat
// Streaming Claude (Opus 4.7) for the client/judge/opposing-counsel personas.
// The caller provides caseId + speaker + history. The demo case is open;
// every other case requires Clerk auth.

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import type Anthropic from '@anthropic-ai/sdk';
import { anthropic, MODEL_CHAT } from '@/lib/anthropic';
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

  // Build system prompt depending on the speaker the user wants to interact with.
  let system: string;
  if (speaker === 'client') {
    system = buildClientSystem(
      caseDef.client_persona_prompt ??
        `Tu joues le client décrit ci-après. Tu ne donnes pas toi-même de conseil juridique. Tu réponds en 2-3 phrases.\n\nCas: ${caseDef.summary}`,
    );
  } else if (speaker === 'judge') {
    system = buildJudgeSystem(
      caseDef.judge_persona_prompt ??
        "Tu présides l'audience. Tu es neutre, concis, autoritaire.",
      caseDef.title,
    );
  } else {
    system = buildOpposingCounselSystem(
      caseDef.opposing_counsel_prompt ??
        'Tu plaides pour la partie adverse. Tu cites textes et jurisprudence.',
      caseDef.title,
    );
  }

  const abortController = new AbortController();

  const stream = await anthropic().messages.create(
    {
      model: MODEL_CHAT,
      max_tokens: 600,
      system,
      messages: messages as Anthropic.Messages.MessageParam[],
      stream: true,
    },
    { signal: abortController.signal },
  );

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        controller.error(err);
        return;
      }
      controller.close();
    },
    cancel() {
      abortController.abort();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
