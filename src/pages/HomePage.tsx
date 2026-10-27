import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { LESSON_1 } from "../content/lesson";
import { STEP_LABEL, lessonPath } from "../content/stepCopy";
import { civilDate, weekDates } from "../store/dates";
import { dueReviews, resumeStep, stepById, trackDay } from "../store/progress";
import { useProgress } from "../store/ProgressContext";
import { STEP_ORDER } from "../store/types";
import { useDialog } from "../components/DialogContext";

const WEEK_LABELS = ["一", "二", "三", "四", "五", "六", "日"];
const KIND_LABEL = { word: "词", translate: "译", listen: "听" } as const;

export function HomePage() {
  const { progress } = useProgress();
  const { openPanel } = useDialog();
  const [today] = useState(() => civilDate(new Date(), progress.timezone));
  const days = weekDates(today);
  const due = dueReviews(progress, today);
  const resume = resumeStep(progress, LESSON_1.id);
  const continueStep = resume === "done" ? "video" : resume;
  const continueLabel = resume === "done" ? "今天的课学完了" : `继续：${STEP_LABEL[continueStep]}`;
  const dayNumber = String(trackDay(progress)).padStart(2, "0");

  useEffect(() => {
    document.title = "首页 · 英语的平行世界";
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="home">
        <div className="page-heading">
          <div>
            <p className="eyebrow">YOUR DAILY ENGLISH</p>
            <h1>开启今天的平行世界。</h1>
            <p className="muted">从一段对话开始，让英语成为日常。</p>
          </div>
          <span className="course-tag">{LESSON_1.trackLabel}</span>
        </div>
        <div className="home-grid">
          <section className="card hero">
            <div className="lesson-meta">
              <span className="blue-dot" />
              <strong>DAY {dayNumber}</strong>
              <span className="divider">/</span>
              <span>
                {LESSON_1.vCode} · Lesson {LESSON_1.nc2}
              </span>
              <span className="tag">今日课程</span>
            </div>
            <div className="hero-title">
              <p className="eyebrow">A LITTLE ENGLISH, EVERY DAY</p>
              <h2>
                A private
                <br />
                conversation<span>.</span>
              </h2>
              <p>{LESSON_1.titleZh}</p>
            </div>
            <div className="learning-route">
              <p className="section-label">
                四步，学会一课 <span>约 15 分钟</span>
              </p>
              <div className="pills">
                {STEP_ORDER.map((step, index) => {
                  const state = stepById(progress, LESSON_1.id, step);
                  const current = resume === step;
                  const done = state?.status === "completed";
                  const className = current ? "current" : done ? "done" : undefined;
                  return (
                    <Link key={step} className={className} to={lessonPath(LESSON_1.id, step)}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {STEP_LABEL[step]}
                    </Link>
                  );
                })}
              </div>
            </div>
            <Link className="primary continue" to={lessonPath(LESSON_1.id, continueStep)}>
              <span className="play-small">▶</span>
              {continueLabel}
              <span className="arrow">→</span>
            </Link>
            <p className="helper">
              {resume === "done"
                ? "这一课四步都走完了。复习会在之后的日子出现。"
                : "从第一句开始，听见故事里的每一个细节。"}
            </p>
          </section>
          <aside className="summary">
            <section className="card streak">
              <div className="card-label">
                <span>学习连续</span>
                <span className="subtle-icon">◷</span>
              </div>
              <div className="streak-number">
                {progress.streakDays} <span>天</span>
                <span className="tag">{progress.streakDays === 0 ? "新的开始" : "继续保持"}</span>
              </div>
              <div className="week">
                {days.map((date, index) => {
                  const className = [
                    progress.studyDates.includes(date) ? "lit" : "",
                    date === today ? "today" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <span key={date} className={className || undefined}>
                      {WEEK_LABELS[index]}
                      <i />
                    </span>
                  );
                })}
              </div>
              <p className="muted small">
                {progress.streakDays === 0
                  ? "今天学一课，就能点亮第一个学习日。"
                  : `最近学习日 ${progress.lastStudyDate}。`}
              </p>
            </section>
            <section className="card review">
              <div className="card-label">
                待复习<span className="blue">↻</span>
              </div>
              {due.length === 0 ? (
                <div className="review-content">
                  <span className="check-circle">✓</span>
                  <h3>今天的复习已清空</h3>
                  <p className="muted small">保持轻松，给新知识留一点空间。</p>
                </div>
              ) : (
                <div className="review-content">
                  <span className="check-circle">{due.length}</span>
                  <h3>今天有 {due.length} 项复习</h3>
                  <p className="muted small">
                    {due.map((item) => `${item.zCode} ${KIND_LABEL[item.kind]}`).join(" · ")}
                  </p>
                </div>
              )}
              <button type="button" className="text-link" onClick={() => openPanel("review")}>
                查看复习计划 <span>→</span>
              </button>
            </section>
            <section className="card quick">
              <p className="card-label">
                探索更多<span className="muted small">外链</span>
              </p>
              <a href="https://dictionary.cambridge.org/" target="_blank" rel="noopener noreferrer">
                <span>
                  剑桥英语词典
                  <small>查词、发音与例句</small>
                </span>
                ↗
              </a>
              <a href="https://www.bbc.co.uk/learningenglish" target="_blank" rel="noopener noreferrer">
                <span>
                  BBC Learning English
                  <small>在真实语境中学习</small>
                </span>
                ↗
              </a>
            </section>
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
