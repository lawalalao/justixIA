'use client';

import { useState, useRef, useEffect } from 'react';
import type { CaseDef } from '@/lib/types';

interface Msg {
  role: 'user' | 'assistant';
  speaker?: string;
  content: string;
}

export function PrepPhase({
  caseDef,
  onPrepDone,
}: {
  caseDef: CaseDef;
  onPrepDone: (transcript: Msg[]) => void;
}) {
  const greeting =
    'Bonjour Maître. Merci de me recevoir avant l\'audience. Je suis un peu stressé·e... Que voulez-vous savoir ?';

  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', speaker: 'client', content: greeting },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: caseDef.id,
          speaker: 'client',
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => '');
        setMessages((m) => [
          ...m,
          { role: 'assistant', speaker: 'client', content: `[erreur: ${res.status} ${errText || res.statusText}]` },
        ]);
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      setMessages((m) => [...m, { role: 'assistant', speaker: 'client', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', speaker: 'client', content: acc };
          return copy;
        });
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', speaker: 'client', content: `[erreur réseau: ${(e as Error).message}]` },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  const exchanges = messages.length - 1;
  const canGoToAudience = exchanges >= 2;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-md">
      {/* Header cabinet */}
      <div className="relative overflow-hidden bg-[#1F2A4D] px-6 py-5 text-white">
        <div className="absolute right-4 top-4 h-12 w-12 opacity-20">
          <svg viewBox="0 0 24 24" fill="none" stroke="#C8A24A" strokeWidth="1.5" aria-hidden>
            <path d="M3 21h18M5 21V11l7-7 7 7v10M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-serif text-[11px] uppercase tracking-[0.3em] text-tribunal-accent">
          Phase 1 — Entretien client (cabinet)
        </p>
        <p className="mt-1 font-serif text-lg">Avant l&apos;audience : préparation avec votre client</p>
        <p className="mt-1 text-xs italic text-white/70">
          « Posez les bonnes questions, identifiez les faits, anticipez les arguments adverses. »
        </p>
      </div>

      {/* Chat client */}
      <div ref={scrollRef} className="h-[55vh] space-y-4 overflow-y-auto p-6">
        {messages.map((m, i) => (
          <PrepBubble key={i} role={m.role}>
            {m.content || <span className="opacity-50">…</span>}
          </PrepBubble>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-line bg-surface-bg p-4">
        <div className="flex items-end gap-3">
          <textarea
            className="min-h-[44px] flex-1 resize-none rounded-md border border-line bg-surface px-4 py-3 text-sm focus:border-tribunal focus:outline-none focus:ring-2 focus:ring-tribunal/20"
            rows={2}
            placeholder="Que voulez-vous demander à votre client ?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={streaming}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={send}
            disabled={!input.trim() || streaming}
          >
            {streaming ? '…' : 'Demander'}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-subtle">
          <span>{exchanges} question{exchanges > 1 ? 's' : ''} posée{exchanges > 1 ? 's' : ''}</span>
          <button
            type="button"
            onClick={() => onPrepDone(messages)}
            disabled={!canGoToAudience || streaming}
            className="rounded-md bg-tribunal px-4 py-2 font-serif text-sm font-bold uppercase tracking-wider text-tribunal-accent shadow-sm transition hover:bg-tribunal/90 disabled:opacity-40"
          >
            ⚖ Aller à l&apos;audience →
          </button>
        </div>
        {!canGoToAudience && (
          <p className="mt-2 text-[11px] text-ink-subtle">
            Pose au moins 2 questions à ton client avant d&apos;entrer dans la salle.
          </p>
        )}
      </div>
    </div>
  );
}

function PrepBubble({ role, children }: { role: 'user' | 'assistant'; children: React.ReactNode }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%]">
          <p className="mb-1 text-right text-[11px] font-bold uppercase tracking-wider text-primary">Vous (avocat)</p>
          <div className="rounded-lg bg-primary px-4 py-3 text-sm leading-relaxed text-primary-on shadow-sm">
            {children}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[78%]">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-secondary">Votre client</p>
        <div className="rounded-lg bg-surface-alt px-4 py-3 text-sm leading-relaxed text-ink shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
