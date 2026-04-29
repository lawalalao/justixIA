import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-xl font-bold tracking-tight">
          Justi<span className="text-secondary">xia</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink-muted md:flex">
          <a href="/#modes" className="hover:text-ink">Les 2 modes</a>
          <a href="/#how" className="hover:text-ink">Comment ça marche</a>
          <a href="/pricing" className="hover:text-ink">Tarifs</a>
          <a href="/demo" className="hover:text-ink">Démo</a>
        </nav>
        <div className="flex items-center gap-3">
          <SignedOut>
            <Link href="/sign-in" className="text-sm font-medium text-ink-muted hover:text-ink">
              Connexion
            </Link>
            <Link href="/sign-up" className="btn-primary">
              Essayer gratuitement
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="text-sm font-medium text-ink-muted hover:text-ink">
              Mon espace
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
