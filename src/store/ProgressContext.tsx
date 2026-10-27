/* oxlint-disable react/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createInitialProgress, loadProgress, saveProgress } from "./progress";
import type { UserProgress } from "./types";

interface ProgressApi {
  progress: UserProgress;
  update: (fn: (progress: UserProgress) => UserProgress) => void;
  replace: (progress: UserProgress) => void;
  reset: () => void;
}

const ProgressContext = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress(localStorage));

  useEffect(() => {
    saveProgress(localStorage, progress);
  }, [progress]);

  const api = useMemo<ProgressApi>(
    () => ({
      progress,
      update: (fn) => {
        setProgress((prev) => fn(prev));
      },
      replace: (next) => setProgress(next),
      reset: () => setProgress(createInitialProgress(new Date())),
    }),
    [progress],
  );

  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressApi {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used within ProgressProvider");
  return context;
}
