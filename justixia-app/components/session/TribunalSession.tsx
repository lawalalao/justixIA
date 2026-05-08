'use client';

import { useState, useRef, useEffect } from 'react';
import type { CaseDef } from '@/lib/types';

type Speaker = 'judge' | 'opposing';

interface Msg {
  role: 'user' | 'assistant';
  speaker?: Speaker;
  content: string;
}

export function TribunalSession({
  caseDef,
  greeting,
  onComplete,
}: {
  caseDef: CaseDef;
  greeting: string;
  onComplete: (transcript: Msg[]) => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', speaker: 'judge', content: greeting },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [target, setTarget] = useState<Speaker>('judge');
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
          speaker: target,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => '');
        setMessages((m) => [
          ...m,
          { role: 'assistant', speaker: target, content: `[erreur: ${res.status} ${errText || res.statusText}]` },
        ]);
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      setMessages((m) => [...m, { role: 'assistant', speaker: target, content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', speaker: target, content: acc };
          return copy;
        });
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', speaker: target, content: `[erreur réseau: ${(e as Error).message}]` },
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

  function complete() {
    if (submitting || messages.length < 3) return;
    setSubmitting(true);
    onComplete(messages);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-[#FAF8F2] shadow-md">
      <CourtroomHeader title={caseDef.title} />

      <div ref={scrollRef} className="h-[60vh] space-y-5 overflow-y-auto px-6 py-8">
        {messages.map((m, i) => (
          <CourtBubble key={i} role={m.role} speaker={m.speaker}>
            {m.content || <span className="opacity-50">…</span>}
          </CourtBubble>
        ))}
      </div>

      <div className="border-t border-line bg-surface p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-ink-muted">Vous vous adressez à :</span>
          <button
            type="button"
            onClick={() => setTarget('judge')}
            className={`rounded-pill px-3 py-1 font-medium ${
              target === 'judge'
                ? 'bg-primary text-white'
                : 'border border-line text-ink-muted hover:border-primary'
            }`}
          >
            ⚖ Le Juge
          </button>
          <button
            type="button"
            onClick={() => setTarget('opposing')}
            className={`rounded-pill px-3 py-1 font-medium ${
              target === 'opposing'
                ? 'bg-secondary text-white'
                : 'border border-line text-ink-muted hover:border-secondary'
            }`}
          >
            🗣 Partie adverse
          </button>
        </div>

        <div className="flex items-end gap-3">
          <textarea
            className="min-h-[44px] flex-1 resize-none rounded-md border border-line bg-surface px-4 py-3 font-serif text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={2}
            placeholder={
              target === 'judge'
                ? 'Madame/Monsieur le Président, …'
                : 'Maître, sur ce point …'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={streaming || submitting}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={send}
            disabled={!input.trim() || streaming || submitting}
          >
            {streaming ? '…' : 'Plaider'}
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-ink-subtle">
          <span>
            {messages.length - 1} prise{messages.length > 2 ? 's' : ''} de parole
          </span>
          <button
            type="button"
            onClick={complete}
            disabled={submitting || messages.length < 3}
            className="font-semibold text-primary hover:underline disabled:opacity-40"
          >
            Clôturer l&apos;audience et obtenir le verdict pédagogique →
          </button>
        </div>
      </div>
    </div>
  );
}

function CourtroomHeader({ title }: { title: string }) {
  return (
    <div className="relative overflow-hidden border-b border-line bg-tribunal px-6 py-6 text-center">
      <Scales className="absolute right-4 top-4 h-12 w-12 text-tribunal-accent opacity-30" />
      <Scales className="absolute left-4 top-4 h-12 w-12 text-tribunal-accent opacity-30" />
      <p className="font-serif text-xs uppercase tracking-[0.3em] text-tribunal-accent">
        Audience publique
      </p>
      <p className="mt-1 font-serif text-lg text-white">{title}</p>
      <p className="mt-1 text-xs italic text-white/70">
        « L&apos;audience est ouverte. La parole est donnée à la défense. »
      </p>
    </div>
  );
}

function CourtBubble({
  role,
  speaker,
  children,
}: {
  role: 'user' | 'assistant';
  speaker?: Speaker;
  children: React.ReactNode;
}) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%]">
          <p className="mb-1 text-right font-serif text-[11px] uppercase tracking-[0.2em] text-primary">
            Maître (vous)
          </p>
          <div className="rounded-lg bg-primary px-4 py-3 text-sm leading-relaxed text-primary-on shadow-sm">
            {children}
          </div>
        </div>
      </div>
    );
  }

  if (speaker === 'judge') {
    return (
      <div className="flex justify-center">
        <div className="max-w-[85%]">
          <p className="mb-1 text-center font-serif text-[11px] uppercase tracking-[0.3em] text-tribunal-accent">
            ⚖ Madame/Monsieur le Président
          </p>
          <div className="rounded-lg border-l-4 border-tribunal-accent bg-surface px-5 py-4 font-serif text-sm leading-relaxed text-ink shadow-sm">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Opposing counsel — left, secondary tone
  return (
    <div className="flex justify-start">
      <div className="max-w-[78%]">
        <p className="mb-1 font-serif text-[11px] uppercase tracking-[0.2em] text-secondary">
          Maître (partie adverse)
        </p>
        <div className="rounded-lg bg-surface-alt px-4 py-3 text-sm leading-relaxed text-ink shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

function Scales({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <path d="M12 3v18M5 21h14M7 8h10M5.5 8L3 14a3 3 0 0 0 5 0L5.5 8zM18.5 8L16 14a3 3 0 0 0 5 0l-2.5-6z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
