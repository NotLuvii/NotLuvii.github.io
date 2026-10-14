import { mulberry32, r2, toPath, vars, type VisualProps } from "./shared";

/**
 * A monitoring dashboard: service health at a glance, a response-time trace with its threshold,
 * the services behind it, and where the errors are. Illustrative data.
 */

const rand = mulberry32(31);

const KPIS = [
  { label: "Services", value: "12" },
  { label: "Healthy", value: "11" },
  { label: "Warnings", value: "1" },
  { label: "Open issues", value: "2" },
];

// Response time: steady, one spike that crosses the threshold, then recovery.
const CH = { x0: 56, x1: 744, y0: 186, y1: 330 };
const N = 72;
const series: Array<[number, number]> = [];
for (let i = 0; i < N; i++) {
  const t = i / (N - 1);
  const spike = 74 * Math.exp(-(((t - 0.68) / 0.035) ** 2));
  const v = 118 + Math.sin(t * 11) * 9 + (rand() - 0.5) * 14 + spike;
  series.push([CH.x0 + t * (CH.x1 - CH.x0), v]);
}
const VMIN = 60;
const VMAX = 220;
const vy = (v: number) => CH.y1 - ((v - VMIN) / (VMAX - VMIN)) * (CH.y1 - CH.y0);
const LINE = toPath(series.map(([x, v]) => [x, vy(v)]));
const AREA = `${LINE} L${CH.x1} ${CH.y1} L${CH.x0} ${CH.y1} Z`;
const THRESHOLD = 170;
const peak = series.reduce((a, b) => (b[1] > a[1] ? b : a));

const SERVICES = [
  { name: "Ingest", state: "ok" },
  { name: "Validation", state: "ok" },
  { name: "Reports", state: "warn" },
  { name: "Notifications", state: "ok" },
] as const;

const ERRORS = [0.18, 0.12, 0.64, 0.08, 0.22, 0.1];

export function DashboardVisual({ active, reduced }: VisualProps) {
  const animate = active && !reduced;
  return (
    <svg viewBox="0 0 800 600" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="db-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2997ff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#2997ff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* KPI cards */}
      {KPIS.map((k, i) => {
        const x = 40 + i * 184;
        return (
          <g key={k.label} className="appear" style={vars({ "--appear-delay": `${0.15 + i * 0.08}s` })}>
            <rect x={x} y="40" width="168" height="104" rx="14" fill="#f5f5f7" fillOpacity="0.05" stroke="#f5f5f7" strokeOpacity="0.1" />
            <text x={x + 18} y="72" className="svg-meta">
              {k.label}
            </text>
            <text x={x + 18} y="122" className="svg-display" fontSize="40" fill={k.label === "Warnings" ? "#2997ff" : "#f5f5f7"}>
              {k.value}
            </text>
          </g>
        );
      })}

      {/* Response time */}
      <rect x="40" y="160" width="720" height="196" rx="14" fill="#f5f5f7" fillOpacity="0.04" stroke="#f5f5f7" strokeOpacity="0.1" />
      <text x="56" y="182" className="svg-meta appear">
        Response time, ms
      </text>
      {[80, 120, 160, 200].map((v) => (
        <line key={v} x1={CH.x0} x2={CH.x1} y1={r2(vy(v))} y2={r2(vy(v))} stroke="#f5f5f7" strokeOpacity="0.06" />
      ))}
      <line x1={CH.x0} x2={CH.x1} y1={r2(vy(THRESHOLD))} y2={r2(vy(THRESHOLD))} stroke="#f5f5f7" strokeOpacity="0.45" strokeDasharray="4 5" />
      <text x={CH.x1} y={r2(vy(THRESHOLD) - 8)} textAnchor="end" className="svg-meta appear">
        Alert threshold
      </text>
      <path d={AREA} fill="url(#db-area)" className="appear" style={vars({ "--appear-delay": "1.1s" })} />
      <path d={LINE} pathLength={1} fill="none" stroke="#2997ff" strokeWidth="2" className="draw" style={vars({ "--draw-duration": "2.6s", "--draw-delay": "0.3s" })} />
      <g className="appear" style={vars({ "--appear-delay": "1.8s" })}>
        <circle cx={r2(peak[0])} cy={r2(vy(peak[1]))} r="5" fill="#2997ff" />
        {animate && (
          <circle
            cx={r2(peak[0])}
            cy={r2(vy(peak[1]))}
            r="10"
            fill="none"
            stroke="#2997ff"
            style={{ transformOrigin: `${r2(peak[0])}px ${r2(vy(peak[1]))}px`, animation: "ping 2.4s cubic-bezier(0,0,0.2,1) infinite" }}
          />
        )}
        <line x1={r2(peak[0])} x2={r2(peak[0] - 60)} y1={r2(vy(peak[1]))} y2={r2(vy(peak[1]) - 2)} stroke="#f5f5f7" strokeOpacity="0.35" />
        <text x={r2(peak[0] - 66)} y={r2(vy(peak[1]) + 2)} textAnchor="end" className="svg-ui">
          Reports slowed
        </text>
      </g>

      {/* Services */}
      <rect x="40" y="372" width="352" height="188" rx="14" fill="#f5f5f7" fillOpacity="0.04" stroke="#f5f5f7" strokeOpacity="0.1" />
      <text x="56" y="398" className="svg-meta appear">
        Services
      </text>
      {SERVICES.map((s, i) => {
        const y = 430 + i * 34;
        return (
          <g key={s.name} className="appear" style={vars({ "--appear-delay": `${0.5 + i * 0.1}s` })}>
            <circle cx="64" cy={y - 4} r="5" fill={s.state === "warn" ? "#2997ff" : "#f5f5f7"} fillOpacity={s.state === "warn" ? 1 : 0.55} />
            <text x="80" y={y} className="svg-ui">
              {s.name}
            </text>
            <text x="376" y={y} textAnchor="end" className="svg-meta">
              {s.state === "warn" ? "Slow" : "Healthy"}
            </text>
            {i < SERVICES.length - 1 && <line x1="56" x2="376" y1={y + 14} y2={y + 14} stroke="#f5f5f7" strokeOpacity="0.07" />}
          </g>
        );
      })}

      {/* Errors by service */}
      <rect x="408" y="372" width="352" height="188" rx="14" fill="#f5f5f7" fillOpacity="0.04" stroke="#f5f5f7" strokeOpacity="0.1" />
      <text x="424" y="398" className="svg-meta appear">
        Errors by service, last 24 h
      </text>
      {ERRORS.map((v, i) => {
        const h = r2(v * 110);
        const x = 432 + i * 52;
        return (
          <rect
            key={i}
            x={x}
            y={r2(540 - h)}
            width="30"
            height={h}
            rx="4"
            fill={i === 2 ? "#2997ff" : "#f5f5f7"}
            fillOpacity={i === 2 ? 0.95 : 0.22}
            className="appear"
            style={vars({ "--appear-delay": `${0.7 + i * 0.07}s` })}
          />
        );
      })}
      <text x="760" y="586" textAnchor="end" className="svg-meta appear" style={vars({ "--appear-delay": "1.4s" })}>
        Illustrative data
      </text>
    </svg>
  );
}
