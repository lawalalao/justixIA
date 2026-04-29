import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';
import { SessionShell } from '@/components/session/SessionShell';
import { getDemoCase } from '@/lib/cases/seed';

export const metadata = {
  title: 'Démo Justixia · Sans inscription',
  description: 'Essaie une consultation Justixia en 3 minutes, sans créer de compte.',
};

export default function DemoPage() {
  const c = getDemoCase();
  const greeting =
    'Bonjour. Vous êtes mon avocat ? Je viens vous voir parce que je viens d\'être licenciée hier… j\'ai 7 ans dans la boîte et là, on m\'a dit "faute grave". Je sais pas du tout quoi faire.';

  return (
    <>
      <Nav />
      <main>
        <div className="border-b border-line bg-secondary-soft">
          <div className="container-x py-6 text-center text-sm text-ink">
            <strong>Démo publique · sans compte.</strong> Tu peux tester un cas Consultation. Pour les autres cas et le Mode Tribunal,{' '}
            <a href="/sign-up" className="font-semibold text-primary hover:underline">crée un compte gratuit</a>.
          </div>
        </div>
        <SessionShell caseDef={c} speaker="client" greeting={greeting} allowDemo />
      </main>
      <Footer />
    </>
  );
}
