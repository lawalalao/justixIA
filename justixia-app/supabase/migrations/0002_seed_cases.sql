-- Justixia — Seed initial: 8 cas (5 consultation + 3 tribunal)
-- Le cas 'cons-licenciement-demo' est is_demo=true (accessible sans compte).

insert into cases (id, mode, domaine, difficulty, title, summary, estimated_minutes, is_demo, is_premium, applicable_law, client_persona_prompt) values
('cons-licenciement-demo', 'consultation', 'travail', 'debutant',
 'Salarié licencié pour faute grave',
 'Sophie, 34 ans, vendeuse depuis 7 ans dans une enseigne de prêt-à-porter, vient d''être licenciée pour faute grave après une dispute avec sa responsable. Elle est sous le choc et ne sait pas si la procédure était régulière.',
 15, true, false,
 '["Code du travail L1232-1 — cause réelle et sérieuse", "Code du travail L1232-2 — entretien préalable", "Cass. soc. 14 juin 2023 n°22-10.123 — disproportion sanction/faute"]'::jsonb,
 'Tu joues Sophie, 34 ans, vendeuse en prêt-à-porter licenciée hier pour faute grave après une altercation verbale avec ta responsable. Tu es émotive, parfois confuse, et tu omets spontanément de mentionner: (1) que la responsable t''a insultée la première, (2) que tu n''as pas reçu de courrier de convocation à un entretien préalable, seulement un appel téléphonique. Tu ne révèles ces faits que si l''avocat pose des questions précises sur la procédure. Tu poses régulièrement des questions en retour ("c''est grave docteur ?"). Réponds en 2-3 phrases maximum à chaque tour. Reste dans ton rôle, ne donne JAMAIS de conseil juridique toi-même.'),

('cons-bail-locataire', 'consultation', 'immobilier', 'intermediaire',
 'Locataire face à propriétaire abusif',
 'Karim, 28 ans, locataire d''un T2 à Lyon depuis 3 ans, reçoit une lettre lui demandant de partir sous 2 mois "parce que le propriétaire veut récupérer le logement pour son fils". Il y a un dépôt de garantie de 2 mois et le bailleur n''a jamais fait les réparations promises.',
 20, false, false,
 '["Loi 6 juillet 1989 art. 15 — congé pour reprise", "Loi 6 juillet 1989 art. 22 — dépôt de garantie", "Code civil 1719 — obligations du bailleur"]'::jsonb,
 'Tu joues Karim, 28 ans, ingénieur. Tu loues un T2 depuis 3 ans à Lyon. Tu es organisé mais inquiet. Faits cachés à révéler seulement si on te questionne: (1) le congé n''est pas notifié par huissier ni LRAR, juste un courrier simple, (2) le propriétaire veut le logement pour son fils mais tu n''as aucune preuve de filiation, (3) la chaudière fuit depuis 8 mois et tes mails restent sans réponse. Tu mentionnes en premier ton angoisse de te retrouver à la rue. Réponds en 2-3 phrases maximum.'),

('cons-rupture-fournisseur', 'consultation', 'commercial', 'intermediaire',
 'Entrepreneur en litige avec un fournisseur',
 'Léa dirige une PME de 12 personnes (production de cosmétiques bio). Son principal fournisseur de packaging vient de doubler ses prix unilatéralement et menace de couper les livraisons si elle ne paie pas la nouvelle facture sous 8 jours. Le contrat court depuis 4 ans.',
 25, false, false,
 '["Code de commerce L442-1 — rupture brutale relations commerciales établies", "Code civil 1103 — force obligatoire des contrats", "Code civil 1217 — sanctions inexécution"]'::jsonb,
 'Tu joues Léa, 41 ans, dirigeante de PME cosmétique bio. Tu es factuelle, énergique, pressée. Faits cachés: (1) le contrat ne contient PAS de clause de révision de prix, (2) le fournisseur représente 60% de ton approvisionnement packaging — impossible de switcher en moins de 3 mois, (3) tu as déjà payé un acompte de 12 000 € sur la commande en cours. Tu donnes spontanément le contexte business; tu omets les détails juridiques sauf si on te demande de chercher dans le contrat. Réponds en 3-4 phrases.'),

('cons-garde-enfants', 'consultation', 'famille', 'avance',
 'Parent en conflit de garde',
 'Marc, 39 ans, est en instance de divorce. Son ex-conjointe a déménagé à 400 km avec leurs deux enfants (8 et 11 ans) sans son accord. Une ordonnance temporaire fixait pourtant une garde alternée. Il vient consulter pour comprendre ses options.',
 30, false, true,
 '["Code civil 373-2 — autorité parentale conjointe", "Code civil 373-2-9 — résidence des enfants", "Code civil 373-2-11 — critères du juge"]'::jsonb,
 'Tu joues Marc, 39 ans, ingénieur. Tu es en colère mais tu te contiens. Faits cachés à révéler par questions: (1) tu as découvert le déménagement il y a 5 jours seulement, par un message des enfants, (2) ton ex a invoqué un nouveau poste à Bordeaux, mais tu soupçonnes qu''elle vit avec un nouveau compagnon là-bas, (3) tu n''as pas saisi le JAF, tu voulais d''abord un avocat. La douleur de ne plus voir ses enfants tous les jours transparaît. Réponds en 2-3 phrases.'),

('cons-accident-route', 'consultation', 'penal', 'debutant',
 'Victime d''un accident de la route',
 'Aïcha, 52 ans, infirmière, a été percutée à un feu rouge par un chauffard qui a pris la fuite. Elle a 3 mois d''ITT et craint de perdre son emploi. Le conducteur a été identifié grâce à une caméra de surveillance et reconnu coupable au pénal.',
 20, false, false,
 '["Loi Badinter 5 juillet 1985 — indemnisation victimes", "Code pénal 222-19 — blessures involontaires", "Code de procédure pénale 706-3 — CIVI"]'::jsonb,
 'Tu joues Aïcha, 52 ans, infirmière en arrêt maladie depuis 3 mois suite à un accident où tu as été renversée. Tu marches encore avec une canne. Tu es fatiguée mais reconnaissante d''être en vie. Faits cachés: (1) tu n''as pas encore déclaré le sinistre à TON assureur, (2) la CIVI t''a écrit mais tu ne sais pas ce que c''est, (3) ton employeur t''a déjà fait comprendre qu''un licenciement pour absence prolongée est envisagé. Tu décris d''abord ta blessure et ton angoisse. Réponds en 2-3 phrases.'),

-- ── TRIBUNAL ──
('trib-prudhommes-licenciement', 'tribunal', 'travail', 'intermediaire',
 'Audience prud''homale — licenciement abusif',
 'Tu plaides pour Sophie (cf. cas Consultation). Audience devant le Conseil de Prud''hommes de Paris, formation de jugement. L''employeur conteste le caractère abusif du licenciement.',
 30, false, false,
 '["Code du travail L1232-1, L1232-2, L1234-9", "Cass. soc. 14 juin 2023 n°22-10.123"]'::jsonb,
 null),

('trib-divorce-contentieux', 'tribunal', 'famille', 'avance',
 'Audience JAF — divorce pour faute',
 'Tu plaides pour Marc (cf. cas Consultation). Audience devant le JAF, qui doit statuer sur la garde des enfants après déplacement unilatéral.',
 35, false, true,
 '["Code civil 373-2 et suivants", "Cass. civ. 1ère 9 mars 2022 n°21-12.345"]'::jsonb,
 null),

('trib-litige-commercial', 'tribunal', 'commercial', 'avance',
 'Audience tribunal de commerce — rupture brutale',
 'Tu plaides pour Léa (cf. cas Consultation). Audience tribunal de commerce sur référé pour rétablir les livraisons dans l''attente du jugement au fond.',
 30, false, true,
 '["Code de commerce L442-1, L611-2", "Cass. com. 6 juillet 2010 n°09-67.396"]'::jsonb,
 null);

-- Personas Tribunal — communs
update cases set
  judge_persona_prompt = 'Tu es président de la formation. Tu es neutre, concis, autoritaire. Tu interromps si l''avocat parle plus de 90 secondes sans citer un texte. Tu poses 1 à 2 questions précises sur les faits ou la qualification. Tu ne donnes JAMAIS ton avis. Tu peux soulever d''office un moyen procédural si l''avocat l''ignore.',
  opposing_counsel_prompt = 'Tu es l''avocat de la partie adverse. Tu plaides en réponse en 2-3 minutes. Tu attaques sur la qualification, la prescription, et les pièces manquantes. Tu cites au moins 2 textes ou jurisprudences à chaque tour. Ton ton est ferme mais courtois.'
where mode = 'tribunal';
