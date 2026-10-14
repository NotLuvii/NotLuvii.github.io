import { mulberry32, r2, toPath, vars, type VisualProps } from "./shared";

/**
 * The hero: a dark app window showing the three things this portfolio is about. Data checked
 * against its source with the one discrepancy traced, a report that sends itself, and a live feed.
 * An illustration, not a screenshot.
 */

const W = 1200;
const H = 620;

const NAV = ["Overview", "Data checks", "Reports", "Live status", "Runbooks"];

const ROWS = [
  { check: "Orders received", source: "1,284", report: "1,284" },
  { check: "Orders shipped", source: "1,201", report: "1,201" },
  { check: "Returns", source: "38", report: "41", mismatch: true },
  { check: "Invoices issued", source: "1,175", report: "1,175" },
  { check: "Late deliveries", source: "26", report: "26" },
];

const rand = mulberry32(12);
const LIVE: Array<[number, number]> = Array.from({ length: 40 }, (_, i) => [
  892 + i * 6.6,
  r2(476 + Math.sin(i / 3) * 12 + (rand() - 0.5) * 14),
]);
const LIVE_PATH = toPath(LIVE);
const LIVE_END = LIVE[LIVE.length - 1];

const COL = { check: 300, source: 600, report: 700, result: 780 };

function Tick({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y} l5 5 l10 -11`} fill="none" stroke="#f5f5f7" strokeOpacity="0.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
}

export function HeroVisual({ active, reduced }: VisualProps) {
  const animate = active && !reduced;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="hv-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2a2d" />
          <stop offset="1" stopColor="#151516" />
        </linearGradient>
      </defs>

      {/* Window */}
      <rect x="0.5" y="0.5" width={W - 1} height={H - 1} rx="22" fill="url(#hv-glass)" stroke="#f5f5f7" strokeOpacity="0.14" />
      <path d={`M0 52 H${W}`} stroke="#f5f5f7" strokeOpacity="0.08" />
      {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
        <circle key={c} cx={30 + i * 22} cy="26" r="6.5" fill={c} />
      ))}
      <text x={W / 2} y="31" textAnchor="middle" className="svg-meta">
        Operations data
      </text>

      {/* Sidebar */}
      <path d={`M240 52 V${H}`} stroke="#f5f5f7" strokeOpacity="0.08" />
      {NAV.map((n, i) => {
        const y = 104 + i * 44;
        const on = n === "Data checks";
        return (
          <g key={n}>
            {on && <rect x="16" y={y - 24} width="208" height="36" rx="9" fill="#f5f5f7" fillOpacity="0.1" />}
            <text x="34" y={y} className="svg-ui" style={{ fontSize: 15, ...(on ? {} : { fill: "#86868b" }) }}>
              {n}
            </text>
          </g>
        );
      })}

      {/* Data checks */}
      <text style={{ fontSize: 30, fontWeight: 600 }} x="280" y="112" className="svg-ui">
        Data checks
      </text>
      <text style={{ fontSize: 13 }} x="280" y="140" className="svg-meta">
        Source systems against the report, run every night
      </text>

      <g style={{ fontSize: 12 }} className="svg-meta">
        <text x={COL.check} y="190">
          Check
        </text>
        <text x={COL.source} y="190" textAnchor="end">
          Source
        </text>
        <text x={COL.report} y="190" textAnchor="end">
          Report
        </text>
        <text x={COL.result} y="190">
          Result
        </text>
      </g>
      <path d="M280 204 H848" stroke="#f5f5f7" strokeOpacity="0.1" />
      {ROWS.map((r, i) => {
        const y = 240 + i * 52;
        return (
          <g key={r.check} className="appear" style={vars({ "--appear-delay": `${0.25 + i * 0.12}s` })}>
            {r.mismatch && <rect x="272" y={y - 30} width="584" height="48" rx="10" fill="#2997ff" fillOpacity="0.16" />}
            <text style={{ fontSize: 15 }} x={COL.check} y={y} className="svg-ui">
              {r.check}
            </text>
            <text style={{ fontSize: 15 }} x={COL.source} y={y} textAnchor="end" className="svg-ui">
              {r.source}
            </text>
            <text x={COL.report} y={y} textAnchor="end" className="svg-ui" style={{ fontSize: 15, ...(r.mismatch ? { fill: "#2997ff" } : {}) }}>
              {r.report}
            </text>
            {r.mismatch ? (
              <text x={COL.result} y={y} className="svg-ui" style={{ fontSize: 15, fill: "#2997ff" }}>
                Mismatch
              </text>
            ) : (
              <Tick x={COL.result + 2} y={y - 6} />
            )}
            {i < ROWS.length - 1 && !r.mismatch && !ROWS[i + 1].mismatch && <path d={`M280 ${y + 18} H848`} stroke="#f5f5f7" strokeOpacity="0.06" />}
          </g>
        );
      })}

      {/* Root cause note */}
      <g className="appear" style={vars({ "--appear-delay": "1.1s" })}>
        <path d="M300 520 V548 H316" fill="none" stroke="#2997ff" strokeOpacity="0.8" />
        <text style={{ fontSize: 14 }} x="324" y="553" className="svg-ui">
          Traced: 3 duplicated rows in the report query
        </text>
        <text style={{ fontSize: 12 }} x="324" y="575" className="svg-meta">
          Fixed at the source, check re-run, totals match
        </text>
      </g>

      {/* Scheduled report */}
      <g className="appear" style={vars({ "--appear-delay": "0.6s" })}>
        <rect x="880" y="86" width="284" height="196" rx="16" fill="#f5f5f7" fillOpacity="0.05" stroke="#f5f5f7" strokeOpacity="0.1" />
        <text style={{ fontSize: 12 }} x="904" y="124" className="svg-meta">
          Weekly report
        </text>
        <text style={{ fontSize: 22, fontWeight: 600 }} x="904" y="168" className="svg-ui">
          Sent automatically
        </text>
        <text style={{ fontSize: 13 }} x="904" y="196" className="svg-meta">
          Mondays at 07:00
        </text>
        <path d="M904 226 H1140" stroke="#f5f5f7" strokeOpacity="0.08" />
        <Tick x={906} y={250} />
        <text style={{ fontSize: 14 }} x="932" y="257" className="svg-ui">
          Delivered to 6 people
        </text>
      </g>

      {/* Live feed */}
      <g className="appear" style={vars({ "--appear-delay": "0.8s" })}>
        <rect x="880" y="300" width="284" height="236" rx="16" fill="#f5f5f7" fillOpacity="0.05" stroke="#f5f5f7" strokeOpacity="0.1" />
        <text style={{ fontSize: 12 }} x="904" y="338" className="svg-meta">
          Live updates
        </text>
        <text x="904" y="392" className="svg-display" fontSize="54" fill="#f5f5f7">
          24
        </text>
        <text style={{ fontSize: 13 }} x="980" y="390" className="svg-meta">
          vehicles reporting
        </text>
        {[446, 476, 506].map((y) => (
          <path key={y} d={`M892 ${y} H1152`} stroke="#f5f5f7" strokeOpacity="0.06" />
        ))}
      </g>
      <path d={LIVE_PATH} pathLength={1} fill="none" stroke="#2997ff" strokeWidth="2" className="draw" style={vars({ "--draw-duration": "2.2s", "--draw-delay": "0.9s" })} />
      <g className="appear" style={vars({ "--appear-delay": "2s" })}>
        <circle cx={LIVE_END[0]} cy={LIVE_END[1]} r="4.5" fill="#2997ff" />
        {animate && (
          <circle
            cx={LIVE_END[0]}
            cy={LIVE_END[1]}
            r="9"
            fill="none"
            stroke="#2997ff"
            style={{ transformOrigin: `${LIVE_END[0]}px ${LIVE_END[1]}px`, animation: "ping 2.2s cubic-bezier(0,0,0.2,1) infinite" }}
          />
        )}
      </g>

      <text x={W - 36} y={H - 28} textAnchor="end" className="svg-meta">
        Illustration
      </text>
    </svg>
  );
}
