import { arcPath, mulberry32, r2, vars, type VisualProps } from "./shared";

type Line = { y: number; w: number; hits: Array<[number, number]> };

const rand = mulberry32(42);
const PAGE = { x: 96, y: 64, w: 336, h: 468 };

function block(startY: number, count: number, hitChance: number): Line[] {
  const lines: Line[] = [];
  for (let i = 0; i < count; i++) {
    const w = 200 + rand() * 90;
    const hits: Array<[number, number]> = [];
    if (rand() < hitChance) {
      const start = 20 + rand() * (w - 90);
      hits.push([r2(start), r2(36 + rand() * 30)]);
    }
    lines.push({ y: startY + i * 15, w: r2(w), hits });
  }
  return lines;
}

const SECTIONS = [
  { label: 162, lines: block(182, 5, 0.6) },
  { label: 272, lines: block(292, 4, 0.5) },
  { label: 368, lines: block(388, 3, 0.7) },
  { label: 446, lines: block(466, 3, 0.2) },
];

const GAUGE = { cx: 616, cy: 214, r: 92 };
const SCORE = 0.82;
const TRACK_PATH = arcPath(GAUGE.cx, GAUGE.cy, GAUGE.r, 135, 405);
const VALUE_PATH = arcPath(GAUGE.cx, GAUGE.cy, GAUGE.r, 135, 135 + 270 * SCORE);

const TICKS = Array.from({ length: 28 }, (_, i) => {
  const a = ((135 + (270 / 27) * i) * Math.PI) / 180;
  const r1 = GAUGE.r + 10;
  const r2v = GAUGE.r + (i % 9 === 0 ? 20 : 15);
  return {
    x1: r2(GAUGE.cx + r1 * Math.cos(a)),
    y1: r2(GAUGE.cy + r1 * Math.sin(a)),
    x2: r2(GAUGE.cx + r2v * Math.cos(a)),
    y2: r2(GAUGE.cy + r2v * Math.sin(a)),
    major: i % 9 === 0,
  };
});

const ROWS = [
  { label: "Matched skills", value: "9", w: 0.75 },
  { label: "Missing skills", value: "3", w: 0.25 },
  { label: "Interview questions", value: "6", w: 0.5 },
];

export function RelevanceVisual({ active, reduced }: VisualProps) {
  const animate = active && !reduced;
  return (
    <svg viewBox="0 0 800 600" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="rel-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fafafa" />
          <stop offset="1" stopColor="#d2d2d7" />
        </linearGradient>
        <linearGradient id="rel-scan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2997ff" stopOpacity="0" />
          <stop offset="0.85" stopColor="#2997ff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#2997ff" stopOpacity="0.9" />
        </linearGradient>
        <filter id="rel-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <clipPath id="rel-clip">
          <rect x={PAGE.x} y={PAGE.y} width={PAGE.w} height={PAGE.h} />
        </clipPath>
      </defs>

      <g transform="rotate(-3.5 264 298)">
        <rect x={PAGE.x + 16} y={PAGE.y + 34} width={PAGE.w} height={PAGE.h} fill="#000" opacity="0.55" filter="url(#rel-shadow)" />
        <rect x={PAGE.x} y={PAGE.y} width={PAGE.w} height={PAGE.h} fill="url(#rel-paper)" />
        {/* Header */}
        <rect x={PAGE.x + 28} y={PAGE.y + 34} width="150" height="12" fill="#151517" opacity="0.85" />
        <rect x={PAGE.x + 28} y={PAGE.y + 56} width="220" height="5" fill="#151517" opacity="0.3" />
        <rect x={PAGE.x + 28} y={PAGE.y + 80} width={PAGE.w - 56} height="1" fill="#151517" opacity="0.25" />
        {SECTIONS.map((s, si) => (
          <g key={si}>
            <rect x={PAGE.x + 28} y={s.label} width="70" height="6" fill="#151517" opacity="0.7" />
            {s.lines.map((l, li) => (
              <g key={li}>
                {l.hits.map(([hx, hw], hi) => (
                  <rect
                    key={hi}
                    x={PAGE.x + 28 + hx - 3}
                    y={l.y - 5}
                    width={hw + 6}
                    height="12"
                    fill="#2997ff"
                    opacity="0.55"
                    className="appear"
                    style={vars({ "--appear-delay": `${0.6 + si * 0.25 + li * 0.05}s` })}
                  />
                ))}
                <rect x={PAGE.x + 28} y={l.y - 1} width={l.w} height="3.5" fill="#151517" opacity="0.28" />
              </g>
            ))}
          </g>
        ))}
        {animate ? (
          <g clipPath="url(#rel-clip)">
            <rect
              x={PAGE.x}
              y={PAGE.y - 60}
              width={PAGE.w}
              height="60"
              fill="url(#rel-scan)"
              style={{
                animation: "scan 4.2s cubic-bezier(0.65,0,0.35,1) infinite",
                ...vars({ "--scan-distance": `${PAGE.h + 60}px` }),
              }}
            />
          </g>
        ) : null}
      </g>

      {/* Score */}
      {TICKS.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#f5f5f7" strokeOpacity={t.major ? 0.5 : 0.18} />
      ))}
      <path d={TRACK_PATH} fill="none" stroke="#2d2d2f" strokeWidth="6" />
      <path
        d={VALUE_PATH}
        pathLength={1}
        fill="none"
        stroke="#2997ff"
        strokeWidth="6"
        className="draw"
        style={vars({ "--draw-duration": "2.4s", "--draw-delay": "0.4s" })}
      />
      <text x={GAUGE.cx} y={GAUGE.cy + 20} textAnchor="middle" className="svg-display" fontSize="68" fill="#f5f5f7">
        82
      </text>
      <text x={GAUGE.cx} y={GAUGE.cy + 48} textAnchor="middle" className="svg-meta">
        Relevance
      </text>
      <text x={GAUGE.cx} y={GAUGE.cy + 118} textAnchor="middle" className="svg-meta" fill="#2997ff" style={{ fill: "#2997ff" }}>
        Sample analysis
      </text>

      <g transform="translate(500 380)">
        {ROWS.map((row, i) => (
          <g key={row.label} transform={`translate(0 ${i * 52})`}>
            <text x="0" y="0" className="svg-meta">
              {row.label}
            </text>
            <text x="232" y="0" textAnchor="end" className="svg-meta" style={{ fill: "#f5f5f7" }}>
              {row.value}
            </text>
            <rect x="0" y="14" width="232" height="1" fill="#f5f5f7" opacity="0.15" />
            <rect
              x="0"
              y="13"
              width={232 * row.w}
              height="3"
              fill={i === 1 ? "#f5f5f7" : "#2997ff"}
              opacity={i === 1 ? 0.5 : 0.9}
              className="appear"
              style={vars({ "--appear-delay": `${1 + i * 0.15}s` })}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
