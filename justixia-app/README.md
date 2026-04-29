# Justixia — Clinique juridique IA

Simulateur d'entraînement pour avocats et étudiants en droit. Inspiré de [medkit](https://medkit-app.vercel.app/) (B2B médical), adapté au droit francophone (FR / BE / CH).

Deux modes :
- **Consultation** — un client IA décrit sa situation, l'utilisateur qualifie + conseille.
- **Tribunal** — l'utilisateur plaide face à un juge IA, avec un avocat adverse IA en réponse.

À la fin de chaque session, un **Associé Senior IA** délivre un rapport sur 3 axes (qualification, stratégie, communication) avec articles à réviser et cas similaires.

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Style | Tailwind CSS — design system aligné JustiXia |
| Auth | Clerk |
| DB | Supabase (Postgres + RLS) |
| LLM | Anthropic Claude Opus 4.7 (chat persona + feedback grader) |
| Voice | Browser-native (Web Speech API) — optionnel |
| Paiement | Stripe |
| Déploiement | Vercel |

## Prérequis

- Node.js ≥ 20
- Comptes : Clerk, Supabase, Anthropic, Stripe (clés API requises — voir `.env.example`)

## Démarrage local

```bash
cd justixia-app
cp .env.example .env.local
# Renseigner toutes les variables — sans elles, les API routes échoueront au premier appel.

npm install
npm run dev
# → http://localhost:3000
```

### Provisionner Supabase

1. Crée un projet Supabase, copie l'URL + les clés dans `.env.local`.
2. Applique les migrations dans l'ordre via le SQL Editor :
   - `supabase/migrations/0001_init.sql` (schéma + RLS)
   - `supabase/migrations/0002_seed_cases.sql` (8 cas de base)
3. Configure le custom JWT pour passer le `clerk_user_id` dans `auth.jwt() ->> 'sub'`
   (https://clerk.com/docs/integrations/databases/supabase).

### Configurer Stripe

1. Crée 3 produits récurrents mensuels (Pro 29 €, Studio 79 €, Team 199 €).
2. Renseigne les `price_…` dans `.env.local`.
3. Crée un webhook → URL : `https://<domain>/api/stripe/webhook`. Évents :
   `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
4. Copie le secret webhook dans `STRIPE_WEBHOOK_SECRET`.

### Voix (optionnel pour le V0)

Cette V0 ne dépend ni d'ElevenLabs ni de Whisper. Pour activer la voix
in-session, brancher l'API Web Speech native du navigateur :
- `SpeechRecognition` pour la transcription (entrée micro → texte)
- `SpeechSynthesis` pour la lecture (texte du persona → voix)

Composant `<VoiceBar />` à créer côté client. Les routes serveur ne sont
pas nécessaires (tout reste dans le navigateur).

## Structure

```
app/
  page.tsx                       Landing
  demo/page.tsx                  Démo sans compte (1 cas)
  sign-in / sign-up              Routes Clerk
  consultation/
    page.tsx                     Picker
    [caseId]/page.tsx            Session
  tribunal/
    page.tsx                     Picker
    [caseId]/page.tsx            Session (skeleton)
  dashboard/page.tsx             Historique + scores
  pricing/page.tsx               Plans + Stripe checkout
  api/
    chat/route.ts                Claude Opus 4.7 stream (client / juge / adversaire)
    feedback/route.ts            Rapport JSON Associé Senior (Claude Opus 4.7 + thinking adaptatif)
    stripe/checkout/route.ts     Crée la Checkout Session
    stripe/webhook/route.ts      Sync profil ↔ abonnement
components/
  landing/                       Sections de la home
  session/                       Chat + rapport
lib/
  cases/seed.ts                  Source unique de vérité côté front
  prompts/                       Senior grader, personas wrapper
  env.ts                         Validation env
  supabase.ts / anthropic.ts / stripe.ts
supabase/
  migrations/                    SQL versionné
```

## Statut V0 (livré ici)

✅ Scaffold complet, design system, landing, auth Clerk, DB schema + RLS,
Mode Consultation **fonctionnel** (5 cas, chat streaming, feedback Associé Senior),
démo publique, dashboard, pricing page + Stripe checkout, sitemap + robots + JSON-LD.

⚠️ **À finir** par le dev :
- **Mode Tribunal** : orchestration tour-par-tour juge ↔ avocat utilisateur ↔ adversaire
  (V0 utilise simplement le speaker 'judge'; ajouter UI pour passer la parole à 'opposing').
- **Voix end-to-end** : composant `<VoiceBar />` côté client utilisant l'API Web
  Speech native (SpeechRecognition + SpeechSynthesis). Pas de route serveur
  nécessaire — tout reste dans le navigateur. Si tu veux des voix de meilleure
  qualité plus tard, on pourra brancher ElevenLabs ou Cartesia en option.
- **Mode Examen CRFPA** : timer + grille officielle.
- **Intégration Légifrance** : enrichir les `references` du rapport avec des liens
  Légifrance auto-résolus depuis l'article cité.
- **B2B** : tableau de bord formateur, comptes en bulk, cas personnalisés.
- **OG image** : remplacer `public/og-image.placeholder.txt` par un vrai 1200×628 PNG.

## Conventions

- Les fichiers `.tsx` côté serveur n'importent **jamais** `lib/supabase.ts:supabaseAdmin`
  depuis un Client Component (le service-role key fuiterait dans le bundle).
- Tout nouveau cas se déclare dans `supabase/migrations/000X_*.sql` **et** dans
  `lib/cases/seed.ts` (les deux doivent rester synchros).
- Tout prompt de persona doit inclure les `COMMON_GUARDRAILS` via `buildClientSystem` etc.

## Déploiement en sous-chemin de justixia.xyz

Le produit est conçu pour être servi sous `https://justixia.xyz/justixia-app`.
- `next.config.js` configure `basePath: '/justixia-app'` (overridable via la
  variable d'env `BASE_PATH`).
- En attendant le déploiement réel, `vercel.json` du repo principal redirige
  `/justixia-app` vers la page teaser statique `/avocats/index.html`.

Pour passer en prod sous le sous-chemin :

1. Déployer ce dossier comme un projet Vercel séparé
   (ex: `justixia-simulator.vercel.app`).
2. Dans le `vercel.json` du repo principal `lawalalao/justixia`, remplacer
   les rewrites `/justixia-app(/?)` qui pointent vers le teaser par un
   proxy vers le déploiement Next.js :
   ```json
   { "source": "/justixia-app",            "destination": "https://justixia-simulator.vercel.app" }
   { "source": "/justixia-app/:path*",     "destination": "https://justixia-simulator.vercel.app/:path*" }
   ```
3. Vérifier que `NEXT_PUBLIC_APP_URL` côté Next.js vaut bien
   `https://justixia.xyz/justixia-app` pour que les redirects Stripe et
   les canonicals soient corrects.

Si tu préfères passer en sous-domaine plus tard (ex: `justixia.app`,
`app.justixia.xyz`), exporte `BASE_PATH=` (vide) et retire les rewrites
côté repo principal.

## Lien produit

- Site frère B2C : https://justixia.xyz (analyse de documents juridiques pour particuliers)
- Page teaser publique : https://justixia.xyz/justixia-app
- Inspiration : https://medkit-app.vercel.app/
