export const PROGRESS_SCHEMA_VERSION = 1;
export const STORAGE_KEY = "morty.progress.v1";

export type StepId = "listen" | "shadow" | "read" | "video";
export const STEP_ORDER: StepId[] = ["listen", "shadow", "read", "video"];

export type StepStatus = "available" | "in_progress" | "completed";
export type ReviewKind = "word" | "translate" | "listen";

export interface StepState {
  lessonId: string;
  step: StepId;
  status: StepStatus;
  listenPlays: number;
  audioPositionSec: number;
  sentenceIndex: number;
  completedAt: string | null;
}

export interface AiFeedback {
  source: "mock";
  summary: string;
  detail: string;
  fluencyScore: number;
  fluencyNote: string;
  improvements: Array<{ title: string; detail: string }>;
  highlight: string;
  suggestion: "pass" | "retry";
}

export interface RecordingRecord {
  id: string;
  lessonId: string;
  /** R2 object key once upload exists. Null means the take was not stored. */
  audioBlobKey: string | null;
  durationSec: number;
  asrText: string | null;
  aiFeedback: AiFeedback | null;
  scoreFluency: number | null;
  pass: boolean;
  createdAt: string;
}

export interface ReviewItem {
  zCode: string;
  kind: ReviewKind;
  /** Civil date YYYY-MM-DD in the learner timezone. */
  dueAt: string;
  doneAt: string | null;
  relatedV: string;
}

/**
 * One JSON document. P0 writes it to localStorage.
 * A later Worker can put the same document at KV `progress:{userId}`
 * or a D1 row `(user_id, document, updated_at)`.
 */
export interface UserProgress {
  schemaVersion: typeof PROGRESS_SCHEMA_VERSION;
  userId: "local";
  timezone: string;
  dailyMinutes: number;
  currentLessonId: string;
  streakDays: number;
  lastStudyDate: string | null;
  studyDates: string[];
  /** Completed lesson V-codes, e.g. "V73". */
  lessonsDone: string[];
  steps: StepState[];
  recordings: RecordingRecord[];
  reviewsPending: ReviewItem[];
  updatedAt: string;
}

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Remote adapter. Not called in P0. */
export interface ProgressStore {
  load(): Promise<UserProgress | null>;
  save(progress: UserProgress): Promise<void>;
}
