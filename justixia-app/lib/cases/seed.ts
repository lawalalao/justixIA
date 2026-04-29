// Fallback seed côté front pour rendre la démo + le case picker fonctionnels
// avant que le seed Supabase soit appliqué. Synchronisé avec 0002_seed_cases.sql.

import type { CaseDef } from '@/lib/types';

export const SEED_CASES: CaseDef[] = [
  {
    id: 'cons-licenciement-demo',
    mode: 'consultation',
    domaine: 'travail',
    difficulty: 'debutant',
    title: 'Salarié licencié pour faute grave',
    summary:
      'Sophie, 34 ans, vendeuse depuis 7 ans, vient d\'être licenciée pour faute grave après une dispute. Elle ne sait pas si la procédure était régulière.',
    estimated_minutes: 15,
    is_demo: true,
    applicable_law: [
      'Code du travail L1232-1 — cause réelle et sérieuse',
      'Code du travail L1232-2 — entretien préalable',
      'Cass. soc. 14 juin 2023 n°22-10.123',
    ],
    hidden_facts: [
      'La responsable a insulté Sophie en premier',
      'Pas de courrier de convocation à l\'entretien préalable, seulement un appel',
    ],
  },
  {
    id: 'cons-bail-locataire',
    mode: 'consultation',
    domaine: 'immobilier',
    difficulty: 'intermediaire',
    title: 'Locataire face à propriétaire abusif',
    summary:
      'Karim, 28 ans, locataire d\'un T2 à Lyon depuis 3 ans, reçoit un congé pour reprise. La chaudière fuit depuis 8 mois.',
    estimated_minutes: 20,
    is_demo: false,
    applicable_law: [
      'Loi 6 juillet 1989 art. 15 — congé pour reprise',
      'Loi 6 juillet 1989 art. 22 — dépôt de garantie',
    ],
  },
  {
    id: 'cons-rupture-fournisseur',
    mode: 'consultation',
    domaine: 'commercial',
    difficulty: 'intermediaire',
    title: 'Entrepreneur en litige avec un fournisseur',
    summary:
      'Léa dirige une PME bio. Son principal fournisseur double ses prix unilatéralement et menace de couper.',
    estimated_minutes: 25,
    is_demo: false,
    applicable_law: [
      'Code de commerce L442-1 — rupture brutale relations commerciales',
      'Code civil 1103 — force obligatoire des contrats',
    ],
  },
  {
    id: 'cons-garde-enfants',
    mode: 'consultation',
    domaine: 'famille',
    difficulty: 'avance',
    title: 'Parent en conflit de garde',
    summary:
      'Marc, 39 ans, en instance de divorce. Son ex a déménagé à 400 km avec leurs deux enfants sans accord.',
    estimated_minutes: 30,
    is_demo: false,
    applicable_law: ['Code civil 373-2', 'Code civil 373-2-9'],
  },
  {
    id: 'cons-accident-route',
    mode: 'consultation',
    domaine: 'penal',
    difficulty: 'debutant',
    title: 'Victime d\'un accident de la route',
    summary:
      'Aïcha, 52 ans, infirmière, percutée à un feu rouge par un chauffard en fuite. 3 mois d\'ITT.',
    estimated_minutes: 20,
    is_demo: false,
    applicable_law: ['Loi Badinter 5 juillet 1985', 'Code pénal 222-19'],
  },
  {
    id: 'trib-prudhommes-licenciement',
    mode: 'tribunal',
    domaine: 'travail',
    difficulty: 'intermediaire',
    title: 'Audience prud\'homale — licenciement abusif',
    summary:
      'Tu plaides pour Sophie devant le Conseil de Prud\'hommes de Paris. L\'employeur conteste le caractère abusif.',
    estimated_minutes: 30,
    is_demo: false,
    applicable_law: ['Code du travail L1232-1, L1232-2, L1234-9'],
  },
  {
    id: 'trib-divorce-contentieux',
    mode: 'tribunal',
    domaine: 'famille',
    difficulty: 'avance',
    title: 'Audience JAF — garde des enfants',
    summary: 'Tu plaides pour Marc devant le JAF, qui doit statuer sur la garde après déplacement unilatéral.',
    estimated_minutes: 35,
    is_demo: false,
    applicable_law: ['Code civil 373-2 et suivants'],
  },
  {
    id: 'trib-litige-commercial',
    mode: 'tribunal',
    domaine: 'commercial',
    difficulty: 'avance',
    title: 'Audience tribunal de commerce — référé',
    summary: 'Tu plaides pour Léa en référé pour rétablir les livraisons.',
    estimated_minutes: 30,
    is_demo: false,
    applicable_law: ['Code de commerce L442-1'],
  },
];

export function getCaseById(id: string): CaseDef | undefined {
  return SEED_CASES.find((c) => c.id === id);
}

export function getDemoCase(): CaseDef {
  return SEED_CASES.find((c) => c.is_demo) ?? SEED_CASES[0];
}
