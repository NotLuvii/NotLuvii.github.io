import { mulberry32, r2, vars, type VisualProps } from "./shared";

const rand = mulberry32(19);
const noise = Array.from({ length: 512 }, () => rand());
const n = (t: number, k: number) => noise[Math.floor(t * 97 + k * 131) % noise.length];

const STEMS = [
  {
    name: "Vocals",
    amp: (t: number) => (Math.sin(t * Math.PI * 3.4 + 0.4) > -0.25 ? 0.5 + 0.45 * n(t, 1) : 0.04 + 0.04 * n(t, 2)),
  },
  { name: "Drums", amp: (t: number) => Math.exp(-((t * 16) % 1) * 5.5) * (0.55 + 0.45 * n(t, 3)) + 0.03 },
  { name: "Bass", amp: (t: number) => 0.42 + 0.22 * Math.sin(t * Math.PI * 8) + 0.06 * n(t, 4) },
  { name: "Other", amp: (t: number) => 0.22 + 0.4 * (0.5 * n(t, 5) + 0.5 * n(t + 0.01, 6)) },
];

const LANE = { x0: 424, x1: 760, top: 132, gap: 112, maxH: 34 };
const LANE_BARS = 68;
const MIX = { x0: 44, x1: 292, cy: 300, maxH: 92 };
const MIX_BARS = 62;

const lanes = STEMS.map((s, i) => {
  const cy = LANE.top + i * LANE.gap;
  const bars = Array.from({ length: LANE_BARS }, (_, b) => {
    const t = b / LANE_BARS;
    const h = Math.max(1.5, s.amp(t) * LANE.maxH);
    return { x: r2(LANE.x0 + (b / LANE_BARS) * (LANE.x1 - LANE.x0)), h: r2(h) };
  });
  return { ...s, cy, bars };
});

const mixBars = Array.from({ length: MIX_BARS }, (_, b) => {
  const t = b / MIX_BARS;
  const sum = STEMS.reduce((acc, s) => acc + s.amp(t), 0) / 2.2;
  return { x: r2(MIX.x0 + t * (MIX.x1 - MIX.x0)), h: r2(Math.max(2, Math.min(1, sum) * MIX.maxH)) };
});

const NODE = { x: 350, y: 300 };

export function StemsVisual({ active, reduced }: VisualProps) {
  const animate = active && !reduced;
  return (
    <svg viewBox="0 0 800 600" className="h-full w-full" aria-hidden>
      <text x={MIX.x0} y={MIX.cy - MIX.maxH - 30} className="svg-meta">
        Mixed track
      </text>
      <text x={MIX.x0} y={MIX.cy - MIX.maxH - 12} className="svg-meta" style={{ fill: "#f5f5f7" }}>
        Stereo, 44.1 kHz
      </text>
      <line x1={MIX.x0} x2={MIX.x1} y1={MIX.cy} y2={MIX.cy} stroke="#f5f5f7" strokeOpacity="0.15" />
      {mixBars.map((b, i) => (
        <rect key={i} x={b.x} y={r2(MIX.cy - b.h)} width="2" height={r2(b.h * 2)} fill="#f5f5f7" opacity="0.75" />
      ))}

      {lanes.map((lane, i) => (
        <path
          key={lane.name}
          d={`M${NODE.x + 20} ${NODE.y} C${NODE.x + 52} ${NODE.y} ${NODE.x + 40} ${lane.cy} ${LANE.x0 - 14} ${lane.cy}`}
          pathLength={1}
          fill="none"
          stroke={i === 0 ? "#2997ff" : "#f5f5f7"}
          strokeOpacity={i === 0 ? 0.9 : 0.35}
          className="draw"
          style={vars({ "--draw-duration": "1.4s", "--draw-delay": `${0.2 + i * 0.1}s` })}
        />
      ))}
      <line x1={MIX.x1 + 10} x2={NODE.x - 20} y1={NODE.y} y2={NODE.y} stroke="#f5f5f7" strokeOpacity="0.35" />
      <circle cx={NODE.x} cy={NODE.y} r="20" fill="#141416" stroke="#2997ff" />
      <circle cx={NODE.x} cy={NODE.y} r="6" fill="#2997ff" />
      {animate ? (
        <circle
          cx={NODE.x}
          cy={NODE.y}
          r="20"
          fill="none"
          stroke="#2997ff"
          style={{ transformOrigin: `${NODE.x}px ${NODE.y}px`, animation: "ping 2.4s cubic-bezier(0,0,0.2,1) infinite" }}
        />
      ) : null}
      <text x={NODE.x} y={NODE.y + 44} textAnchor="middle" className="svg-meta">
        Separation
      </text>

      {lanes.map((lane, i) => (
        <g key={lane.name} className="appear" style={vars({ "--appear-delay": `${0.5 + i * 0.12}s` })}>
          <text x={LANE.x0} y={lane.cy - LANE.maxH - 12} className="svg-meta" style={i === 0 ? { fill: "#2997ff" } : undefined}>
            {lane.name}
          </text>
          <line x1={LANE.x0} x2={LANE.x1} y1={lane.cy} y2={lane.cy} stroke="#f5f5f7" strokeOpacity="0.1" />
          {lane.bars.map((b, k) => (
            <rect
              key={k}
              x={b.x}
              y={r2(lane.cy - b.h)}
              width="2"
              height={r2(b.h * 2)}
              fill={i === 0 ? "#2997ff" : "#f5f5f7"}
              opacity={i === 0 ? 0.9 : 0.55}
            />
          ))}
          {[0, 1, 2, 3, 4, 5].map((m) => (
            <rect
              key={m}
              x={LANE.x1 + 14}
              y={lane.cy + 14 - m * 6}
              width="8"
              height="4"
              fill={m < 4 - (i % 2) ? (i === 0 ? "#2997ff" : "#f5f5f7") : "#2d2d2f"}
              opacity={m < 4 - (i % 2) ? 0.8 : 1}
            />
          ))}
        </g>
      ))}

      {animate ? (
        <line
          x1={LANE.x0}
          x2={LANE.x0}
          y1={LANE.top - 56}
          y2={LANE.top + LANE.gap * 3 + 44}
          stroke="#2997ff"
          strokeWidth="1"
          style={{
            animation: "sweep 7s linear infinite",
            ...vars({ "--sweep-distance": `${LANE.x1 - LANE.x0}px` }),
          }}
        />
      ) : null}
    </svg>
  );
}
