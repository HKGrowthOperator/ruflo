/**
 * Zentrale Domänentypen des Prüfungscoaches.
 * Deterministische Logik (Punkte, Mastery, Prioritäten, Intervalle) arbeitet
 * ausschließlich auf diesen Typen — KI liefert nur Kriterien-Zuordnungen.
 */

/** Acht Hauptbereiche (Masterbrief §4) */
export const MAIN_AREAS = [
  'basics',
  'planung',
  'trockenbaukonstruktionen',
  'bauphysik',
  'sanierung',
  'dachgeschoss',
  'fussboden',
  'sonderkonstruktionen',
] as const;
export type MainArea = (typeof MAIN_AREAS)[number];

export const MAIN_AREA_LABELS: Record<MainArea, string> = {
  basics: 'Basics / Grundlagen',
  planung: 'Baustellenvorbereitung & Planung',
  trockenbaukonstruktionen: 'Trockenbaukonstruktionen',
  bauphysik: 'Bauphysik',
  sanierung: 'Sanierung & Instandsetzung',
  dachgeschoss: 'Dachgeschossausbau',
  fussboden: 'Fußbodensysteme & Estrich',
  sonderkonstruktionen: 'Sonderkonstruktionen & Installationssysteme',
};

/** Erste Arbeitsgewichtung (Masterbrief §4), Summe 100 */
export const MAIN_AREA_WEIGHTS: Record<MainArea, number> = {
  trockenbaukonstruktionen: 23,
  bauphysik: 20,
  planung: 17,
  sanierung: 12,
  dachgeschoss: 10,
  fussboden: 7,
  sonderkonstruktionen: 6,
  basics: 5,
};

/** Kompetenz-Präfixe (Masterbrief §7) → Hauptbereich */
export const PREFIX_TO_AREA: Record<string, MainArea> = {
  BAS: 'basics',
  PLA: 'planung',
  TKW: 'trockenbaukonstruktionen',
  TKD: 'trockenbaukonstruktionen',
  BPH: 'bauphysik',
  SAN: 'sanierung',
  DGA: 'dachgeschoss',
  FBE: 'fussboden',
  SON: 'sonderkonstruktionen',
};

/** Schriftliche Prüfungsteile (aus echten Unterlagen: TK 50 %, SAN 30 %, WiSo ignoriert) */
export type ExamPart = 'tk' | 'san';

/** Kompetenzstatus (Masterbrief §7) */
export const COMPETENCY_STATUSES = [
  'unbekannt',
  'defizit',
  'begonnen',
  'erkannt',
  'abrufbar',
  'anwendbar',
  'stabil',
  'pruefungssicher',
  'rueckfallgefaehrdet',
] as const;
export type CompetencyStatus = (typeof COMPETENCY_STATUSES)[number];

/** Prüfungsoperatoren (Masterbrief §6) */
export const OPERATORS = [
  'nennen',
  'beschreiben',
  'erklaeren',
  'begruenden',
  'unterscheiden',
  'bestimmen',
  'berechnen',
  'beurteilen',
] as const;
export type Operator = (typeof OPERATORS)[number];

/** Aufgabentypen (Masterbrief §10) */
export const QUESTION_TYPES = [
  'single_choice',
  'multiple_choice',
  'short_text',
  'long_text',
  'number_unit',
  'ordering',
  'matching',
  'plan_question',
  'error_finder',
  'system_selection',
  'procedure',
  'project',
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

/** Fragenfamilien (Masterbrief §11) */
export const QUESTION_FAMILIES = [
  'recognition',
  'recall',
  'function',
  'error_finding',
  'application',
  'transfer',
  'speed',
] as const;
export type QuestionFamily = (typeof QUESTION_FAMILIES)[number];

/** Fehlercodes F1–F16 (Masterbrief §9) */
export const ERROR_CODES = [
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8',
  'F9', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16',
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export const ERROR_CODE_LABELS: Record<ErrorCode, string> = {
  F1: 'Begriff unbekannt',
  F2: 'Begriffe verwechselt',
  F3: 'Funktion nicht verstanden',
  F4: 'Wissen da, Anwendung gescheitert',
  F5: 'Anforderung übersehen',
  F6: 'Regel übergeneralisiert',
  F7: 'Plan falsch gelesen',
  F8: 'Rechenmethode falsch',
  F9: 'Rechenfehler',
  F10: 'Antwort unvollständig',
  F11: 'Fachsprache schwach',
  F12: 'geraten',
  F13: 'Operator übersehen',
  F14: 'Einheit fehlt/falsch',
  F15: 'Zeitproblem',
  F16: 'kritisches Sicherheits-/Fachfehlkonzept',
};

/** Hilfestufen 0–5 (Masterbrief §3.4/§18): 0 = keine Hilfe … 5 = vollständige Erklärung */
export type HelpLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** Antwortsicherheit (Masterbrief §5 Confidence Calibration) */
export const CONFIDENCE_LEVELS = ['geraten', 'eher_unsicher', 'teilweise_sicher', 'sicher', 'sehr_sicher'] as const;
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

/** Quellenhierarchie (Masterbrief §27): 1 = Originalprüfung … 6 = ungeprüfte KI-Ergänzung */
export type SourceLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Freigabestatus für Inhalte (Masterbrief §23) */
export const CONTENT_STATUSES = [
  'entwurf',
  'fachlich_geprueft',
  'didaktisch_geprueft',
  'freigegeben',
  'gesperrt',
  'archiviert',
] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

/** Lernmodi nach Restzeit (Masterbrief §16) */
export const PLAN_MODES = [
  'vollstaendig',
  'regulaer',
  'fokussiert',
  'intensiv',
  'bestehensmodus',
  'notfall',
  'punkterettung',
] as const;
export type PlanMode = (typeof PLAN_MODES)[number];

/** Prüfungsreife-Status (Masterbrief §21) */
export const READINESS_STATUSES = [
  'nicht_diagnostiziert',
  'hohes_risiko',
  'grundlagen',
  'bedingt_bestehensfaehig',
  'wahrscheinlich_bestehensfaehig',
  'pruefungsreif',
  'stabil_pruefungsreif',
] as const;
export type ReadinessStatus = (typeof READINESS_STATUSES)[number];

// ---------------------------------------------------------------------------
// Entitäten (Persistenzform)
// ---------------------------------------------------------------------------

export interface Competency {
  id: string; // z. B. "TKW-003"
  parentId: string | null;
  mainArea: MainArea;
  topic: string;
  title: string;
  description: string; // beobachtbare Handlung
  prerequisites: string[]; // Kompetenz-IDs
  examRelevance: number; // 1–5
  dependencyValue: number; // 1–3 (wie viele andere Kompetenzen darauf aufbauen)
  pointsPotential: number; // 1–5
  learningEffort: number; // 1–5
  criticality: number; // 0/1 (Sicherheits-/Kernkompetenz)
  masteryThreshold: number; // 0–1, Standard 0.7
  status: ContentStatus;
}

export interface Choice {
  id: string; // "a"…"e"
  text: string;
  correct: boolean;
  errorCode?: ErrorCode; // Distraktor-Fehlertyp
  explanation?: string;
}

export interface AnswerCriterion {
  id: string;
  text: string; // Kriterium des Erwartungshorizonts
  points: number;
  required: boolean;
  keywords: string[]; // akzeptierte Begriffe
  synonyms: string[]; // sinngleiche Formulierungen
  misconceptionCodes: ErrorCode[]; // kritische Fehlvorstellungen, die dieses Kriterium verfehlen
}

export interface NumberAnswer {
  value: number;
  unit: string;
  tolerance: number; // absolute Toleranz
  solutionPath?: string; // Rechenweg für Feedback
}

export interface Question {
  id: string; // z. B. "Q-TKW-003-A1"
  sourceRef: string; // z. B. "pruefung-44"
  sourceLevel: SourceLevel;
  examPart: ExamPart;
  competencyIds: string[]; // erste = Hauptkompetenz
  family: QuestionFamily;
  operator: Operator;
  qtype: QuestionType;
  difficulty: number; // 1–5
  examRelevance: number; // 1–5
  timeSeconds: number; // Soll-Bearbeitungszeit
  points: number;
  prompt: string;
  context: string | null; // Projekt-/Zeichnungsbeschreibung
  choices: Choice[]; // nur choice-Typen
  numberAnswer: NumberAnswer | null; // nur number_unit
  orderingSolution: string[] | null; // nur ordering (richtige Reihenfolge)
  matchingPairs: { left: string; right: string }[] | null; // nur matching
  modelAnswer: string;
  criteria: AnswerCriterion[]; // Erwartungshorizont für freie Antworten
  typicalErrors: string[];
  status: ContentStatus;
  version: number;
}

export interface LearnerCompetency {
  userId: number;
  competencyId: string;
  status: CompetencyStatus;
  recognitionScore: number; // 0–1
  recallScore: number;
  applicationScore: number;
  transferScore: number;
  stabilityScore: number;
  confidenceCalibration: number; // 0–1 (1 = perfekt kalibriert)
  mastery: number; // 0–1
  nextReviewAt: string | null; // ISO
  lastReviewedAt: string | null;
  attemptCount: number;
  independentSuccesses: number;
  helpedSuccesses: number;
  incorrectAttempts: number;
  lastErrorType: ErrorCode | null;
}

export interface AttemptResult {
  correct: boolean;
  partial: boolean; // Teilpunkte
  pointsAwarded: number;
  pointsMax: number;
  errorCodes: ErrorCode[];
  helpLevel: HelpLevel;
  confidence: Confidence | null;
  timeTakenSeconds: number;
  overTime: boolean;
}
