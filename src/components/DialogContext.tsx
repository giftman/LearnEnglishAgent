/* oxlint-disable react/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Panel = "progress" | "review" | "settings" | "lesson";

interface DialogApi {
  panel: Panel | null;
  openPanel: (panel: Panel) => void;
  closePanel: () => void;
}

const DialogContext = createContext<DialogApi | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const api = useMemo<DialogApi>(
    () => ({
      panel,
      openPanel: setPanel,
      closePanel: () => setPanel(null),
    }),
    [panel],
  );
  return <DialogContext.Provider value={api}>{children}</DialogContext.Provider>;
}

export function useDialog(): DialogApi {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useDialog must be used within DialogProvider");
  return context;
}
