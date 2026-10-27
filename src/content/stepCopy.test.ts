import { describe, expect, it } from "vitest";
import { AUDIO_FAILED, PLAYER_COPY } from "./stepCopy";

describe("learner-facing player copy", () => {
  it("does not describe the lesson as a silent demo", () => {
    const text = JSON.stringify(PLAYER_COPY);
    expect(text).not.toContain("演示");
    expect(text).not.toContain("无音频");
    expect(text).not.toContain("占位");
    expect(AUDIO_FAILED).toBe("课文音频加载失败");
    expect(PLAYER_COPY.listen.idle).toBe("点击播放，从这一句开始");
    expect(PLAYER_COPY.listen.playing).toBe("正在播放 · 句子会跟着走");
    expect(PLAYER_COPY.video.title).toBe("看讲解，把这一课听懂。");
  });
});
