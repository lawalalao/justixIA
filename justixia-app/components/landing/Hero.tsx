import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-surface-bg">
      <div className="container-x py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="tag-secondary">Clinique juridique IA</span>
          <h1 className="mt-6 font-serif text-5xl font-bold leading-tight md:text-6xl">
            Plaide comme si c&apos;était réel.
            <br />
            <span className="text-secondary">Entraîne-toi comme si c&apos;était sûr.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-muted md:text-xl">
            Simule des consultations et des audiences avec des clients et juges IA.
            Feedback instantané basé sur le Code civil, le Code du travail
            et la jurisprudence réelle.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/demo" className="btn-primary text-base">
              Essayer la démo (sans compte)
            </Link>
            <Link href="/sign-up" className="btn-outline text-base">
              Créer mon compte gratuit
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-wider text-ink-subtle">
            <span>GPT-4o</span>
            <span aria-hidden>·</span>
            <span>ElevenLabs</span>
            <span aria-hidden>·</span>
            <span>Whisper</span>
            <span aria-hidden>·</span>
            <span>Légifrance</span>
          </div>
        </div>
      </div>
    </section>
  );
}
