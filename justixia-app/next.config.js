/** @type {import('next').NextConfig} */
// Sub-path deployment under https://justixia.xyz/justixia-app
//   - basePath: '/justixia-app' fait préfixer toutes les routes Next.js et
//     les liens internes <Link>. /api/... devient /justixia-app/api/...
//   - assetPrefix: même chose pour les assets statiques.
//   - Si tu veux passer en sous-domaine (ex: justixia.app, app.justixia.xyz),
//     mets BASE_PATH='' (variable d'env vide) ou supprime ces lignes.
const BASE_PATH = process.env.BASE_PATH ?? '/justixia-app';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  basePath: BASE_PATH || undefined,
  assetPrefix: BASE_PATH || undefined,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
