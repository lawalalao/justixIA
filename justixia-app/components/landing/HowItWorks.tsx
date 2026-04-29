const STEPS = [
  { n: '01', title: 'Choisis ton cas', body: 'Domaine juridique, niveau de difficulté, durée estimée. Bibliothèque de cas inspirés de jurisprudence publique.' },
  { n: '02', title: 'Lance la simulation', body: 'Mode Consultation ou Tribunal. Voix ou texte. Le client IA ou le juge IA réagit en direct.' },
  { n: '03', title: 'Reçois ton feedback', body: 'L\'Associé Senior IA évalue qualification, stratégie, et communication. Score sur 10, articles à réviser, cas similaires suggérés.' },
  { n: '04', title: 'Suis ta progression', body: 'Tableau de bord par domaine, courbe d\'amélioration, badges. Comparaison anonyme avec d\'autres utilisateurs du même niveau.' },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-b border-line bg-surface-alt">
      <div className="container-x py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="tag">Comment ça marche</span>
          <h2 className="mt-4">Quatre étapes. Aucun risque.</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-6">
              <div className="font-serif text-2xl text-secondary">{s.n}</div>
              <h3 className="mt-3 font-serif text-lg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
