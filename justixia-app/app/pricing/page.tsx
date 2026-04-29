import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';
import { Pricing } from '@/components/landing/Pricing';
import { CheckoutButtons } from './CheckoutButtons';

export const metadata = {
  title: 'Tarifs',
  description: 'Justixia · plans Gratuit, Pro 29€/mois, Studio 79€/mois, et licences institutionnelles.',
};

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main>
        <Pricing />
        <section className="border-t border-line bg-surface">
          <div className="container-x py-16">
            <h2 className="font-serif">Passer à un plan payant</h2>
            <p className="mt-3 max-w-xl text-ink-muted">
              Le checkout passe par Stripe. Tu peux résilier à tout moment depuis ton espace personnel.
            </p>
            <CheckoutButtons />
          </div>
        </section>

        <section id="b2b" className="border-t border-line bg-surface-alt">
          <div className="container-x py-16">
            <span className="tag">Licences institutionnelles</span>
            <h2 className="mt-3 font-serif">Cabinets, écoles, universités, barreaux.</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <Inst title="Cabinet d'avocats" price="199 €/mois" body="Licence équipe (jusqu'à 10 avocats), historique partagé, dashboard cabinet." />
              <Inst title="École / Master 2" price="500 – 2 000 €/mois" body="Licence école, comptes étudiants en bulk, dashboard formateur, cas personnalisés." />
              <Inst title="Barreau" price="Sur devis" body="Partenariat formation continue. Justixia accrédité comme heures de formation reconnues (en cours)." />
            </div>
            <p className="mt-8 text-sm text-ink-muted">
              Pour discuter d&apos;une licence : <a href="mailto:contact@justixia.app" className="text-primary hover:underline">contact@justixia.app</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Inst({ title, price, body }: { title: string; price: string; body: string }) {
  return (
    <div className="card p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">{title}</p>
      <p className="mt-2 font-serif text-2xl">{price}</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}
