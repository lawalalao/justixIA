import { Nav } from '@/components/landing/Nav';
import { Hero } from '@/components/landing/Hero';
import { Modes } from '@/components/landing/Modes';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Feedback } from '@/components/landing/Feedback';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ, FAQ_JSON_LD_ITEMS } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Modes />
        <HowItWorks />
        <Feedback />
        <Pricing />
        <FAQ />
      </main>
      <Footer />

      {/* JSON-LD SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Justixia',
            description:
              'Clinique juridique IA. Simulations de consultations et d\'audiences pour avocats et étudiants en droit. Feedback ancré dans le Code et la jurisprudence.',
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Web',
            url: 'https://justixia.app/',
            inLanguage: ['fr-FR', 'fr-BE', 'fr-CH'],
            offers: [
              { '@type': 'Offer', name: 'Gratuit', price: '0', priceCurrency: 'EUR' },
              { '@type': 'Offer', name: 'Pro', price: '29', priceCurrency: 'EUR' },
              { '@type': 'Offer', name: 'Studio', price: '79', priceCurrency: 'EUR' },
            ],
          }),
        }}
      />

      {/* JSON-LD FAQPage — synchronisé avec la FAQ visible */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_JSON_LD_ITEMS.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          }),
        }}
      />
    </>
  );
}
