export interface TaskRubric {
  A: string;
  B: string;
  C: string;
}

export interface Topic {
  id: string;
  unit: string;
  title: string;
  keywords: string[];
  task_rubric: TaskRubric;
}

export interface OreoData {
  opinion: string;   // O: 주장
  reason: string;    // R: 이유
  example: string;   // E: 근거/사례
  opinion2: string;  // O: 강조
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  wpm?: number;
  fillerCount?: number;
  detectedKeywords?: string[];
  phase?: 'opening' | 'questioning' | 'rebuttal' | 'closing';
}

export interface RubricGrades {
  argumentation: 'A' | 'B' | 'C';
  rebuttal: 'A' | 'B' | 'C';
  evidence: 'A' | 'B' | 'C';
  attitude: 'A' | 'B' | 'C';
}

export interface SideEvaluation {
  grades: RubricGrades;
  task_grade: 'A' | 'B' | 'C';
  strengths: string[];
  improvements: string[];
  concept_usage: string;
}

export interface RubricResult {
  summary: string;
  affirmative: SideEvaluation;
  negative: SideEvaluation;
  audioUrl?: string;
  verdictWinner?: 'affirmative' | 'negative' | 'draw';
}

// Debate Options (AI와 토론하기)
export type DebateModelOption = 'one_on_one' | 'affirmative_vs_negative';
export type DebateTypeOption = 'speech' | 'text_post';
export type TargetTimeOption = 60 | 120 | 180 | 0; // seconds, 0 = unlimited

export interface DebateOptions {
  model: DebateModelOption;
  type: DebateTypeOption;
  targetTimeSeconds: TargetTimeOption;
  realtimeFeedback: boolean;
  userRole: 'affirmative' | 'negative';
}

// Debate Flow Lineage Item
export interface DebateFlowStep {
  stepIndex: number;
  speaker: string; // e.g. "찬성1(사용자)" | "반대1(AI)"
  phase: '입론' | '교차조사' | '반론' | '최종발언';
  summary: string;
  keyPoint: string;
  counteredStepIndex?: number;
}

// Full Saved Debate Session Record for Archive (기록실)
export interface SavedEvaluationRecord {
  id: string;
  timestamp: string;
  studentIdName: string;
  teamName: string;
  topicId: string;
  topicTitle: string;
  affSummaryGrade: string;
  negSummaryGrade: string;
  detailFeedbackSummary: string;
  audioUrl: string;
  options?: DebateOptions;
  oreoData?: OreoData;
  chatHistory?: ChatMessage[];
  debateFlow?: DebateFlowStep[];
  rawRubricResult?: RubricResult;
}

export interface AppSettings {
  geminiApiKey: string;
  geminiModel: 'gemini-2.0-flash' | 'gemini-1.5-flash';
  googleSheetsUrl: string;
  studentIdName: string;
  teamName: string;
}
