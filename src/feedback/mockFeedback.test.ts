import { describe, expect, it } from "vitest";
import { MOCK_READ_FEEDBACK, createMockRecording } from "./mockFeedback";

describe("mock read-aloud feedback", () => {
  it("matches the sample card: 4/5 and three fixes", () => {
    expect(MOCK_READ_FEEDBACK.fluencyScore).toBe(4);
    expect(MOCK_READ_FEEDBACK.improvements).toHaveLength(3);
    expect(MOCK_READ_FEEDBACK.suggestion).toBe("pass");
    expect(MOCK_READ_FEEDBACK.source).toBe("mock");
  });

  it("does not pretend a recording was uploaded", () => {
    const recording = createMockRecording("v73", 12, new Date("2026-10-27T04:00:00Z"));
    expect(recording.audioBlobKey).toBeNull();
    expect(recording.asrText).toBeNull();
    expect(recording.pass).toBe(true);
    expect(recording.scoreFluency).toBe(4);
  });
});
