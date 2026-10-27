import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { DialogProvider } from "./components/DialogContext";
import { InfoDialog } from "./components/InfoDialog";
import { LESSON_1 } from "./content/lesson";
import { lessonPath } from "./content/stepCopy";
import { HomePage } from "./pages/HomePage";
import { ListenPage } from "./pages/ListenPage";
import { ReadPage } from "./pages/ReadPage";
import { ProgressProvider } from "./store/ProgressContext";
import type { StepId } from "./store/types";

function isPlayerStep(step: string | undefined): step is Exclude<StepId, "read"> {
  return step === "listen" || step === "shadow" || step === "video";
}

function LessonRoute() {
  const { lessonId, step } = useParams();
  if (lessonId !== LESSON_1.id) {
    return <Navigate to={lessonPath(LESSON_1.id, "listen")} replace />;
  }
  if (step === "read") return <ReadPage />;
  if (isPlayerStep(step)) return <ListenPage key={step} step={step} />;
  return <Navigate to={lessonPath(LESSON_1.id, "listen")} replace />;
}

export default function App() {
  return (
    <ProgressProvider>
      <DialogProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lesson/:lessonId/:step" element={<LessonRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <InfoDialog />
        </BrowserRouter>
      </DialogProvider>
    </ProgressProvider>
  );
}
