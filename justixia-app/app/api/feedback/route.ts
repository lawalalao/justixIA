// POST /api/feedback
// Generates the Senior Associate report. Strict JSON via structured outputs.
// Adaptive thinking is on (high effort) — this is the deepest reasoning call
// in the product, runs once per session, and is worth the latency.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { anthropic, MODEL_GRADER } from '@/lib/anthropic';
import { getCaseById, SEED_CASES } from '@/lib/cases/seed';
import { SENIOR_GRADER_SYSTEM, SENIOR_GRADER_USER_TEMPLATE } from '@/lib/prompts/senior-grader';
import type { FeedbackReport } from '@/lib/types';

export const runtime = 'nodejs';

const BodySchema = z.object({
  caseId: z.string().min(1).max(64),
  transcript: z
    .array(z.object({ role: z.enum(['user', 'assistant']), speaker: z.string().optional(), content: z.string().max(4000) }))
    .min(2)
    .max(80),
});

// JSON Schema enforced server-side by Anthropic structured outputs.
// Note: numeric min/max are not part of Anthropic's schema enforcement —
// the system prompt instructs the model to stay in [0, 10]. We re-validate
// client-side as a defensive measure.
const FEEDBACK_SCHEMA = {
  type: 'object',
  properties: {
    qualification_score: { type: 'integer' },
    qualification_notes: { type: 'string' },
    strategy_score: { type: 'integer' },
    strategy_notes: { type: 'string' },
    communication_score: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
    communication_notes: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    global_score: { type: 'number' },
    strengths: { type: 'array', items: { type: 'string' } },
    improvements: { type: 'array', items: { type: 'string' } },
    references: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          article: { type: 'string' },
          url: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        },
        required: ['article', 'url'],
        additionalProperties: false,
      },
    },
    next_cases: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'qualification_score', 'qualification_notes',
    'strategy_score', 'strategy_notes',
    'communication_score', 'communication_notes',
    'global_score', 'strengths', 'improvements',
    'references', 'next_cases',
  ],
  additionalProperties: false,
} as const;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  const { caseId, transcript } = parsed.data;

  const caseDef = getCaseById(caseId);
  if (!caseDef) return NextResponse.json({ error: 'Unknown case' }, { status: 404 });

  const { userId } = auth();
  if (!caseDef.is_demo && !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const transcriptText = transcript
    .map((m) => `**${m.speaker ?? m.role.toUpperCase()}**: ${m.content}`)
    .join('\n\n');

  const userPrompt = SENIOR_GRADER_USER_TEMPLATE
    .replace('{mode}', caseDef.mode)
    .replace('{case_title}', caseDef.title)
    .replace('{difficulty}', caseDef.difficulty)
    .replace('{domaine}', caseDef.domaine)
    .replace('{case_summary}', caseDef.summary)
    .replace('{applicable_law_list}', caseDef.applicable_law.map((l) => `- ${l}`).join('\n'))
    .replace('{hidden_facts_list}', (caseDef.hidden_facts ?? []).map((f) => `- ${f}`).join('\n') || '(aucun)')
    .replace(
      '{available_case_ids}',
      SEED_CASES.filter((c) => c.id !== caseDef.id).map((c) => `- ${c.id} (${c.title})`).join('\n'),
    )
    .replace('{transcript}', transcriptText);

  const completion = await anthropic().messages.create({
    model: MODEL_GRADER,
    max_tokens: 4096,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'high',
      format: {
        type: 'json_schema',
        schema: FEEDBACK_SCHEMA,
      },
    },
    system: SENIOR_GRADER_SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
  } as Parameters<ReturnType<typeof anthropic>['messages']['create']>[0]);

  // Structured outputs guarantee a text block containing valid JSON.
  const textBlock = completion.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json(
      { error: 'No text content from grader', stop_reason: completion.stop_reason },
      { status: 502 },
    );
  }

  let report: FeedbackReport;
  try {
    report = JSON.parse(textBlock.text) as FeedbackReport;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON from grader', raw: textBlock.text },
      { status: 502 },
    );
  }

  return NextResponse.json(report);
}
