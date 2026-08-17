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
}

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
  rawRubricResult?: RubricResult;
}

export interface AppSettings {
  geminiApiKey: string;
  geminiModel: 'gemini-2.0-flash' | 'gemini-1.5-flash';
  googleSheetsUrl: string;
  studentIdName: string;
  teamName: string;
}
