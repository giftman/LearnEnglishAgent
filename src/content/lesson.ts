import lrcSource from "./lesson1.lrc?raw";
import { bilibiliLessonUrl } from "../store/media";
import { parseLrc, type Cue } from "./parseLrc";

export interface Sentence {
  en: string;
  zh: string;
  startSec: number;
  endSec: number;
}

export interface Lesson {
  id: string;
  nc2: number;
  vCode: string;
  zCode: string;
  titleEn: string;
  titleZh: string;
  bookLabel: string;
  trackLabel: string;
  audioFile: string;
  lrcFile: string;
  bilibiliBvid: string;
  bilibiliPage: number;
  bilibiliUrl: string;
  words: string[];
  sentences: Sentence[];
}

const ZH_OVERRIDE: Record<string, string> = {
  "Last week,": "上周，",
  "I went to the theatre.": "我去看了戏。",
  "I had a very good seat.": "我的座位很好。",
  "The play was very interesting.": "戏演得非常精彩。",
  "I did not enjoy it.": "我却没能欣赏它。",
  "They were talking loudly.": "大声地说着话。",
  "I got very angry.": "我非常生气。",
  "I could not hear the actors.": "因为我听不见演员在说什么。",
  "I turned round.": "我回过头去。",
  "I looked at the man and the woman angrily.": "怒视着那一男一女。",
  "They did not pay any attention.": "他们却毫不理会。",
};

const MERGE_FROM = "A young man and a young woman";
const MERGE_NEXT = "were sitting behind me.";
const MERGED_EN = "A young man and a young woman were sitting behind me.";
const MERGED_ZH = "一青年男子与一青年女子坐在我的身后。";

function isIntro(en: string): boolean {
  return /^passage\b/i.test(en) || en.toLowerCase() === "a private conversation";
}

export function buildLessonSentences(cues: Cue[]): Sentence[] {
  const rows: Array<{ en: string; zh: string; startSec: number }> = [];
  for (let index = 0; index < cues.length; index += 1) {
    const cue = cues[index];
    if (!cue || isIntro(cue.en)) continue;
    const next = cues[index + 1];
    if (cue.en === MERGE_FROM && next?.en === MERGE_NEXT) {
      rows.push({ en: MERGED_EN, zh: MERGED_ZH, startSec: cue.startSec });
      index += 1;
      continue;
    }
    rows.push({
      en: cue.en,
      zh: ZH_OVERRIDE[cue.en] ?? cue.zh,
      startSec: cue.startSec,
    });
  }

  return rows.map((row, index) => {
    const nextStart = rows[index + 1]?.startSec;
    return {
      ...row,
      endSec: nextStart ?? row.startSec + 4,
    };
  });
}

export const LESSON_1: Lesson = {
  id: "v73",
  nc2: 1,
  vCode: "V73",
  zCode: "Z73",
  titleEn: "A private conversation",
  titleZh: "一次私人谈话",
  bookLabel: "新概念二 · Lesson 1",
  trackLabel: "新概念二 · 单词线",
  audioFile: "01.A Private Conversation.mp3",
  lrcFile: "01.A Private Conversation.lrc",
  bilibiliBvid: "BV1AK4y1A7Z1",
  bilibiliPage: 2,
  bilibiliUrl: bilibiliLessonUrl("BV1AK4y1A7Z1", 2),
  words: [
    "private",
    "conversation",
    "theatre",
    "seat",
    "loudly",
    "angrily",
    "attention",
    "rudely",
    "business",
  ],
  sentences: buildLessonSentences(parseLrc(lrcSource)),
};

export const READ_EXCERPT = {
  lines: [
    "Last week, I went to the theatre.",
    "I had a very good seat.",
    "The play was very interesting.",
    "I did not enjoy it.",
  ],
  zhLines: ["上周，我去看了戏。我的座位很好。", "戏演得非常精彩，我却没能欣赏它。"],
};
