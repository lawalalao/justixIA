'use client';

import { useState, useRef, useEffect } from 'react';
import type { CaseDef } from '@/lib/types';

type Speaker = 'judge' | 'opposing';
type ActiveActor = 'judge' | 'opposing' | 'user' | null;

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
  const [showHistory, setShowHistory] = useState(false);

  // Active actor = qui est en train de parler (sprite illuminé)
  const last = messages[messages.length - 1];
  const activeActor: ActiveActor = streaming
    ? target
    : last?.role === 'user'
      ? 'user'
      : last?.speaker ?? null;

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

  const currentLine =
    last?.role === 'user'
      ? { who: 'Maître (vous)', accent: 'primary' as const, content: last.content }
      : last?.speaker === 'judge'
        ? { who: 'Madame/Monsieur le Président', accent: 'gold' as const, content: last.content }
        : { who: 'Maître (partie adverse)', accent: 'secondary' as const, content: last?.content ?? '' };

  return (
    <div className="overflow-hidden rounded-lg border border-tribunal/30 shadow-lg">
      {/* === STAGE === */}
      <div className="relative isolate min-h-[420px] bg-tribunal">
        {/* Décor : colonnes + balance */}
        <CourtroomBackdrop />

        {/* Bandeau audience */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-4 text-[11px] uppercase tracking-[0.3em] text-tribunal-accent">
          <span>⚖ Audience publique</span>
          <span className="opacity-60">{caseDef.title}</span>
        </div>

        {/* Personnages */}
        <div className="relative z-10 grid grid-cols-3 items-end gap-4 px-6 pt-10 pb-6">
          <Actor
            position="left"
            name="Partie adverse"
            sublabel="Maître"
            avatar="opposing"
            isActive={activeActor === 'opposing'}
            isStreaming={streaming && target === 'opposing'}
          />
          <Actor
            position="center"
            name="Le Président"
            sublabel="Magistrat·e"
            avatar="judge"
            isActive={activeActor === 'judge'}
            isStreaming={streaming && target === 'judge'}
          />
          <Actor
            position="right"
            name="Vous"
            sublabel="Maître (défense)"
            avatar="user"
            isActive={activeActor === 'user'}
          />
        </div>
      </div>

      {/* === DIALOGUE BOX (Ace Attorney style) === */}
      <div className="relative border-y-2 border-tribunal-accent bg-[#11163A] px-6 py-5 text-white">
        <div className={`mb-2 inline-block rounded-sm px-3 py-1 font-serif text-[11px] uppercase tracking-[0.25em] ${
          currentLine.accent === 'gold'
            ? 'bg-tribunal-accent text-tribunal'
            : currentLine.accent === 'primary'
              ? 'bg-primary text-primary-on'
              : 'bg-secondary text-secondary-on'
        }`}>
          {currentLine.who}
        </div>
        <p className="font-serif text-lg leading-relaxed text-white/95">
          {currentLine.content || <span className="opacity-50">…</span>}
          {streaming && <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-tribunal-accent align-middle" />}
        </p>

        <button
          type="button"
          onClick={() => setShowHistory((s) => !s)}
          className="absolute right-4 top-3 text-[10px] uppercase tracking-wider text-tribunal-accent hover:text-white"
        >
          {showHistory ? 'Masquer' : 'Historique'} ({messages.length})
        </button>
      </div>

      {/* Historique repliable */}
      {showHistory && (
        <div className="max-h-64 space-y-3 overflow-y-auto border-b border-line bg-[#0F1330] px-6 py-4 text-sm text-white/80">
          {messages.slice(0, -1).map((m, i) => (
            <div key={i} className="flex gap-3 border-l-2 border-tribunal-accent/40 pl-3">
              <span className="shrink-0 font-serif text-[10px] uppercase tracking-wider text-tribunal-accent">
                {m.role === 'user' ? 'Vous' : m.speaker === 'judge' ? 'Président' : 'Adverse'}
              </span>
              <span className="text-white/70">{m.content}</span>
            </div>
          ))}
        </div>
      )}

      {/* === INPUT BAR === */}
      <div className="bg-surface px-6 py-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-serif uppercase tracking-wider text-ink-muted">
            Vous interpellez :
          </span>
          <button
            type="button"
            onClick={() => setTarget('judge')}
            className={`rounded-pill px-4 py-1.5 font-medium transition ${
              target === 'judge'
                ? 'bg-tribunal text-tribunal-accent shadow-sm'
                : 'border border-line text-ink-muted hover:border-tribunal'
            }`}
          >
            ⚖ Le Président
          </button>
          <button
            type="button"
            onClick={() => setTarget('opposing')}
            className={`rounded-pill px-4 py-1.5 font-medium transition ${
              target === 'opposing'
                ? 'bg-secondary text-white shadow-sm'
                : 'border border-line text-ink-muted hover:border-secondary'
            }`}
          >
            🗣 La partie adverse
          </button>
        </div>

        <div className="flex items-end gap-3">
          <textarea
            className="min-h-[48px] flex-1 resize-none rounded-md border border-line bg-surface-bg px-4 py-3 font-serif text-sm focus:border-tribunal focus:outline-none focus:ring-2 focus:ring-tribunal/20"
            rows={2}
            placeholder={
              target === 'judge'
                ? 'Madame/Monsieur le Président, je sollicite votre attention sur…'
                : 'Maître, je m\'oppose : …'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={streaming || submitting}
          />
          <button
            type="button"
            className="rounded-md bg-tribunal px-5 py-3 font-serif text-sm font-bold uppercase tracking-wider text-tribunal-accent shadow-md transition hover:bg-tribunal/90 disabled:opacity-40"
            onClick={send}
            disabled={!input.trim() || streaming || submitting}
          >
            {streaming ? '…' : 'Plaider'}
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-ink-subtle">
          <span>{messages.length - 1} prise{messages.length > 2 ? 's' : ''} de parole</span>
          <button
            type="button"
            onClick={complete}
            disabled={submitting || messages.length < 3}
            className="font-semibold text-tribunal hover:underline disabled:opacity-40"
          >
            Clôturer l&apos;audience et obtenir le verdict pédagogique →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────── */
/*                  ACTORS                          */
/* ──────────────────────────────────────────────── */

function Actor({
  position,
  name,
  sublabel,
  avatar,
  isActive,
  isStreaming = false,
}: {
  position: 'left' | 'center' | 'right';
  name: string;
  sublabel: string;
  avatar: 'judge' | 'opposing' | 'user';
  isActive: boolean;
  isStreaming?: boolean;
}) {
  const heightClass = position === 'center' ? 'h-44' : 'h-36';
  const transformClass = isActive ? 'scale-105' : 'scale-95 opacity-50';

  return (
    <div className={`flex flex-col items-center transition-all duration-300 ${transformClass}`}>
      <div className={`relative ${heightClass} aspect-[3/4] w-full max-w-[160px]`}>
        {/* Spotlight */}
        {isActive && (
          <div className="pointer-events-none absolute inset-0 -z-10 animate-pulse rounded-t-full bg-tribunal-accent/20 blur-2xl" />
        )}
        {/* Avatar pedestal */}
        <div className="relative h-full w-full">
          <AvatarSVG kind={avatar} active={isActive} />
        </div>
        {/* Streaming indicator */}
        {isStreaming && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-tribunal-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-tribunal animate-bounce">
            parle…
          </span>
        )}
      </div>
      <div className="mt-2 text-center">
        <p className="font-serif text-sm font-bold text-white">{name}</p>
        <p className="text-[10px] uppercase tracking-wider text-tribunal-accent">{sublabel}</p>
      </div>
    </div>
  );
}

function AvatarSVG({ kind, active }: { kind: 'judge' | 'opposing' | 'user'; active: boolean }) {
  const robe = kind === 'judge' ? '#1F2A4D' : kind === 'opposing' ? '#7C2547' : '#0E7C66';
  const accent = active ? '#C8A24A' : '#5F6B6E';
  const collar = '#FFFFFF';

  return (
    <svg viewBox="0 0 100 140" className="h-full w-full drop-shadow-lg" aria-hidden>
      {/* Pedestal */}
      <rect x="10" y="120" width="80" height="14" fill={accent} opacity="0.3" />
      <rect x="14" y="124" width="72" height="10" fill={accent} opacity="0.5" />

      {/* Robe (body) */}
      <path d="M30 60 L20 130 L80 130 L70 60 Z" fill={robe} />
      {/* Collar / jabot */}
      <path d="M40 58 L50 80 L60 58 Z" fill={collar} opacity="0.9" />
      <path d="M44 58 L50 90 L56 58 Z" fill={collar} />

      {/* Head */}
      <circle cx="50" cy="40" r="15" fill="#E8C8A0" />
      {/* Hair / wig */}
      {kind === 'judge' ? (
        <>
          <path d="M35 36 Q50 18 65 36 L65 48 Q50 42 35 48 Z" fill="#F3F4F6" />
          <ellipse cx="50" cy="36" rx="17" ry="6" fill="#F3F4F6" />
        </>
      ) : kind === 'opposing' ? (
        <path d="M35 32 Q50 22 65 32 L62 42 Q50 35 38 42 Z" fill="#3B2A1A" />
      ) : (
        <path d="M35 34 Q50 22 65 34 L63 44 Q50 38 37 44 Z" fill="#1F2A1A" />
      )}

      {/* Face hint */}
      <circle cx="44" cy="42" r="1.5" fill="#14201E" />
      <circle cx="56" cy="42" r="1.5" fill="#14201E" />
      <path d={active ? 'M45 50 Q50 53 55 50' : 'M45 50 L55 50'} stroke="#14201E" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Symbol on robe */}
      {kind === 'judge' && (
        <g>
          <line x1="50" y1="95" x2="50" y2="115" stroke={accent} strokeWidth="1.5" />
          <line x1="44" y1="98" x2="56" y2="98" stroke={accent} strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
}

/* ──────────────────────────────────────────────── */
/*                  BACKDROP                        */
/* ──────────────────────────────────────────────── */

function CourtroomBackdrop() {
  return (
    <svg
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F2A4D" />
          <stop offset="100%" stopColor="#0B1024" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#252F55" />
          <stop offset="100%" stopColor="#1F2A4D" />
        </linearGradient>
      </defs>

      <rect width="800" height="400" fill="url(#wall)" />
      <rect y="280" width="800" height="120" fill="url(#floor)" />

      {/* Pillars */}
      {[80, 240, 560, 720].map((x) => (
        <g key={x}>
          <rect x={x - 8} y="20" width="16" height="280" fill="#11163A" />
          <rect x={x - 14} y="14" width="28" height="14" fill="#C8A24A" opacity="0.4" />
          <rect x={x - 14} y="296" width="28" height="14" fill="#C8A24A" opacity="0.4" />
        </g>
      ))}

      {/* Bench / dais */}
      <rect x="290" y="240" width="220" height="50" fill="#11163A" />
      <rect x="290" y="232" width="220" height="10" fill="#C8A24A" opacity="0.6" />

      {/* Big scales emblem */}
      <g transform="translate(400, 80)" opacity="0.15">
        <line x1="0" y1="-30" x2="0" y2="40" stroke="#C8A24A" strokeWidth="2" />
        <line x1="-50" y1="-20" x2="50" y2="-20" stroke="#C8A24A" strokeWidth="2" />
        <circle cx="-50" cy="0" r="14" fill="none" stroke="#C8A24A" strokeWidth="2" />
        <circle cx="50" cy="0" r="14" fill="none" stroke="#C8A24A" strokeWidth="2" />
      </g>
    </svg>
  );
}
