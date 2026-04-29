export function Modes() {
  return (
    <section id="modes" className="border-b border-line bg-surface">
      <div className="container-x py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="tag">Les 2 modes</span>
          <h2 className="mt-4">Deux environnements. Deux pressions.</h2>
          <p className="mt-4 text-ink-muted">
            Inspirés des modes urgences et polyclinique de medkit, adaptés au métier d&apos;avocat.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Tribunal */}
          <article className="card relative overflow-hidden p-8">
            <div className="absolute right-6 top-6 text-3xl">⚖️</div>
            <span className="tag-secondary">Tribunal · Haute pression</span>
            <h3 className="mt-4 font-serif text-2xl">Tu plaides à l&apos;audience</h3>
            <p className="mt-3 text-ink-muted">
              Face à un juge IA qui peut t&apos;interrompre, un avocat adverse qui plaide en réponse,
              et un timing d&apos;audience qui court. Comme une vraie salle.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink">
              <Bullet>Plaidoirie en temps limité</Bullet>
              <Bullet>Questions du juge en temps réel</Bullet>
              <Bullet>Avocat adverse IA qui répond</Bullet>
              <Bullet>Verdict simulé + rapport feedback</Bullet>
            </ul>
            <p className="mt-6 text-xs uppercase tracking-wider text-ink-subtle">
              Travail · Famille · Commercial · Pénal
            </p>
          </article>

          {/* Consultation */}
          <article className="card relative overflow-hidden p-8">
            <div className="absolute right-6 top-6 text-3xl">🗂️</div>
            <span className="tag">Consultation · Raisonnement</span>
            <h3 className="mt-4 font-serif text-2xl">Tu reçois un client en cabinet</h3>
            <p className="mt-3 text-ink-muted">
              Le client IA décrit sa situation de façon floue et incomplète. À toi de qualifier,
              poser les bonnes questions, conseiller, rédiger ta note.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink">
              <Bullet>Client IA émotif, parfois imprécis</Bullet>
              <Bullet>Faits cachés à faire ressortir</Bullet>
              <Bullet>Qualification + conseil + note de consultation</Bullet>
              <Bullet>Évaluation par l&apos;Associé Senior IA</Bullet>
            </ul>
            <p className="mt-6 text-xs uppercase tracking-wider text-ink-subtle">
              Salarié · Locataire · Entrepreneur · Parent · Victime
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
      <span>{children}</span>
    </li>
  );
}
