import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';
import { SessionShell } from '@/components/session/SessionShell';
import { getCaseById } from '@/lib/cases/seed';

export default async function ConsultationCasePage({ params }: { params: { caseId: string } }) {
  const c = getCaseById(params.caseId);
  if (!c || c.mode !== 'consultation') notFound();
  if (!c.is_demo) {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');
  }

  // Greeting initial du client (placeholder simple — le vrai contenu vient du persona).
  const greeting = `Bonjour. Merci de me recevoir. Voilà, je viens vous voir pour... (je vais vous expliquer).`;

  return (
    <>
      <Nav />
      <main>
        <SessionShell caseDef={c} speaker="client" greeting={greeting} />
      </main>
      <Footer />
    </>
  );
}
