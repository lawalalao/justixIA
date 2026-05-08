'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CaseDef, FeedbackReport } from '@/lib/types';
import { ChatSession } from './ChatSession';
import { TribunalSession } from './TribunalSession';
import { FeedbackReportView } from './FeedbackReport';
import { UserOpinion } from './UserOpinion';

interface Msg { role: 'user' | 'assistant'; speaker?: string; content: string }

export function SessionShell({
  caseDef,
  speaker,
  greeting,
  allowDemo = false,
}: {
  caseDef: CaseDef;
  speaker: 'client' | 'judge' | 'opposing';
  greeting: string;
  allowDemo?: boolean;
}) {
  const [report, setReport] = useState<FeedbackReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete(transcript: Msg[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: caseDef.id, transcript }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as FeedbackReport;
      setReport(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-x py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-xs font-medium text-ink-muted hover:text-ink">← Accueil</Link>
          <h1 className="mt-2 font-serif text-2xl md:text-3xl">{caseDef.title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{caseDef.summary}</p>
        </div>
        <div className="flex gap-2 text-xs uppercase tracking-wider text-ink-subtle">
          <span className="tag">{caseDef.domaine}</span>
          <span className="tag-secondary">{caseDef.difficulty}</span>
        </div>
      </div>

      {!report && !loading && (
        caseDef.mode === 'tribunal' ? (
          <TribunalSession
            caseDef={caseDef}
            greeting={greeting}
            onComplete={handleComplete}
          />
        ) : (
          <ChatSession
            caseDef={caseDef}
            speaker={speaker}
            greeting={greeting}
            allowDemo={allowDemo}
            onComplete={handleComplete}
          />
        )
      )}

      {loading && (
        <div className="card p-12 text-center">
          <p className="font-serif text-xl">L&apos;Associé Senior analyse votre session…</p>
          <p className="mt-2 text-sm text-ink-muted">Cela prend ~10 secondes.</p>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-danger bg-danger-soft p-4 text-sm text-danger">
          Erreur : {error}
        </div>
      )}

      {report && (
        <>
          <FeedbackReportView report={report} caseId={caseDef.id} />
          <UserOpinion caseId={caseDef.id} />
        </>
      )}
    </div>
  );
}
