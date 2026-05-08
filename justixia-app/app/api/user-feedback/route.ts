// POST /api/user-feedback
// Reçoit l'avis d'un utilisateur (anonyme ou connecté) après une session.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const BodySchema = z.object({
  caseId: z.string().min(1).max(64).optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const { userId } = await auth();

  const sb = supabaseAdmin();
  const { error } = await sb.from('user_feedback').insert({
    clerk_user_id: userId,
    case_id: parsed.data.caseId ?? null,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? null,
    user_agent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
