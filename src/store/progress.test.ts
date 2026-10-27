import { describe, expect, it } from "vitest";
import {
  completeStep,
  createInitialProgress,
  dueReviews,
  loadProgress,
  resumeStep,
  saveProgress,
  startPlayback,
} from "./progress";
import { STORAGE_KEY, type KeyValueStorage } from "./types";

const codes = { vCode: "V73", zCode: "Z73" };
const now = new Date("2026-10-27T04:00:00Z");

function memoryStorage(): KeyValueStorage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe("progress document", () => {
  it("starts at listen with an empty streak", () => {
    const progress = createInitialProgress(now);
    expect(resumeStep(progress, "v73")).toBe("listen");
    expect(progress.streakDays).toBe(0);
    expect(dueReviews(progress, "2026-10-27")).toEqual([]);
    expect(progress.schemaVersion).toBe(1);
  });

  it("rounds-trips through a key-value store and rejects a bad document", () => {
    const storage = memoryStorage();
    const progress = createInitialProgress(now);
    saveProgress(storage, progress);
    expect(loadProgress(storage, now)).toEqual(progress);
    storage.setItem(STORAGE_KEY, "{");
    expect(loadProgress(storage, now).streakDays).toBe(0);
    storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 2 }));
    expect(loadProgress(storage, now).currentLessonId).toBe("v73");
  });

  it("advances one step at a time and only counts the study day once", () => {
    let progress = createInitialProgress(now);
    progress = startPlayback(progress, "v73", "listen", now);
    progress = completeStep(progress, "v73", "listen", now, codes);
    expect(resumeStep(progress, "v73")).toBe("shadow");
    expect(progress.streakDays).toBe(1);
    expect(progress.lastStudyDate).toBe("2026-10-27");
    const plays = progress.steps.find((step) => step.step === "listen")?.listenPlays;
    expect(plays).toBe(1);

    const again = completeStep(progress, "v73", "listen", now, codes);
    expect(again.streakDays).toBe(1);
    expect(again.studyDates).toEqual(["2026-10-27"]);
  });

  it("continues a streak from yesterday and resets after a gap", () => {
    const yesterday = createInitialProgress(now);
    yesterday.lastStudyDate = "2026-10-26";
    yesterday.streakDays = 3;
    const continued = completeStep(yesterday, "v73", "listen", now, codes);
    expect(continued.streakDays).toBe(4);

    const gap = createInitialProgress(now);
    gap.lastStudyDate = "2026-10-20";
    gap.streakDays = 6;
    expect(completeStep(gap, "v73", "listen", now, codes).streakDays).toBe(1);
  });

  it("schedules Z73 across later days when the video step is checked off", () => {
    let progress = createInitialProgress(now);
    for (const step of ["listen", "shadow", "read", "video"] as const) {
      progress = completeStep(progress, "v73", step, now, codes);
    }
    expect(resumeStep(progress, "v73")).toBe("done");
    expect(progress.lessonsDone).toEqual(["V73"]);
    expect(dueReviews(progress, "2026-10-27")).toEqual([]);
    expect(dueReviews(progress, "2026-10-28").map((item) => item.kind)).toEqual(["word"]);
    expect(dueReviews(progress, "2026-10-29").map((item) => item.kind)).toEqual([
      "word",
      "translate",
    ]);
    expect(dueReviews(progress, "2026-10-31").map((item) => item.kind)).toEqual([
      "word",
      "translate",
      "listen",
    ]);

    const twice = completeStep(progress, "v73", "video", now, codes);
    expect(twice.reviewsPending).toHaveLength(3);
    expect(twice.lessonsDone).toEqual(["V73"]);
  });
});
