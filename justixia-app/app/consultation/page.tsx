import Link from 'next/link';
import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';
import { SEED_CASES } from '@/lib/cases/seed';

export const metadata = { title: 'Mode Consultation — Choisis un cas' };

export default function ConsultationIndex() {
  const cases = SEED_CASES.filter((c) => c.mode === 'consultation');
  return (
    <>
      <Nav />
      <main className="container-x py-12">
        <header className="max-w-2xl">
          <span className="tag">Mode Consultation</span>
          <h1 className="mt-3 font-serif">Choisis un client à recevoir.</h1>
          <p className="mt-3 text-ink-muted">
            Le client IA décrit sa situation. À toi de qualifier, poser les bonnes questions, conseiller.
          </p>
        </header>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <Link
              key={c.id}
              href={`/consultation/${c.id}`}
              className="card group flex flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-wider">
                <span className="tag">{c.domaine}</span>
                <span className="text-ink-subtle">{c.difficulty}</span>
              </div>
              <h3 className="mt-4 font-serif text-lg">{c.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{c.summary}</p>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-ink-subtle">~{c.estimated_minutes} min</span>
                <span className="font-semibold text-primary group-hover:underline">Démarrer →</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
