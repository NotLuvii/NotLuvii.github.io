import { r2, toPath, vars, type VisualProps } from "./shared";

/** An original circuit, not a real track. */
const TRACK =
  "M182 118 C262 70 420 58 522 88 C602 110 692 98 702 160 C714 232 640 252 580 238 C520 224 472 252 454 292 C438 328 380 338 330 318 C270 294 250 252 200 254 C140 256 108 222 116 176 C122 140 150 128 182 118 Z";

const SECTORS: Array<{ label: string; x: number; y: number }> = [
  { label: "S1", x: 520, y: 76 },
  { label: "S2", x: 470, y: 316 },
  { label: "S3", x: 108, y: 232 },
];

// Speed traces: braking zones are sharp on entry and long on exit, like real telemetry.
const CORNERS = [
  { c: 0.14, depth: 150, a: 0.012, b: 0.05 },
  { c: 0.34, depth: 205, a: 0.01, b: 0.06 },
  { c: 0.5, depth: 120, a: 0.012, b: 0.045 },
  { c: 0.66, depth: 175, a: 0.01, b: 0.055 },
  { c: 0.86, depth: 140, a: 0.012, b: 0.05 },
];

function speed(x: number, shift: number, scale: number) {
  let v = 322;
  for (const k of CORNERS) {
    const d = x - (k.c + shift);
    const w = d < 0 ? k.a : k.b;
    v -= k.depth * scale * Math.exp(-((d / w) ** 2));
  }
  return v;
}

const CHART = { x0: 70, x1: 740, y0: 372, y1: 532, vmin: 80, vmax: 340 };
const vx = (t: number) => CHART.x0 + t * (CHART.x1 - CHART.x0);
const vy = (v: number) => CHART.y1 - ((v - CHART.vmin) / (CHART.vmax - CHART.vmin)) * (CHART.y1 - CHART.y0);

const SAMPLES = 180;
const traceA: Array<[number, number]> = [];
const traceB: Array<[number, number]> = [];
const delta: Array<{ x: number; d: number }> = [];
for (let i = 0; i <= SAMPLES; i++) {
  const t = i / SAMPLES;
  const a = speed(t, 0, 1);
  const b = speed(t, 0.004, 0.94) - 3;
  traceA.push([vx(t), vy(a)]);
  traceB.push([vx(t), vy(b)]);
  if (i % 4 === 0) delta.push({ x: vx(t), d: b - a });
}
const PATH_A = toPath(traceA);
const PATH_B = toPath(traceB);
const AREA_B = `${PATH_B} L${CHART.x1} ${CHART.y1} L${CHART.x0} ${CHART.y1} Z`;

export function TelemetryVisual({ active, reduced }: VisualProps) {
  const animate = active && !reduced;
  return (
    <svg viewBox="0 0 800 600" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="tel-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2997ff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#2997ff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="tel-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2997ff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#2997ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Circuit */}
      <path d={TRACK} fill="none" stroke="#232325" strokeWidth="18" strokeLinejoin="round" />
      <path d={TRACK} fill="none" stroke="#2f2f31" strokeWidth="19" strokeLinejoin="round" strokeOpacity="0.5" strokeDasharray="1 7" />
      <path d={TRACK} fill="none" stroke="#f5f5f7" strokeOpacity="0.35" strokeWidth="1" />
      <path
        d={TRACK}
        pathLength={1}
        fill="none"
        stroke="#2997ff"
        strokeWidth="1.5"
        className="draw"
        style={vars({ "--draw-duration": "3.2s" })}
      />
      <line x1="176" y1="106" x2="190" y2="131" stroke="#f5f5f7" strokeWidth="2" />
      {SECTORS.map((s) => (
        <g key={s.label} className="appear">
          <circle cx={s.x} cy={s.y} r="2.5" fill="#f5f5f7" />
          <text x={s.x + 10} y={s.y + 4} className="svg-meta">
            {s.label}
          </text>
        </g>
      ))}
      {animate ? (
        <>
          <circle r="5" fill="#f5f5f7">
            <animateMotion dur="11s" repeatCount="indefinite" path={TRACK} />
          </circle>
          <circle r="14" fill="url(#tel-glow)" opacity="0.6">
            <animateMotion dur="10.6s" repeatCount="indefinite" path={TRACK} />
          </circle>
          <circle r="4.5" fill="#2997ff">
            <animateMotion dur="10.6s" repeatCount="indefinite" path={TRACK} />
          </circle>
        </>
      ) : (
        <>
          <circle cx="702" cy="160" r="5" fill="#f5f5f7" />
          <circle cx="690" cy="206" r="4.5" fill="#2997ff" />
        </>
      )}

      <g className="appear" style={vars({ "--appear-delay": "0.2s" })}>
        <text x="70" y="42" className="svg-meta">
          Lap overlay
        </text>
        <text x="740" y="42" textAnchor="end" className="svg-meta">
          Distance-aligned
        </text>
      </g>

      {/* Speed against distance */}
      <g>
        {[100, 200, 300].map((v) => (
          <g key={v}>
            <line x1={CHART.x0} x2={CHART.x1} y1={r2(vy(v))} y2={r2(vy(v))} stroke="#f5f5f7" strokeOpacity="0.07" />
            <text x={CHART.x0 - 12} y={r2(vy(v)) + 4} textAnchor="end" className="svg-meta">
              {v}
            </text>
          </g>
        ))}
        {[0.25, 0.58].map((t) => (
          <line
            key={t}
            x1={r2(vx(t))}
            x2={r2(vx(t))}
            y1={CHART.y0 - 10}
            y2={CHART.y1}
            stroke="#f5f5f7"
            strokeOpacity="0.18"
            strokeDasharray="2 4"
          />
        ))}
        <path d={AREA_B} fill="url(#tel-area)" className="appear" style={vars({ "--appear-delay": "1.2s" })} />
        <path
          d={PATH_A}
          pathLength={1}
          fill="none"
          stroke="#f5f5f7"
          strokeOpacity="0.85"
          strokeWidth="1.2"
          className="draw"
          style={vars({ "--draw-duration": "2.6s", "--draw-delay": "0.3s" })}
        />
        <path
          d={PATH_B}
          pathLength={1}
          fill="none"
          stroke="#2997ff"
          strokeWidth="1.4"
          className="draw"
          style={vars({ "--draw-duration": "2.6s", "--draw-delay": "0.55s" })}
        />
        {delta.map((p, i) => (
          <rect
            key={i}
            x={r2(p.x - 1)}
            width="2"
            y={p.d > 0 ? r2(560 - Math.min(14, p.d * 0.6)) : 560}
            height={r2(Math.max(1, Math.min(14, Math.abs(p.d) * 0.6)))}
            fill={p.d > 0 ? "#2997ff" : "#f5f5f7"}
            opacity="0.55"
            className="appear"
            style={vars({ "--appear-delay": "1.6s" })}
          />
        ))}
        <line x1={CHART.x0} x2={CHART.x1} y1="560" y2="560" stroke="#f5f5f7" strokeOpacity="0.2" />
        <text x={CHART.x0} y="590" className="svg-meta">
          Speed, km/h
        </text>
        <text x={CHART.x1} y="590" textAnchor="end" className="svg-meta">
          Delta
        </text>
        <g className="appear" style={vars({ "--appear-delay": "1s" })}>
          <line x1="520" x2="540" y1="352" y2="352" stroke="#f5f5f7" strokeWidth="1.2" />
          <text x="546" y="356" className="svg-meta">
            Driver A
          </text>
          <line x1="630" x2="650" y1="352" y2="352" stroke="#2997ff" strokeWidth="1.4" />
          <text x="656" y="356" className="svg-meta">
            Driver B
          </text>
        </g>
      </g>
    </svg>
  );
}
