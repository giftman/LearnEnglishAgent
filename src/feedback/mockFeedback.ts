import type { AiFeedback, RecordingRecord } from "../store/types";

/** Fixed sample. P0 does not call a model or a microphone. */
export const MOCK_READ_FEEDBACK: AiFeedback = {
  source: "mock",
  summary: "表达清晰，节奏再放松一点。",
  detail: "整体朗读流畅，句子完整。试着让重音和停顿更自然，你会读得更有画面感。",
  fluencyScore: 4,
  fluencyNote: "已经很接近自然表达",
  improvements: [
    {
      title: "留意 theatre 的发音",
      detail: "开头 /θ/ 轻咬舌尖，让气流自然通过。",
    },
    {
      title: "让 very good 连起来",
      detail: "减少词与词之间的停顿，保持连贯。",
    },
    {
      title: "突出 interesting 的重音",
      detail: "第一音节稍重，其余音节轻一些。",
    },
  ],
  highlight: "句子完整，听得清每一个词。",
  suggestion: "pass",
};

export function createMockRecording(
  lessonId: string,
  durationSec: number,
  now: Date,
): RecordingRecord {
  return {
    id: `rec-${now.getTime()}`,
    lessonId,
    audioBlobKey: null,
    durationSec,
    asrText: null,
    aiFeedback: MOCK_READ_FEEDBACK,
    scoreFluency: MOCK_READ_FEEDBACK.fluencyScore,
    pass: MOCK_READ_FEEDBACK.suggestion === "pass",
    createdAt: now.toISOString(),
  };
}
