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
    hidden_facts: [
      'La responsable a insulté Sophie en premier (témoin : Karine, collègue)',
      'Aucune lettre de convocation à entretien préalable, juste un appel téléphonique',
      'Sophie a 7 ans d\'ancienneté et n\'a jamais eu d\'avertissement',
    ],
    client_persona_prompt:
      'Tu joues Sophie, ta cliente, juste avant l\'audience prud\'homale. Tu es stressée, tu as peur du juge. Tu parles en 2-3 phrases naturelles. Tu ne révèles l\'insulte de la responsable, l\'absence de convocation écrite et le témoignage de Karine que si l\'avocat te pose la question. Si l\'avocat te demande comment tu te sens, tu réponds que tu as les jambes qui tremblent.',
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
    hidden_facts: [
      'La mère a quitté le domicile avec les enfants sans accord ni motif documenté',
      'Marc a un emploi stable en CDI, horaires de bureau',
      'Les enfants étaient scolarisés à Paris, la mère les a inscrits à Lyon sans consultation',
    ],
    client_persona_prompt:
      'Tu joues Marc, 39 ans, le client de l\'avocat, juste avant l\'audience JAF. Tu es triste et un peu en colère, tu te retiens. Tu parles en 2-3 phrases. Tu ne mentionnes le déménagement sans accord, ton CDI stable et la scolarisation unilatérale à Lyon que si l\'avocat te demande des détails sur la situation des enfants. Tu n\'attaques pas la mère, tu cherches surtout à voir tes enfants régulièrement.',
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
    hidden_facts: [
      'Le contrat de fourniture est exclusif depuis 4 ans, renouvelé tacitement',
      'Léa a 3 mois de stock — si rupture, fermeture en avril',
      'Le fournisseur tente de placer un concurrent qui rachète à plus haut prix',
    ],
    client_persona_prompt:
      'Tu joues Léa, dirigeante d\'une PME bio, juste avant l\'audience en référé. Tu es nerveuse mais déterminée. Tu parles en 2-3 phrases. Tu ne révèles l\'exclusivité de 4 ans, le stock de 3 mois et la manœuvre du concurrent que si l\'avocat te questionne sur le contrat ou les conséquences d\'une rupture.',
    applicable_law: ['Code de commerce L442-1'],
  },
  // ---------- Cas OHADA ----------
  {
    id: 'cons-ohada-recouvrement',
    mode: 'consultation',
    domaine: 'ohada-commercial',
    difficulty: 'intermediaire',
    title: 'Recouvrement de créance commerciale (OHADA)',
    summary:
      'Aïssatou, gérante d\'une société de distribution à Dakar, n\'arrive pas à se faire payer 12 millions de FCFA par un client béninois depuis 8 mois. Elle vient se renseigner sur les voies de recours.',
    estimated_minutes: 20,
    is_demo: false,
    applicable_law: [
      'AUPSRVE — Acte uniforme sur les procédures simplifiées de recouvrement et voies d\'exécution',
      'AUPSRVE art. 1 — injonction de payer',
      'AUPSRVE art. 14 et s. — saisie conservatoire',
      'Traité OHADA art. 10 — supranationalité du droit uniforme',
    ],
    hidden_facts: [
      'Le client a reconnu la dette par email et un bon de livraison signé existe',
      'Aïssatou n\'a jamais envoyé de mise en demeure formelle',
    ],
    client_persona_prompt:
      'Tu joues Aïssatou, 41 ans, gérante d\'une SARL de distribution à Dakar. Tu es pragmatique, un peu inquiète. Tu réponds en 2-3 phrases, en français, avec quelques expressions ouest-africaines naturelles. Tu ne donnes pas tous les détails d\'un coup — tu attends qu\'on te demande pour parler de l\'email de reconnaissance ou du bon de livraison.',
  },
  {
    id: 'cons-ohada-licenciement',
    mode: 'consultation',
    domaine: 'ohada-travail',
    difficulty: 'intermediaire',
    title: 'Licenciement abusif en zone OHADA',
    summary:
      'Mamadou, comptable à Abidjan dans une PME ivoirienne, vient d\'être licencié verbalement après 6 ans d\'ancienneté. Aucune notification écrite, aucun préavis. Il veut savoir ses droits.',
    estimated_minutes: 20,
    is_demo: false,
    applicable_law: [
      'Code du travail ivoirien (loi n°2015-532) art. 16.4 et s. — licenciement',
      'AUDCG — Acte uniforme relatif au droit commercial général',
      'CCJA, arrêt n°043/2017 — qualification du licenciement abusif',
    ],
    hidden_facts: [
      'Mamadou avait refusé de falsifier des écritures comptables 2 mois avant',
      'Aucun avertissement disciplinaire n\'a jamais été notifié',
    ],
    client_persona_prompt:
      'Tu joues Mamadou, 38 ans, comptable à Abidjan. Tu es calme mais blessé, tu cherches à comprendre. Tu réponds en 2-3 phrases en français standard. Tu ne mentionnes le refus de falsifier les écritures que si l\'avocat te demande pourquoi tu as été licencié.',
  },
  {
    id: 'trib-ohada-injonction',
    mode: 'tribunal',
    domaine: 'ohada-commercial',
    difficulty: 'avance',
    title: 'Audience d\'injonction de payer (OHADA)',
    summary:
      'Tu plaides pour le créancier devant le tribunal de commerce. Le débiteur a formé opposition à l\'ordonnance d\'injonction de payer. Montant : 8 M FCFA, facture impayée.',
    estimated_minutes: 25,
    is_demo: false,
    applicable_law: [
      'AUPSRVE art. 1 à 18 — procédure d\'injonction de payer',
      'AUPSRVE art. 9 — opposition à l\'ordonnance',
      'AUPSRVE art. 14 — effets de l\'opposition',
      'CCJA, arrêt n°005/2014 — recevabilité de l\'opposition tardive',
    ],
    judge_persona_prompt:
      'Tu présides la chambre commerciale d\'un tribunal de commerce en zone OHADA. Tu es rigoureux, tu vérifies la régularité de la procédure d\'injonction (signification, délai d\'opposition). Tu interromps poliment pour exiger des références précises aux articles de l\'AUPSRVE. Tu réponds en 2-3 phrases courtes.',
    opposing_counsel_prompt:
      'Tu défends le débiteur. Ta stratégie : contester la créance (livraisons non conformes), invoquer la nullité de la signification, et subsidiairement demander des délais de paiement. Tu cites systématiquement l\'AUPSRVE et l\'AUDCG. Tu plaides en 4-6 phrases.',
    hidden_facts: [
      'La signification a été faite à personne par huissier, procès-verbal en bonne et due forme',
      'Le débiteur a versé 2 acomptes de 500 000 FCFA — reconnaissance partielle',
      'Délai d\'opposition de 15 jours respecté (juste à temps)',
    ],
    client_persona_prompt:
      'Tu joues le représentant du créancier (gérant de la société qui a livré la marchandise impayée), juste avant l\'audience d\'opposition à l\'injonction de payer. Tu es agacé que le débiteur fasse opposition. Tu parles en 2-3 phrases en français. Tu ne révèles la signification par huissier, les acomptes versés et le respect des délais que si l\'avocat te pose la question. Tu insistes sur ta trésorerie tendue.',
  },
  {
    id: 'trib-ohada-societe',
    mode: 'tribunal',
    domaine: 'ohada-commercial',
    difficulty: 'avance',
    title: 'Litige entre associés (AUSCGIE)',
    summary:
      'Tu plaides pour un associé minoritaire qui demande la nullité d\'une délibération d\'AGE adoptée sans convocation régulière. SARL en Côte d\'Ivoire, capital 50 M FCFA.',
    estimated_minutes: 30,
    is_demo: false,
    applicable_law: [
      'AUSCGIE — Acte uniforme sur le droit des sociétés commerciales et du GIE',
      'AUSCGIE art. 337 — convocation des associés de SARL',
      'AUSCGIE art. 244 — nullité des délibérations',
      'CCJA, arrêt n°021/2010 — abus de majorité',
    ],
    judge_persona_prompt:
      'Tu présides un tribunal de commerce en zone OHADA. Tu maîtrises l\'AUSCGIE. Tu poses des questions précises sur les modalités de convocation, le quorum et la majorité. Tu interromps si l\'avocat est imprécis. 2-3 phrases.',
    opposing_counsel_prompt:
      'Tu défends la majorité. Tu invoques que l\'associé minoritaire avait connaissance de l\'AGE par d\'autres moyens, que les décisions prises sont conformes à l\'intérêt social, et que la nullité serait disproportionnée. Tu cites AUSCGIE art. 337 et la jurisprudence CCJA. 4-6 phrases.',
    hidden_facts: [
      'La convocation a été envoyée par email seulement, alors que les statuts exigent un courrier recommandé',
      'L\'AGE a augmenté le capital, diluant la part du minoritaire de 32 % à 12 %',
      'Le minoritaire détient des preuves de réunions parallèles entre majoritaires',
    ],
    client_persona_prompt:
      'Tu joues l\'associé minoritaire d\'une SARL ivoirienne, juste avant l\'audience. Tu es en colère, tu te sens trahi par tes anciens partenaires. Tu parles en 2-3 phrases. Tu ne révèles l\'irrégularité de la convocation (email au lieu de recommandé), la dilution de ta participation et les preuves des réunions parallèles que si l\'avocat te questionne précisément.',
  },
];

export function getCaseById(id: string): CaseDef | undefined {
  return SEED_CASES.find((c) => c.id === id);
}

export function getDemoCase(): CaseDef {
  return SEED_CASES.find((c) => c.is_demo) ?? SEED_CASES[0];
}
