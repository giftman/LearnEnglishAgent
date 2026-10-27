export interface Cue {
  startSec: number;
  en: string;
  zh: string;
}

export function parseLrc(source: string): Cue[] {
  const cues: Cue[] = [];
  for (const rawLine of source.split(/\r?\n/)) {
    const match = /^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/.exec(rawLine.trim());
    if (!match) continue;
    const minutes = Number(match[1]);
    const seconds = Number(match[2]);
    const body = match[3]?.trim() ?? "";
    const pipe = body.indexOf("|");
    const en = (pipe === -1 ? body : body.slice(0, pipe)).trim();
    const zh = pipe === -1 ? "" : body.slice(pipe + 1).trim();
    if (!en) continue;
    cues.push({ startSec: minutes * 60 + seconds, en, zh });
  }
  return cues;
}
