import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://justixia.app'),
  title: {
    default: 'Justixia — Plaide comme si c\'était réel',
    template: '%s · Justixia',
  },
  description:
    'Clinique juridique IA pour avocats et étudiants en droit. Simule des consultations et des audiences avec des clients et juges IA. Feedback instantané basé sur le Code et la jurisprudence.',
  applicationName: 'Justixia',
  alternates: { canonical: 'https://justixia.app/' },
  openGraph: {
    type: 'website',
    url: 'https://justixia.app/',
    title: 'Justixia — Plaide comme si c\'était réel',
    description:
      'Simule consultations et audiences avec des clients et juges IA. Feedback ancré dans le Code et la jurisprudence.',
    siteName: 'Justixia',
    locale: 'fr_FR',
    images: [{ url: '/og-image.png', width: 1200, height: 628 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Justixia — Plaide comme si c\'était réel',
    description: 'Clinique juridique IA. Consultations + audiences simulées. Feedback Légifrance.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
