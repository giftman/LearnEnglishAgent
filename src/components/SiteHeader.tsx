import { Link } from "react-router-dom";
import { LESSON_1 } from "../content/lesson";
import { lessonPath } from "../content/stepCopy";
import { resumeStep } from "../store/progress";
import { useProgress } from "../store/ProgressContext";
import { useDialog } from "./DialogContext";

export function SiteHeader() {
  const { openPanel } = useDialog();
  const { progress } = useProgress();
  const step = resumeStep(progress, LESSON_1.id);
  const learnTo = lessonPath(LESSON_1.id, step === "done" ? "video" : step);

  return (
    <header className="app-header">
      <Link className="brand" to="/">
        <span className="brand-mark">
          m<span>·</span>
        </span>
        <span>
          英语的平行世界
          <small>MORTY’S ENGLISH WORLD</small>
        </span>
      </Link>
      <nav className="main-nav">
        <Link className="selected" to="/">
          首页
        </Link>
        <Link to={learnTo}>学习</Link>
        <button type="button" onClick={() => openPanel("progress")}>
          进度
        </button>
        <button type="button" onClick={() => openPanel("review")}>
          复习
        </button>
      </nav>
      <button type="button" className="avatar" onClick={() => openPanel("settings")} aria-label="个人设置">
        M
      </button>
    </header>
  );
}
