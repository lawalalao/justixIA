'use client';

import { useState } from 'react';

export function UserOpinion({ caseId }: { caseId: string }) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function submit() {
    if (!rating) return;
    setStatus('sending');
    const res = await fetch('/api/user-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId, rating, comment: comment.trim() || undefined }),
    });
    setStatus(res.ok ? 'sent' : 'error');
  }

  if (status === 'sent') {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-ink-muted">Merci pour ton retour 🙏</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <p className="font-serif text-lg">Ton avis sur cette session ?</p>
      <p className="mt-1 text-sm text-ink-muted">
        Ça nous aide à améliorer Justixia. Sans ton avis, on tâtonne.
      </p>

      <div className="mt-4 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`flex h-12 w-12 items-center justify-center rounded-full border text-lg font-bold transition ${
              rating === n
                ? 'border-primary bg-primary text-white'
                : 'border-line bg-surface hover:border-primary'
            }`}
            aria-label={`Note ${n} sur 5`}
          >
            {n}
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Qu'est-ce qui a marché ? Qu'est-ce qui manque ? (optionnel)"
        rows={3}
        maxLength={2000}
        className="mt-4 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-ink-muted">
          {rating ? `Note : ${rating}/5` : '1 = très mauvais · 5 = excellent'}
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={!rating || status === 'sending'}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'sending' ? 'Envoi…' : 'Envoyer'}
        </button>
      </div>

      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600">Erreur lors de l&apos;envoi. Réessaie.</p>
      )}
    </div>
  );
}
