import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-surface-inverted text-white">
      <div className="container-x py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="font-serif text-xl font-bold tracking-tight text-white">
              Justi<span className="text-secondary">xia</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/60">
              Clinique juridique IA pour les avocats et étudiants en droit francophones.
            </p>
          </div>
          <FooterCol title="Produit">
            <a href="/#modes">Les 2 modes</a>
            <a href="/#how">Comment ça marche</a>
            <a href="/demo">Démo</a>
          </FooterCol>
          <FooterCol title="Ressources">
            <a href="/#faq">FAQ</a>
            <a href="https://api.gouv.fr/les-api/api-legifrance" target="_blank" rel="noopener noreferrer">API Légifrance</a>
            <a href="mailto:contact@justixia.app">Contact</a>
          </FooterCol>
          <FooterCol title="Légal">
            <a href="/cgu">CGU</a>
            <a href="/confidentialite">Confidentialité</a>
            <a href="/mentions-legales">Mentions légales</a>
          </FooterCol>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Justixia. Tous droits réservés.</span>
          <span>Justixia n&apos;est pas un cabinet d&apos;avocats. Outil pédagogique uniquement.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="text-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-white/50">{title}</p>
      <ul className="mt-3 space-y-2 [&_a]:text-white/80 [&_a]:hover:text-white">
        {Array.isArray(children) ? children.map((c, i) => <li key={i}>{c}</li>) : <li>{children}</li>}
      </ul>
    </div>
  );
}
