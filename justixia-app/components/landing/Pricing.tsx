import Link from 'next/link';

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-line bg-surface-alt">
      <div className="container-x py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="tag">Tarifs</span>
          <h2 className="mt-4">Simple. Transparent.</h2>
          <p className="mt-4 text-ink-muted">
            Commence gratuitement. Passe Pro quand tu veux des simulations illimitées,
            le Mode Tribunal et le feedback complet.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Plan
            name="Gratuit"
            price="0 €"
            period="par mois"
            features={[
              '3 simulations / mois',
              'Mode Consultation uniquement',
              'Feedback basique',
              '5 cas de la bibliothèque',
            ]}
            ctaLabel="Créer mon compte"
            ctaHref="/sign-up"
            tone="outline"
          />
          <Plan
            name="Pro"
            price="29 €"
            period="par mois"
            featured
            features={[
              'Simulations illimitées',
              'Mode Tribunal débloqué',
              'Feedback complet (3 axes)',
              'Historique + scores par domaine',
              'Toute la bibliothèque',
            ]}
            ctaLabel="Passer Pro"
            ctaHref="/pricing"
            tone="primary"
          />
          <Plan
            name="Studio"
            price="79 €"
            period="par mois"
            features={[
              'Tout ce qui est inclus dans Pro',
              'Mode Examen CRFPA',
              'Export PDF des rapports',
              'Priorité nouvelles features',
              'Cas exclusifs jurisprudence récente',
            ]}
            ctaLabel="Passer Studio"
            ctaHref="/pricing"
            tone="outline"
          />
        </div>

        <p className="mt-10 text-center text-sm text-ink-muted">
          École d&apos;avocats, université, cabinet ? Voir les{' '}
          <Link href="/pricing#b2b" className="font-semibold text-primary hover:underline">
            licences institutionnelles
          </Link>.
        </p>
      </div>
    </section>
  );
}

function Plan({
  name, price, period, features, ctaLabel, ctaHref, featured, tone,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
  tone: 'primary' | 'outline';
}) {
  return (
    <article className={`card p-8 ${featured ? 'border-2 border-primary' : ''}`}>
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-pill bg-primary px-3 py-1 text-xs font-bold text-primary-on">
          Recommandé
        </span>
      )}
      <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">{name}</p>
      <p className="mt-3 font-serif text-4xl">
        {price} <span className="text-base font-normal text-ink-muted">{period}</span>
      </p>
      <ul className="mt-6 space-y-2 text-sm text-ink">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link href={ctaHref} className={`mt-8 block w-full text-center ${tone === 'primary' ? 'btn-primary' : 'btn-outline'}`}>
        {ctaLabel}
      </Link>
    </article>
  );
}
