import { describe, expect, it } from "vitest";
import lrc from "./lesson1.lrc?raw";
import { LESSON_1, buildLessonSentences } from "./lesson";
import { parseLrc } from "./parseLrc";

describe("lesson 1 text", () => {
  it("parses every timed line in the sample lrc", () => {
    const cues = parseLrc(lrc);
    expect(cues).toHaveLength(22);
    expect(cues[0]?.en).toMatch(/Passage/i);
    expect(cues.find((cue) => cue.en === "Last week,")?.startSec).toBeCloseTo(6.41, 2);
  });

  it("keeps the full passage, including the closing line", () => {
    expect(LESSON_1.sentences).toHaveLength(19);
    expect(LESSON_1.sentences[0]?.en).toBe("Last week,");
    expect(LESSON_1.sentences.at(-1)?.en).toBe("This is a private conversation.");
    expect(LESSON_1.sentences.some((sentence) => sentence.en === "were sitting behind me.")).toBe(
      false,
    );
    expect(
      LESSON_1.sentences.some((sentence) =>
        sentence.en.startsWith("A young man and a young woman were sitting"),
      ),
    ).toBe(true);
  });

  it("uses the green reference translation for the opening and lrc text after it", () => {
    const actors = LESSON_1.sentences.find((sentence) => sentence.en === "I could not hear the actors.");
    const ending = LESSON_1.sentences.find((sentence) => sentence.en === "In the end, I could not bear it.");
    expect(actors?.zh).toBe("因为我听不见演员在说什么。");
    expect(ending?.zh).toBe("最后，我忍无可忍了。");
  });

  it("builds increasing timings", () => {
    const sentences = buildLessonSentences(parseLrc(lrc));
    for (let index = 0; index < sentences.length; index += 1) {
      const sentence = sentences[index];
      expect(sentence?.endSec).toBeGreaterThan(sentence?.startSec ?? 0);
      const next = sentences[index + 1];
      if (next && sentence) expect(next.startSec).toBeGreaterThan(sentence.startSec);
    }
  });
});
