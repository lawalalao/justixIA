'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export function CheckoutButtons() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function go(plan: 'pro' | 'studio') {
    if (!isSignedIn) {
      router.push(`/sign-up?redirect_url=/pricing`);
      return;
    }
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const body = await res.json();
      if (!res.ok || !body.url) throw new Error(body.error ?? `HTTP ${res.status}`);
      window.location.href = body.url;
    } catch (e) {
      setError((e as Error).message);
      setLoading(null);
    }
  }

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <button type="button" disabled={!isLoaded || loading !== null} onClick={() => go('pro')} className="btn-primary">
        {loading === 'pro' ? '…' : 'Souscrire Pro · 29 €/mois'}
      </button>
      <button type="button" disabled={!isLoaded || loading !== null} onClick={() => go('studio')} className="btn-outline">
        {loading === 'studio' ? '…' : 'Souscrire Studio · 79 €/mois'}
      </button>
      {error && (
        <p className="basis-full text-sm text-danger">Erreur : {error}</p>
      )}
    </div>
  );
}
