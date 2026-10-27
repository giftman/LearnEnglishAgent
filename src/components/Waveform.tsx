import type { CSSProperties } from "react";

// Same 53 bars as the green mockup. A longer repeat gets centered and clipped, so the shape no longer matches.
const HEIGHTS = [
  12, 22, 36, 48, 30, 60, 82, 54, 34, 18, 28, 48, 72, 96, 65, 42, 22, 38, 58, 80, 44, 28, 14, 12, 22, 36, 48,
  30, 60, 82, 54, 34, 18, 28, 48, 72, 96, 65, 42, 22, 38, 58, 80, 44, 28, 14, 12, 22, 36, 48, 30, 60, 82,
];

export function Waveform() {
  const bars = HEIGHTS;
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
