// POST /api/feedback
// Génère le rapport de l'Associé Senior. Sortie JSON strict.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { openai, MODEL_CHAT } from '@/lib/openai';
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

  const userPrompt = SENIOR_GRADER_USER_TEMPLATE.replace('{mode}', caseDef.mode)
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

  const completion = await openai().chat.completions.create({
    model: MODEL_CHAT,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SENIOR_GRADER_SYSTEM },
      { role: 'user', content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return NextResponse.json({ error: 'No completion' }, { status: 500 });

  let report: FeedbackReport;
  try {
    report = JSON.parse(raw) as FeedbackReport;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON from grader', raw }, { status: 500 });
  }

  return NextResponse.json(report);
}
