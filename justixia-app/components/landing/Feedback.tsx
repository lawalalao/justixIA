export function Feedback() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="container-x py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="tag">Feedback IA</span>
            <h2 className="mt-4">L&apos;Associé Senior te débriefe.</h2>
            <p className="mt-4 text-ink-muted">
              À la fin de chaque simulation, un rapport structuré sur trois axes :
              qualification juridique, stratégie procédurale, et communication client.
            </p>
            <ul className="mt-8 space-y-5">
              <Item title="Qualification juridique">
                Les bons textes ont-ils été cités ? Le Code civil, le Code du travail, la jurisprudence
                de la Cour de cassation pertinente. Score sur 10 + articles à réviser sur Légifrance.
              </Item>
              <Item title="Stratégie procédurale">
                Bonne juridiction ? Délais respectés ? Arguments dans le bon ordre ? Pièces du dossier
                exploitées ?
              </Item>
              <Item title="Communication client">
                Explication claire, options équilibrées, ton professionnel et empathique.
                <span className="ml-2 text-xs text-ink-subtle">(Mode Consultation uniquement)</span>
              </Item>
            </ul>
          </div>

          {/* Faux rapport (visuel) */}
          <div className="card overflow-hidden">
            <div className="border-b border-line bg-surface-alt px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Rapport · Consultation
                </span>
                <span className="rounded-pill bg-success-soft px-3 py-1 text-xs font-bold text-success">
                  7.4 / 10
                </span>
              </div>
            </div>
            <div className="space-y-5 p-6">
              <Score label="Qualification" value={8} />
              <Score label="Stratégie" value={7} />
              <Score label="Communication" value={7} />
              <div className="rounded-md border border-line bg-surface-alt p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  À réviser
                </p>
                <ul className="mt-2 space-y-1 text-sm text-ink">
                  <li>· Code du travail, art. L1232-1 (cause réelle et sérieuse)</li>
                  <li>· Cass. soc. 14 juin 2023, n°22-10.123</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li>
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{children}</p>
    </li>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-mono text-ink-muted">{value}/10</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-pill bg-surface-alt">
        <div
          className="h-full bg-primary"
          style={{ width: `${value * 10}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
