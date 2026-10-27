import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LessonHeader } from "../components/LessonHeader";
import { Waveform } from "../components/Waveform";
import { LESSON_1 } from "../content/lesson";
import { PLAYER_COPY, lessonPath, nextStep } from "../content/stepCopy";
import { useLessonPlayback } from "../player/useLessonPlayback";
import { completeStep, savePlayback, startPlayback, stepById } from "../store/progress";
import { useProgress } from "../store/ProgressContext";
import { resolveAudioUrl } from "../store/media";
import type { StepId } from "../store/types";

const RATES = [0.75, 1, 1.25];
const PAGE_TITLE: Record<Exclude<StepId, "read">, string> = {
  listen: "听",
  shadow: "跟读",
  video: "视频",
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function ListenPage({ step }: { step: Exclude<StepId, "read"> }) {
  const navigate = useNavigate();
  const { progress, update } = useProgress();
  const copy = PLAYER_COPY[step];
  const savedIndex = stepById(progress, LESSON_1.id, step)?.sentenceIndex ?? 0;
  const playback = useLessonPlayback(
    LESSON_1.sentences,
    step,
    savedIndex,
    resolveAudioUrl(LESSON_1.audioFile),
  );
  const actions = useRef(playback);
  const updateRef = useRef(update);
  const lastSavedIndex = useRef(savedIndex);

  useEffect(() => {
    actions.current = playback;
    updateRef.current = update;
  }, [playback, update]);

  useEffect(() => {
    document.title = `${PAGE_TITLE[step]} · 英语的平行世界`;
  }, [step]);

  useEffect(() => {
    if (playback.index === lastSavedIndex.current) return;
    lastSavedIndex.current = playback.index;
    const sentence = LESSON_1.sentences[playback.index];
    if (!sentence) return;
    const now = new Date();
    updateRef.current((prev) =>
      savePlayback(prev, LESSON_1.id, step, playback.index, sentence.startSec, now),
    );
  }, [playback.index, step]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (document.querySelector("dialog[open]")) return;
      const target = event.target;
      const onControl = target instanceof HTMLElement && Boolean(target.closest("button, a, input, textarea"));
      if (event.key === " " && !onControl) {
        event.preventDefault();
        const started = actions.current.toggle();
        if (started) {
          const now = new Date();
          update((prev) => startPlayback(prev, LESSON_1.id, step, now));
        }
      } else if (event.key === "ArrowRight") {
        actions.current.select(actions.current.index + 1);
      } else if (event.key === "ArrowLeft") {
        actions.current.select(actions.current.index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, update]);

  const status = playback.playing ? copy.playing : playback.hasStarted ? copy.paused : copy.idle;
  const demo = playback.source === "file" ? "正在使用本地课文音频" : copy.demo;

  const onToggle = () => {
    const started = playback.toggle();
    if (started) {
      const now = new Date();
      update((prev) => startPlayback(prev, LESSON_1.id, step, now));
    }
  };

  const finish = () => {
    const now = new Date();
    update((prev) =>
      completeStep(prev, LESSON_1.id, step, now, {
        vCode: LESSON_1.vCode,
        zCode: LESSON_1.zCode,
      }),
    );
    const following = nextStep(step);
    navigate(following === "home" ? "/" : lessonPath(LESSON_1.id, following));
  };

  return (
    <>
      <LessonHeader current={step} />
      <main className="lesson-main">
        <div className="lesson-intro">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
          </div>
          <span className="demo-label">{demo}</span>
        </div>
        <div className="listen-grid">
          <section className={playback.playing ? "card player running" : "card player"}>
            <div className="card-label">
              {copy.playerLabel}
              {step === "video" ? null : <span className="tag">{copy.tag}</span>}
            </div>
            <div className="player-art">
              <span className="audio-caption">A PRIVATE CONVERSATION</span>
              <Waveform />
              <span className="audio-subtitle">{copy.subtitle}</span>
            </div>
            <button type="button" className="play-button" aria-label={playback.playing ? "暂停" : "播放"} onClick={onToggle}>
              {playback.playing ? "Ⅱ" : "▶"}
            </button>
            <p className="player-status">{status}</p>
            {step === "video" ? (
              <a className="bilibili-link" href={LESSON_1.bilibiliUrl} target="_blank" rel="noopener noreferrer">
                在 B 站打开 Lesson 1 · p={LESSON_1.bilibiliPage} ↗
              </a>
            ) : (
              <div className="speeds" aria-label="播放倍速">
                {RATES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={playback.rate === value ? "active" : undefined}
                    onClick={() => playback.setRate(value)}
                  >
                    {value === 1 ? "1.0×" : `${value}×`}
                  </button>
                ))}
              </div>
            )}
            <div className="sentence-controls">
              <button type="button" onClick={() => playback.select(playback.index - 1)}>
                ← 上一句
              </button>
              <span>
                <b>{pad(playback.index + 1)}</b> / {LESSON_1.sentences.length}
              </span>
              <button type="button" onClick={() => playback.select(playback.index + 1)}>
                下一句 →
              </button>
            </div>
            <p className="small muted player-tip">
              {step === "shadow"
                ? "这一句会循环，跟上再切下一句。"
                : step === "video"
                  ? "点上面的链接去 B 站看讲解，看完再打卡。"
                  : "先听懂大意，再留意每一个发音。"}
            </p>
          </section>
          <Transcript index={playback.index} onSelect={playback.select} />
        </div>
      </main>
      <div className="bottom-bar">
        <span>{copy.hint}</span>
        <button type="button" className="primary" onClick={finish}>
          {copy.next} <span>→</span>
        </button>
      </div>
    </>
  );
}

function Transcript({ index, onSelect }: { index: number; onSelect: (index: number) => void }) {
  const [hideZh, setHideZh] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.querySelector<HTMLButtonElement>(".sentence.active")?.scrollIntoView({
      block: "nearest",
    });
  }, [index]);

  return (
    <section className="card transcript">
      <div className="transcript-heading">
        <div className="card-label">课文内容</div>
        <button type="button" className="translation" onClick={() => setHideZh((value) => !value)}>
          中英对照 <span>{hideZh ? "关闭" : "开启"}</span>
        </button>
      </div>
      <div ref={listRef} className={hideZh ? "sentence-list hide-zh" : "sentence-list"}>
        {LESSON_1.sentences.map((sentence, sentenceIndex) => {
          const active = sentenceIndex === index;
          return (
            <button
              key={`${sentence.startSec}-${sentence.en}`}
              type="button"
              className={active ? "sentence active" : "sentence"}
              aria-current={active ? "true" : undefined}
              onClick={() => onSelect(sentenceIndex)}
            >
              <span className="line-number">{pad(sentenceIndex + 1)}</span>
              <span>
                <span className="en">{sentence.en}</span>
                <span className="zh">{sentence.zh}</span>
              </span>
              <span className="sentence-playing">▥</span>
            </button>
          );
        })}
      </div>
      <div className="transcript-foot">
        <span className="blue-dot" />
        点击任意句子，切换精听位置
        <span>课文全文 · {LESSON_1.sentences.length} 句</span>
      </div>
    </section>
  );
}
