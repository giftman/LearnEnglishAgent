import { addDays, civilDate } from "./dates";
import {
  PROGRESS_SCHEMA_VERSION,
  STEP_ORDER,
  STORAGE_KEY,
  type KeyValueStorage,
  type RecordingRecord,
  type ReviewItem,
  type ReviewKind,
  type StepId,
  type StepState,
  type UserProgress,
} from "./types";

const REVIEW_GAP: Record<ReviewKind, number> = {
  word: 1,
  translate: 2,
  listen: 4,
};

export interface LessonCodes {
  vCode: string;
  zCode: string;
}

export function createInitialProgress(now = new Date()): UserProgress {
  const lessonId = "v73";
  const steps: StepState[] = STEP_ORDER.map((step) => ({
    lessonId,
    step,
    status: step === "listen" ? "in_progress" : "available",
    listenPlays: 0,
    audioPositionSec: 0,
    sentenceIndex: 0,
    completedAt: null,
  }));

  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    userId: "local",
    timezone: "Asia/Shanghai",
    dailyMinutes: 30,
    currentLessonId: lessonId,
    streakDays: 0,
    lastStudyDate: null,
    studyDates: [],
    lessonsDone: [],
    steps,
    recordings: [],
    reviewsPending: [],
    updatedAt: now.toISOString(),
  };
}

export function parseProgress(raw: string): UserProgress | null {
  try {
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    if (parsed.schemaVersion !== PROGRESS_SCHEMA_VERSION) return null;
    if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) return null;
    if (typeof parsed.timezone !== "string") return null;
    if (!Array.isArray(parsed.studyDates) || !Array.isArray(parsed.reviewsPending)) return null;
    if (!Array.isArray(parsed.recordings) || !Array.isArray(parsed.lessonsDone)) return null;
    return parsed as UserProgress;
  } catch {
    return null;
  }
}

export function loadProgress(storage: KeyValueStorage, now = new Date()): UserProgress {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return createInitialProgress(now);
  return parseProgress(raw) ?? createInitialProgress(now);
}

export function saveProgress(storage: KeyValueStorage, progress: UserProgress): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function stepById(
  progress: UserProgress,
  lessonId: string,
  step: StepId,
): StepState | undefined {
  return progress.steps.find((item) => item.lessonId === lessonId && item.step === step);
}

export function resumeStep(progress: UserProgress, lessonId: string): StepId | "done" {
  for (const step of STEP_ORDER) {
    const state = stepById(progress, lessonId, step);
    if (!state || state.status !== "completed") return step;
  }
  return "done";
}

export function trackDay(progress: UserProgress): number {
  return Math.max(1, progress.studyDates.length);
}

export function markStudied(progress: UserProgress, now: Date): UserProgress {
  const today = civilDate(now, progress.timezone);
  if (progress.lastStudyDate === today) return progress;
  const streak =
    progress.lastStudyDate === addDays(today, -1) ? progress.streakDays + 1 : 1;
  const studyDates = progress.studyDates.includes(today)
    ? progress.studyDates
    : [...progress.studyDates, today];
  return {
    ...progress,
    streakDays: streak,
    lastStudyDate: today,
    studyDates,
    updatedAt: now.toISOString(),
  };
}

export function startPlayback(
  progress: UserProgress,
  lessonId: string,
  step: StepId,
  now: Date,
): UserProgress {
  const studied = markStudied(progress, now);
  if (step !== "listen" && step !== "shadow") {
    return studied === progress ? { ...studied, updatedAt: now.toISOString() } : studied;
  }
  return {
    ...studied,
    steps: studied.steps.map((item) => {
      if (item.lessonId !== lessonId || item.step !== step) return item;
      return {
        ...item,
        listenPlays: item.listenPlays + 1,
        status: item.status === "completed" ? item.status : "in_progress",
      };
    }),
    updatedAt: now.toISOString(),
  };
}

export function savePlayback(
  progress: UserProgress,
  lessonId: string,
  step: StepId,
  sentenceIndex: number,
  audioPositionSec: number,
  now: Date,
): UserProgress {
  const current = stepById(progress, lessonId, step);
  if (!current) return progress;
  const status = current.status === "completed" ? current.status : "in_progress";
  if (
    current.sentenceIndex === sentenceIndex &&
    current.audioPositionSec === audioPositionSec &&
    current.status === status
  ) {
    return progress;
  }
  return {
    ...progress,
    steps: progress.steps.map((item) => {
      if (item.lessonId !== lessonId || item.step !== step) return item;
      return { ...item, sentenceIndex, audioPositionSec, status };
    }),
    updatedAt: now.toISOString(),
  };
}

export function dueReviews(progress: UserProgress, today: string): ReviewItem[] {
  return progress.reviewsPending.filter((item) => item.doneAt === null && item.dueAt <= today);
}

function mergeReviews(
  existing: ReviewItem[],
  today: string,
  codes: LessonCodes,
): ReviewItem[] {
  const kinds: ReviewKind[] = ["word", "translate", "listen"];
  const additions = kinds
    .filter((kind) => !existing.some((item) => item.zCode === codes.zCode && item.kind === kind))
    .map((kind) => ({
      zCode: codes.zCode,
      kind,
      dueAt: addDays(today, REVIEW_GAP[kind]),
      doneAt: null,
      relatedV: codes.vCode,
    }));
  return [...existing, ...additions];
}

export function completeStep(
  progress: UserProgress,
  lessonId: string,
  step: StepId,
  now: Date,
  codes?: LessonCodes,
): UserProgress {
  const today = civilDate(now, progress.timezone);
  const current = stepById(progress, lessonId, step);
  const already = current?.status === "completed";
  const steps = current
    ? progress.steps.map((item) => {
        if (item.lessonId !== lessonId || item.step !== step) return item;
        return {
          ...item,
          status: "completed" as const,
          completedAt: item.completedAt ?? now.toISOString(),
        };
      })
    : [
        ...progress.steps,
        {
          lessonId,
          step,
          status: "completed" as const,
          listenPlays: 0,
          audioPositionSec: 0,
          sentenceIndex: 0,
          completedAt: now.toISOString(),
        },
      ];
  let next: UserProgress = { ...progress, steps, updatedAt: now.toISOString() };
  if (!already) next = markStudied(next, now);
  if (step === "video" && !already && codes) {
    next = {
      ...next,
      lessonsDone: next.lessonsDone.includes(codes.vCode)
        ? next.lessonsDone
        : [...next.lessonsDone, codes.vCode],
      reviewsPending: mergeReviews(next.reviewsPending, today, codes),
    };
  }
  return next;
}

export function addRecording(progress: UserProgress, recording: RecordingRecord): UserProgress {
  return {
    ...progress,
    recordings: [recording, ...progress.recordings].slice(0, 20),
    updatedAt: recording.createdAt,
  };
}
