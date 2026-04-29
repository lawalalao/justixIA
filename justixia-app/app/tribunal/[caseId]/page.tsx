import { notFound } from 'next/navigation';
import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';
import { SessionShell } from '@/components/session/SessionShell';
import { getCaseById } from '@/lib/cases/seed';

// V0: l'orchestration "tour-par-tour" juge → avocat utilisateur → adversaire est
// volontairement simplifiée. Le speaker est 'judge' par défaut; le dev a la main
// pour ajouter un toggle UI permettant à l'utilisateur de demander la parole à
// l'adversaire (POST /api/chat avec speaker='opposing').
export default function TribunalCasePage({ params }: { params: { caseId: string } }) {
  const c = getCaseById(params.caseId);
  if (!c || c.mode !== 'tribunal') notFound();

  const greeting =
    'L\'audience est ouverte. Maître, vous avez la parole. Veuillez exposer brièvement les prétentions de votre client.';

  return (
    <>
      <Nav />
      <main>
        <SessionShell caseDef={c} speaker="judge" greeting={greeting} />
      </main>
      <Footer />
    </>
  );
}
