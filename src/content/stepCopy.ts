import type { StepId } from "../store/types";

export const STEP_LABEL: Record<StepId, string> = {
  listen: "听",
  shadow: "跟读",
  read: "朗读",
  video: "视频",
};

export function lessonPath(lessonId: string, step: StepId): string {
  return `/lesson/${lessonId}/${step}`;
}

export function nextStep(step: StepId): StepId | "home" {
  if (step === "listen") return "shadow";
  if (step === "shadow") return "read";
  if (step === "read") return "video";
  return "home";
}

interface PlayerCopy {
  eyebrow: string;
  title: string;
  next: string;
  hint: string;
  playerLabel: string;
  tag: string;
  subtitle: string;
  idle: string;
  playing: string;
  paused: string;
}

export const AUDIO_FAILED = "课文音频加载失败";

export const PLAYER_COPY: Record<Exclude<StepId, "read">, PlayerCopy> = {
  listen: {
    eyebrow: "STEP 01 / LISTEN",
    title: "先听，让耳朵熟悉英语。",
    next: "听完了，进入跟读",
    hint: "不必一次听懂，熟悉就是进步。",
    playerLabel: "音频播放",
    tag: "逐句精听",
    subtitle: "LESSON 01 · NEW CONCEPT ENGLISH",
    idle: "点击播放，从这一句开始",
    playing: "正在播放 · 句子会跟着走",
    paused: "已暂停 · 点击继续",
  },
  shadow: {
    eyebrow: "STEP 02 / SHADOWING",
    title: "跟着原句，找到表达的节奏。",
    next: "跟读完了，进入朗读",
    hint: "听一句，跟一句。",
    playerLabel: "音频播放",
    tag: "逐句精听",
    subtitle: "LESSON 01 · NEW CONCEPT ENGLISH",
    idle: "点击播放，循环当前句",
    playing: "正在循环当前句",
    paused: "已暂停 · 点击继续跟读",
  },
  video: {
    eyebrow: "STEP 04 / VIDEO",
    title: "看讲解，把这一课听懂。",
    next: "完成本课，返回首页",
    hint: "看完 B 站讲解，再回来打卡。",
    playerLabel: "课程视频",
    tag: "外链",
    subtitle: "BILIBILI · LESSON 01",
    idle: "点击播放课文，或去 B 站看讲解",
    playing: "正在播放课文",
    paused: "已暂停 · 点击继续",
  },
};
