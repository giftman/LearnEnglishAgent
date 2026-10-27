import { useEffect, useRef, useState } from "react";
import type { Sentence } from "../content/lesson";
import type { StepId } from "../store/types";

export type PlaybackPhase = "loading" | "ready" | "error";

export function useLessonPlayback(
  sentences: Sentence[],
  step: StepId,
  initialIndex: number,
  audioUrl: string,
) {
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), Math.max(sentences.length - 1, 0)),
  );
  const [playing, setPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [rate, setRate] = useState(1);
  const [phase, setPhase] = useState<PlaybackPhase>("loading");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(index);
  const stepRef = useRef(step);
  const sentencesRef = useRef(sentences);

  useEffect(() => {
    indexRef.current = index;
    stepRef.current = step;
    sentencesRef.current = sentences;
  }, [index, step, sentences]);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    audioRef.current = audio;
    const onReady = () => {
      const current = sentencesRef.current[indexRef.current];
      if (current) audio.currentTime = current.startSec;
      setPhase("ready");
    };
    const onError = () => {
      setPhase("error");
      setPlaying(false);
    };
    const onEnded = () => setPlaying(false);
    audio.addEventListener("loadedmetadata", onReady);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onReady);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (audio.paused) return;
      const list = sentencesRef.current;
      if (stepRef.current === "shadow") {
        const current = list[indexRef.current];
        if (current && audio.currentTime >= current.endSec - 0.08) {
          audio.currentTime = current.startSec;
        }
        return;
      }
      let nextIndex = 0;
      for (let cursor = 0; cursor < list.length; cursor += 1) {
        const sentence = list[cursor];
        if (sentence && sentence.startSec <= audio.currentTime + 0.05) nextIndex = cursor;
      }
      if (nextIndex !== indexRef.current) setIndex(nextIndex);
    };
    audio.addEventListener("timeupdate", onTime);
    return () => audio.removeEventListener("timeupdate", onTime);
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || phase === "error") return;
    audio.playbackRate = rate;
    if (!playing) {
      audio.pause();
      return;
    }
    const current = sentences[indexRef.current];
    if (
      current &&
      (audio.currentTime < current.startSec || audio.currentTime >= current.endSec - 0.05)
    ) {
      audio.currentTime = current.startSec;
    }
    void audio.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setPlaying(false);
      setPhase("error");
    });
  }, [phase, playing, rate, sentences]);

  const select = (nextIndex: number) => {
    if (sentences.length === 0) return;
    const wrapped = (nextIndex + sentences.length) % sentences.length;
    setIndex(wrapped);
    const audio = audioRef.current;
    const current = sentences[wrapped];
    if (audio && current && Number.isFinite(audio.duration)) audio.currentTime = current.startSec;
  };

  const toggle = () => {
    if (phase === "error") {
      setPlaying(false);
      return false;
    }
    const next = !playing;
    if (next) setHasStarted(true);
    setPlaying(next);
    return next;
  };

  return {
    index,
    playing,
    hasStarted,
    rate,
    phase,
    setRate,
    select,
    toggle,
  };
}
