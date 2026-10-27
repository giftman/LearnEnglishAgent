import { describe, expect, it } from "vitest";
import { bilibiliLessonUrl, r2AudioKey, r2RecordingKey, resolveAudioUrl } from "./media";

describe("media keys", () => {
  it("keeps the textbook filename as the R2 object key", () => {
    expect(r2AudioKey("01.A Private Conversation.mp3")).toBe(
      "audio/nc2/01.A Private Conversation.mp3",
    );
    expect(r2AudioKey("01.A Private Conversation.lrc")).toBe(
      "audio/nc2/01.A Private Conversation.lrc",
    );
    expect(r2RecordingKey("local", "v73", "rec-1")).toBe("recordings/local/v73/rec-1.webm");
  });

  it("encodes the local public path and can point at an R2 origin", () => {
    expect(resolveAudioUrl("01.A Private Conversation.mp3", "")).toBe(
      "/assets/audio/nc2/01.A%20Private%20Conversation.mp3",
    );
    expect(resolveAudioUrl("01.A Private Conversation.mp3", "https://audio.example/")).toBe(
      "https://audio.example/audio/nc2/01.A Private Conversation.mp3",
    );
  });

  it("points lesson 1 at bilibili page 2", () => {
    expect(bilibiliLessonUrl("BV1AK4y1A7Z1", 2)).toBe(
      "https://www.bilibili.com/video/BV1AK4y1A7Z1/?p=2",
    );
  });
});
