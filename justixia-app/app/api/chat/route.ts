// POST /api/chat
// Streaming Claude (Opus 4.7) for the client/judge/opposing-counsel personas.
// The caller provides caseId + speaker + history. The demo case is open;
// every other case requires Clerk auth.

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
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

  // Anthropic Messages API streaming. Personas are conversational — no thinking
  // needed (faster, cheaper, less monologue). Adaptive thinking is off by
  // default on Opus 4.7 when the `thinking` field is absent.
  const stream = anthropic().messages.stream({
    model: MODEL_CHAT,
    max_tokens: 600,
    system,
    messages: messages as Anthropic.Messages.MessageParam[],
  });

  // Bridge the SDK's text iterator into a Web ReadableStream that Next.js
  // can return raw to the client.
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const text of stream.textStream) {
          controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        controller.error(err);
        return;
      }
      controller.close();
    },
    cancel() {
      // Client disconnected — abort the upstream Anthropic request.
      stream.controller.abort();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
