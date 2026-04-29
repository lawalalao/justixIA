import Link from 'next/link';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';
import { supabaseAdmin } from '@/lib/supabase';

export const metadata = { title: 'Mon espace' };

interface SessionRow {
  id: string;
  case_id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  session_feedback: { global_score: number }[];
}

async function loadDashboard(userId: string) {
  const sb = supabaseAdmin();

  // Ensure profile exists.
  const u = await currentUser();
  await sb
    .from('profiles')
    .upsert(
      {
        clerk_user_id: userId,
        email: u?.emailAddresses[0]?.emailAddress ?? null,
        full_name: u?.fullName ?? null,
      },
      { onConflict: 'clerk_user_id' },
    );

  const { data: profile } = await sb
    .from('profiles')
    .select('id, plan')
    .eq('clerk_user_id', userId)
    .single();

  if (!profile) return { plan: 'free' as const, sessions: [] as SessionRow[] };

  const { data: sessions } = await sb
    .from('sessions')
    .select('id, case_id, status, started_at, ended_at, session_feedback(global_score)')
    .eq('user_id', profile.id)
    .order('started_at', { ascending: false })
    .limit(20);

  return { plan: profile.plan as 'free' | 'pro' | 'studio' | 'team', sessions: (sessions ?? []) as SessionRow[] };
}

export default async function DashboardPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const { plan, sessions } = await loadDashboard(userId);

  const completed = sessions.filter((s) => s.status === 'completed');
  const avg =
    completed.length > 0
      ? completed.reduce((acc, s) => acc + (s.session_feedback[0]?.global_score ?? 0), 0) / completed.length
      : 0;

  return (
    <>
      <Nav />
      <main className="container-x py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif">Mon espace</h1>
          <span className="rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            Plan {plan}
          </span>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Stat label="Sessions terminées" value={String(completed.length)} />
          <Stat label="Score moyen" value={completed.length > 0 ? avg.toFixed(1) : '—'} suffix="/10" />
          <Stat label="Total" value={String(sessions.length)} />
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/consultation" className="btn-primary">Nouvelle consultation</Link>
          <Link href="/tribunal" className="btn-secondary">Nouvelle audience</Link>
          {plan === 'free' && (
            <Link href="/pricing" className="btn-outline">Passer Pro</Link>
          )}
        </div>

        <h2 className="mt-12 font-serif text-2xl">Historique</h2>
        {sessions.length === 0 ? (
          <p className="mt-4 text-ink-muted">Aucune session pour l&apos;instant. Lance ta première !</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-line bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-alt text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-4 py-3">Cas</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-mono text-xs">{s.case_id}</td>
                    <td className="px-4 py-3">{new Date(s.started_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">{labelStatus(s.status)}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {s.session_feedback[0]?.global_score?.toFixed(1) ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="card p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl">
        {value}
        {suffix && <span className="ml-1 text-base text-ink-muted">{suffix}</span>}
      </p>
    </div>
  );
}

function labelStatus(s: string) {
  if (s === 'completed') return 'Terminée';
  if (s === 'active') return 'En cours';
  return 'Abandonnée';
}
