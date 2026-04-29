'use client';

import { useState, useRef, useEffect } from 'react';
import type { CaseDef } from '@/lib/types';

interface Msg {
  role: 'user' | 'assistant';
  speaker?: string;
  content: string;
}

export function ChatSession({
  caseDef,
  speaker = 'client',
  greeting,
  allowDemo = false,
  onComplete,
}: {
  caseDef: CaseDef;
  speaker?: 'client' | 'judge' | 'opposing';
  greeting: string;
  allowDemo?: boolean;
  onComplete: (transcript: Msg[]) => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', speaker, content: greeting }]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
          speaker,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => '');
        setMessages((m) => [...m, { role: 'assistant', speaker, content: `[erreur: ${res.status} ${errText || res.statusText}]` }]);
        setStreaming(false);
        return;
      }

      // Stream-read text chunks.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      setMessages((m) => [...m, { role: 'assistant', speaker, content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', speaker, content: acc };
          return copy;
        });
      }
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', speaker, content: `[erreur réseau: ${(e as Error).message}]` }]);
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

  async function complete() {
    if (submitting || messages.length < 3) return;
    setSubmitting(true);
    onComplete(messages);
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-lg border border-line bg-surface shadow-md">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} speaker={m.speaker}>
            {m.content || <span className="opacity-50">…</span>}
          </Bubble>
        ))}
      </div>

      <div className="border-t border-line p-4">
        <div className="flex items-end gap-3">
          <textarea
            className="min-h-[44px] flex-1 resize-none rounded-md border border-line bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={2}
            placeholder={speaker === 'client' ? 'Pose une question, qualifie, conseille…' : 'Plaide ton tour…'}
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
            {streaming ? '…' : 'Envoyer'}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-ink-subtle">
          <span>{messages.length - 1} échange{messages.length > 2 ? 's' : ''}</span>
          <button
            type="button"
            onClick={complete}
            disabled={submitting || messages.length < 3}
            className="font-semibold text-primary hover:underline disabled:opacity-40"
          >
            Terminer et obtenir le rapport →
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, speaker, children }: { role: 'user' | 'assistant'; speaker?: string; children: React.ReactNode }) {
  const isUser = role === 'user';
  const label = isUser ? 'Vous (avocat)' : labelFor(speaker);
  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : ''}`}>
        <p className={`mb-1 text-xs font-bold uppercase tracking-wider ${isUser ? 'text-right text-primary' : 'text-secondary'}`}>
          {label}
        </p>
        <div
          className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${
            isUser ? 'bg-primary text-primary-on' : 'bg-surface-alt text-ink'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function labelFor(speaker?: string): string {
  switch (speaker) {
    case 'judge': return 'Juge';
    case 'opposing': return 'Avocat adverse';
    case 'client': return 'Client';
    default: return 'Personnage';
  }
}
