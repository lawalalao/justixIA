// Domain types shared across server/client.

export type Mode = 'consultation' | 'tribunal';
export type Difficulty = 'debutant' | 'intermediaire' | 'avance';
export type Domaine =
  | 'travail'
  | 'famille'
  | 'commercial'
  | 'penal'
  | 'immobilier'
  | 'consommation'
  | 'ohada'
  | 'ohada-travail'
  | 'ohada-commercial';

export interface CaseDef {
  id: string;
  mode: Mode;
  domaine: Domaine;
  difficulty: Difficulty;
  title: string;
  summary: string;
  estimated_minutes: number;
  is_demo: boolean;
  // Backstage — used to seed personas at session start, not shown to user.
  client_persona_prompt?: string;
  judge_persona_prompt?: string;
  opposing_counsel_prompt?: string;
  applicable_law: string[];   // ex: ["Code du travail L1232-1", "Cass. soc. 2019..."]
  hidden_facts?: string[];    // facts the client only reveals when asked
}

export type Role = 'user' | 'assistant' | 'system';

export interface SessionMessage {
  role: Role;
  content: string;
  audio_url?: string;
  ts: number;
}

export interface FeedbackReport {
  qualification_score: number;     // /10
  qualification_notes: string;
  strategy_score: number;
  strategy_notes: string;
  communication_score: number | null; // null en mode Tribunal
  communication_notes: string | null;
  global_score: number;
  strengths: string[];
  improvements: string[];
  references: { article: string; url?: string }[];
  next_cases: string[];            // case ids suggested
}
