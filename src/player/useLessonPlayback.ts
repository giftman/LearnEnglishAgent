import { useEffect, useRef, useState } from "react";
import type { Sentence } from "../content/lesson";
import type { StepId } from "../store/types";

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
  const [source, setSource] = useState<"mock" | "file">("mock");
  const [loopTick, setLoopTick] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(index);
  const stepRef = useRef(step);

  useEffect(() => {
    indexRef.current = index;
    stepRef.current = step;
  }, [index, step]);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    audioRef.current = audio;
    const onReady = () => setSource("file");
    const onError = () => setSource("mock");
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
      const list = sentences;
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
  }, [sentences]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || source !== "file") return;
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
    void audio.play().catch(() => setPlaying(false));
  }, [source, playing, rate, sentences]);

  useEffect(() => {
    if (!playing || source !== "mock") return;
    const current = sentences[index];
    if (!current) return;
    const ms = Math.max(900, ((current.endSec - current.startSec) * 1000) / rate);
    const timer = window.setTimeout(() => {
      if (step === "shadow") {
        setLoopTick((value) => value + 1);
        return;
      }
      if (index < sentences.length - 1) {
        setIndex(index + 1);
        return;
      }
      setPlaying(false);
    }, ms);
    return () => window.clearTimeout(timer);
  }, [playing, source, index, rate, step, sentences, loopTick]);

  const select = (nextIndex: number) => {
    if (sentences.length === 0) return;
    const wrapped = (nextIndex + sentences.length) % sentences.length;
    setIndex(wrapped);
    const audio = audioRef.current;
    const current = sentences[wrapped];
    if (audio && source === "file" && current) audio.currentTime = current.startSec;
  };

  const toggle = () => {
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
    source,
    setRate,
    select,
    toggle,
  };
}
