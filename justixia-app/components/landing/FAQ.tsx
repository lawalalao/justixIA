const FAQ_ITEMS = [
  {
    q: 'Justixia remplace-t-il un stage ou une formation ?',
    a: 'Non. Justixia est un outil d\'entraînement qui complète l\'expérience réelle. Il permet de pratiquer dans un cadre sécurisé avant les vraies audiences ou consultations.',
  },
  {
    q: 'Le feedback est-il fiable juridiquement ?',
    a: 'L\'Associé Senior IA s\'appuie sur les textes du Code (civil, travail, pénal) et la jurisprudence publique récente via Légifrance. Les références sont liées explicitement. Il reste un outil pédagogique : pour une affaire réelle, il faut toujours valider avec un professionnel.',
  },
  {
    q: 'Quelles juridictions sont couvertes ?',
    a: 'France (droit civil, code du travail, code pénal), Belgique (Code judiciaire), et Suisse (CPC + droits cantonaux). Ajouts progressifs.',
  },
  {
    q: 'Le Mode Examen CRFPA est-il aligné sur la grille officielle ?',
    a: 'Oui. Timer officiel, structure des épreuves orales, et notation alignée sur les attentes des jurys connus. Disponible sur le plan Studio.',
  },
  {
    q: 'Mes simulations sont-elles confidentielles ?',
    a: 'Les transcriptions sont stockées chiffrées, accessibles uniquement à toi. Aucune donnée n\'est utilisée pour entraîner des modèles.',
  },
  {
    q: 'Comment fonctionnent les licences pour les écoles d\'avocats ?',
    a: 'Licence institutionnelle annuelle, comptes étudiants en bulk, dashboard formateur (suivi de cohorte), cas personnalisés. Voir la page Tarifs ou contactez-nous directement.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-b border-line bg-surface">
      <div className="container-x py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="tag">FAQ</span>
          <h2 className="mt-4">Questions fréquentes</h2>
        </div>
        <div className="mx-auto mt-10 max-w-2xl space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="card group p-0">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left font-semibold text-ink">
                {item.q}
                <span className="text-ink-muted transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <div className="border-t border-line px-6 py-4 text-sm leading-relaxed text-ink-muted">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pour le JSON-LD côté page.
export const FAQ_JSON_LD_ITEMS = FAQ_ITEMS;
