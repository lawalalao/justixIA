import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';
import { SessionShell } from '@/components/session/SessionShell';
import { getCaseById } from '@/lib/cases/seed';

export default async function TribunalCasePage({ params }: { params: { caseId: string } }) {
  const c = getCaseById(params.caseId);
  if (!c || c.mode !== 'tribunal') notFound();
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

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
