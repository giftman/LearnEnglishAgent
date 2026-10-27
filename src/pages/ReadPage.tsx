import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LessonHeader } from "../components/LessonHeader";
import { MicIcon } from "../components/Icons";
import { Waveform } from "../components/Waveform";
import { LESSON_1, READ_EXCERPT } from "../content/lesson";
import { lessonPath } from "../content/stepCopy";
import { MOCK_READ_FEEDBACK, createMockRecording } from "../feedback/mockFeedback";
import { addRecording, completeStep, markStudied } from "../store/progress";
import { useProgress } from "../store/ProgressContext";

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function ReadPage() {
  const navigate = useNavigate();
  const { update } = useProgress();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(12);
  const [tookRecording, setTookRecording] = useState(false);
  const secondsRef = useRef(seconds);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    document.title = "朗读与 AI 反馈 · 英语的平行世界";
  }, []);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  const toggleRecord = () => {
    if (recording) {
      setRecording(false);
      setTookRecording(true);
      const now = new Date();
      const duration = secondsRef.current;
      update((prev) => addRecording(markStudied(prev, now), createMockRecording(LESSON_1.id, duration, now)));
      return;
    }
    setSeconds(0);
    setRecording(true);
    update((prev) => markStudied(prev, new Date()));
  };

  const pass = () => {
    const now = new Date();
    update((prev) =>
      completeStep(prev, LESSON_1.id, "read", now, {
        vCode: LESSON_1.vCode,
        zCode: LESSON_1.zCode,
      }),
    );
    navigate(lessonPath(LESSON_1.id, "video"));
  };

  const label = recording
    ? "正在录音演示，点击结束"
    : tookRecording
      ? "录音演示结束，可再次练习"
      : "准备好，再读一次";

  return (
    <>
      <LessonHeader current="read" />
      <main className="lesson-main">
        <div className="lesson-intro">
          <div>
            <p className="eyebrow">STEP 03 / READ ALOUD</p>
            <h1>大声读出来，让表达更自然。</h1>
            <p className="muted">读完这一段，看看还有哪些可以进步的地方。</p>
          </div>
          <span className="demo-label">示例录音与 AI 反馈</span>
        </div>
        <div className="read-grid">
          <section className={recording ? "card recording running" : "card recording"}>
            <div className="card-label">
              朗读练习<span className="tag">自由朗读</span>
            </div>
            <div className="reading-excerpt">
              <span className="quote-mark">“</span>
              <p>
                {READ_EXCERPT.lines.map((line, index) => (
                  <span key={line}>
                    {line}
                    {index < READ_EXCERPT.lines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </p>
              <span className="muted small">
                {READ_EXCERPT.zhLines[0]}
                <br />
                {READ_EXCERPT.zhLines[1]}
              </span>
            </div>
            <div className="record-area">
              <button
                type="button"
                className="mic"
                id="record"
                aria-label={recording ? "结束录音演示" : "开始录音演示"}
                onClick={toggleRecord}
              >
                <MicIcon />
              </button>
              <h3>{label}</h3>
              <p className="muted small">点击麦克风，体验录音状态</p>
              <Waveform />
              <div className="timer">{formatClock(seconds)}</div>
            </div>
            <div className="record-tip">
              <span>ⓘ</span> 保持环境安静，语速自然，读完整句后再停止。
            </div>
          </section>
          <aside className="card feedback">
            <div className="feedback-header">
              <h2>
                <span className="blue">✧</span> AI 反馈
              </h2>
              <span className="complete">✓ 分析完成</span>
            </div>
            <section className="feedback-section">
              <p className="section-label">总评</p>
              <h3>{MOCK_READ_FEEDBACK.summary}</h3>
              <p className="muted">{MOCK_READ_FEEDBACK.detail}</p>
            </section>
            <section className="score">
              <div>
                <span className="section-label">流利度</span>
                <p className="small muted">{MOCK_READ_FEEDBACK.fluencyNote}</p>
              </div>
              <div className="score-number">
                {MOCK_READ_FEEDBACK.fluencyScore}
                <span>/ 5</span>
              </div>
              <div className="score-bars">
                {Array.from({ length: 5 }, (_, index) => (
                  <i key={index} className={index < MOCK_READ_FEEDBACK.fluencyScore ? "on" : undefined} />
                ))}
              </div>
            </section>
            <section className="feedback-section improvements">
              <p className="section-label">
                优先改正 <span className="muted small">专注这 3 点就好</span>
              </p>
              <ol>
                {MOCK_READ_FEEDBACK.improvements.map((item, index) => (
                  <li key={item.title}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
            <div className="feedback-actions">
              <button type="button" className="secondary" onClick={() => { if (!recording) toggleRecord(); }}>
                ↻ 再录一次
              </button>
              <button type="button" className="primary" onClick={pass}>
                通过，看视频 →
              </button>
            </div>
            <p className="feedback-note">反馈为静态示例，用于展示学习体验。</p>
          </aside>
        </div>
      </main>
      <footer className="site-footer">
        <span>每天一点，走进另一个世界。</span>
        <span>MORTY · 新概念英语 02</span>
      </footer>
    </>
  );
}
