import { useEffect, useRef, useState } from "react";
import { LESSON_1 } from "../content/lesson";
import { useDialog } from "./DialogContext";
import { civilDate } from "../store/dates";
import { parseProgress, stepById } from "../store/progress";
import { r2AudioKey } from "../store/media";
import { STEP_ORDER, type StepStatus } from "../store/types";
import { STEP_LABEL } from "../content/stepCopy";
import { useProgress } from "../store/ProgressContext";

const TITLES = {
  progress: "学习记录",
  review: "复习计划",
  settings: "个人设置",
  lesson: "课程信息",
} as const;

const STATUS_LABEL: Record<StepStatus, string> = {
  available: "未开始",
  in_progress: "进行中",
  completed: "已完成",
};

const KIND_LABEL = {
  word: "词",
  translate: "译",
  listen: "听",
} as const;

function downloadProgress(json: string) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "morty-progress.json";
  link.click();
  URL.revokeObjectURL(url);
}

export function InfoDialog() {
  const { panel, closePanel } = useDialog();
  const { progress, replace, reset } = useProgress();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [today] = useState(() => civilDate(new Date(), progress.timezone));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (panel && !dialog.open) dialog.showModal();
    if (!panel && dialog.open) dialog.close();
  }, [panel]);

  return (
    <dialog
      id="info-dialog"
      ref={dialogRef}
      onClose={closePanel}
    >
      <button type="button" className="dialog-close" aria-label="关闭" onClick={closePanel}>
        ×
      </button>
      <p className="eyebrow">MORTY’S ENGLISH WORLD</p>
      <h2>{panel ? TITLES[panel] : ""}</h2>
      <div className="dialog-body muted">
        {panel === "progress" ? (
          <>
            <p>
              连续 {progress.streakDays} 天 · 每日 {progress.dailyMinutes} 分钟 · {progress.timezone}
            </p>
            <p>已完成课次：{progress.lessonsDone.length > 0 ? progress.lessonsDone.join("、") : "还没有"}</p>
            <ul className="progress-list">
              {STEP_ORDER.map((step) => {
                const state = stepById(progress, LESSON_1.id, step);
                return (
                  <li key={step}>
                    <span>{STEP_LABEL[step]}</span>
                    <span>{state ? STATUS_LABEL[state.status] : "未开始"}</span>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
        {panel === "review" ? (
          progress.reviewsPending.length === 0 ? (
            <p>暂无到期复习。完成第 1 课后，Z73 的词、译、听会排到不同的日子，不会连做三次。</p>
          ) : (
            <ul className="progress-list">
              {progress.reviewsPending.map((item) => (
                <li key={`${item.zCode}-${item.kind}`}>
                  <span>
                    {item.zCode} {KIND_LABEL[item.kind]}
                  </span>
                  <span>{item.doneAt ? "已完成" : item.dueAt <= today ? "今天到期" : item.dueAt}</span>
                </li>
              ))}
            </ul>
          )
        ) : null}
        {panel === "settings" ? (
          <>
            <p>
              单用户进度存在这台浏览器的 localStorage（morty.progress.v1）。时区 {progress.timezone}，每天{" "}
              {progress.dailyMinutes} 分钟。换浏览器之前先导出。
            </p>
            {importError ? <p className="import-error">{importError}</p> : null}
            <div className="dialog-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => downloadProgress(JSON.stringify(progress, null, 2))}
              >
                导出进度 JSON
              </button>
              <button type="button" className="secondary" onClick={() => fileRef.current?.click()}>
                导入进度 JSON
              </button>
              <input
                ref={fileRef}
                className="file-input"
                type="file"
                accept="application/json"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  void file.text().then((text) => {
                    const parsed = parseProgress(text);
                    if (!parsed) {
                      setImportError("这个文件不是 morty.progress.v1。");
                      return;
                    }
                    setImportError(null);
                    replace(parsed);
                  });
                }}
              />
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  if (window.confirm("清空本机学习进度？此操作只影响这台浏览器。")) reset();
                }}
              >
                清空本机进度
              </button>
            </div>
          </>
        ) : null}
        {panel === "lesson" ? (
          <>
            <p>
              {LESSON_1.vCode} · Lesson {LESSON_1.nc2} · {LESSON_1.titleEn}。学习顺序：听 → 跟读 → 朗读 → 视频。
            </p>
            <p>
              音频文件 {LESSON_1.audioFile}。R2 key：{r2AudioKey(LESSON_1.audioFile)}
            </p>
            <p>课文词：{LESSON_1.words.join("、")}</p>
            <p>
              <a href={LESSON_1.bilibiliUrl} target="_blank" rel="noopener noreferrer">
                B 站讲解 p={LESSON_1.bilibiliPage}
              </a>
              {" · "}
              <a
                href="https://www.mortyenglish.com/learning-map.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                学习地图 4.5
              </a>
            </p>
          </>
        ) : null}
      </div>
      <button type="button" className="primary dialog-close" onClick={closePanel}>
        知道了
      </button>
    </dialog>
  );
}
