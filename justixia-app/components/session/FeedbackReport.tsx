'use client';

import Link from 'next/link';
import type { FeedbackReport } from '@/lib/types';

export function FeedbackReportView({ report, caseId }: { report: FeedbackReport; caseId: string }) {
  const isTribunal = report.communication_score === null;

  return (
    <div className="space-y-6">
      <header className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-surface-alt px-6 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Rapport · Associé Senior
            </p>
            <p className="mt-1 font-serif text-2xl">Score global : {report.global_score.toFixed(1)} / 10</p>
          </div>
          <Link href={`/${caseId.startsWith('trib-') ? 'tribunal' : 'consultation'}`} className="btn-outline">
            Nouvelle session
          </Link>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-3">
          <Score label="Qualification juridique" value={report.qualification_score} notes={report.qualification_notes} />
          <Score label="Stratégie procédurale" value={report.strategy_score} notes={report.strategy_notes} />
          {!isTribunal && report.communication_score !== null && (
            <Score
              label="Communication client"
              value={report.communication_score}
              notes={report.communication_notes ?? ''}
            />
          )}
          {isTribunal && (
            <div className="rounded-md border border-line bg-surface-alt p-4 text-sm text-ink-muted">
              Mode Tribunal : la communication client n&apos;est pas évaluée.
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Block title="Points forts" items={report.strengths} accent="success" />
        <Block title="À travailler en priorité" items={report.improvements} accent="warning" />
      </div>

      <div className="card p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">À réviser</p>
        <ul className="mt-3 space-y-2 text-sm">
          {report.references.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              {r.url ? (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {r.article}
                </a>
              ) : (
                <span className="text-ink">{r.article}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">Cas similaires recommandés</p>
        <ul className="mt-3 space-y-2 text-sm">
          {report.next_cases.map((id) => (
            <li key={id}>
              <Link
                href={`/${id.startsWith('trib-') ? 'tribunal' : 'consultation'}/${id}`}
                className="font-mono text-primary hover:underline"
              >
                {id} →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Score({ label, value, notes }: { label: string; value: number; notes: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">{label}</p>
        <span className="font-mono text-sm text-ink">{value}/10</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-pill bg-surface-alt">
        <div className="h-full bg-primary" style={{ width: `${value * 10}%` }} aria-hidden />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{notes}</p>
    </div>
  );
}

function Block({ title, items, accent }: { title: string; items: string[]; accent: 'success' | 'warning' }) {
  const tone = accent === 'success' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning';
  return (
    <div className="card p-6">
      <p className={`inline-flex rounded-pill px-3 py-1 text-xs font-bold uppercase tracking-wider ${tone}`}>{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-ink">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-ink-muted" aria-hidden />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
