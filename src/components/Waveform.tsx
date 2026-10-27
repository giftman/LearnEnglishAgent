import type { CSSProperties } from "react";

const HEIGHTS = [12, 22, 36, 48, 30, 60, 82, 54, 34, 18, 28, 48, 72, 96, 65, 42, 22, 38, 58, 80, 44, 28, 14];

export function Waveform() {
  const bars = [...HEIGHTS, ...HEIGHTS, ...HEIGHTS];
  return (
    <div className="wave" aria-hidden="true">
      {bars.map((height, index) => {
        const style = {
          "--h": `${height}px`,
          "--d": `${(index % 7) * 0.1}s`,
        } as CSSProperties;
        return <i key={index} style={style} />;
      })}
    </div>
  );
}
