import { Link, useParams } from "react-router-dom";
import { LESSON_1 } from "../content/lesson";
import { STEP_LABEL, lessonPath } from "../content/stepCopy";
import { stepById } from "../store/progress";
import { useProgress } from "../store/ProgressContext";
import { STEP_ORDER, type StepId } from "../store/types";
import { useDialog } from "./DialogContext";

export function LessonHeader({ current }: { current: StepId }) {
  const { openPanel } = useDialog();
  const { progress } = useProgress();
  const params = useParams();
  const lessonId = params.lessonId ?? LESSON_1.id;

  return (
    <header className="lesson-header">
      <Link className="back" to="/" aria-label="返回首页">
        ←
      </Link>
      <Link className="lesson-brand" to="/">
        <strong>
          {LESSON_1.vCode} <span>·</span> {LESSON_1.titleEn}
        </strong>
        <small>{LESSON_1.bookLabel}</small>
      </Link>
      <nav className="steps" aria-label="学习步骤">
        {STEP_ORDER.map((step, index) => {
          const state = stepById(progress, lessonId, step);
          const active = step === current;
          const done = state?.status === "completed" && !active;
          const className = ["step", active ? "active" : "", done ? "done" : ""].filter(Boolean).join(" ");
          return (
            <Link key={step} className={className} to={lessonPath(lessonId, step)}>
              <span>{done ? "✓" : index + 1}</span>
              {STEP_LABEL[step]}
            </Link>
          );
        })}
      </nav>
      <button type="button" className="icon-btn" aria-label="课程信息" onClick={() => openPanel("lesson")}>
        ···
      </button>
    </header>
  );
}
