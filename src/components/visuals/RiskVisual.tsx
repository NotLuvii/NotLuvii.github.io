import { mulberry32, r2, vars, type VisualProps } from "./shared";

const CH = 9;
const URL_X = 82;
const URL_Y = 80;
const SEGMENTS = [
  { text: "https://", tone: "muted" },
  { text: "secure-", tone: "plain" },
  { text: "acc0unt", tone: "flag", note: "Lookalike spelling" },
  { text: "-verify", tone: "flag", note: "Urgency keyword" },
  { text: ".example", tone: "plain" },
  { text: "/login", tone: "flag", note: "Credential form" },
  { text: "?session=8f3a", tone: "muted" },
] as const;

const segs = SEGMENTS.map((s, i) => {
  const start = SEGMENTS.slice(0, i).reduce((acc, p) => acc + p.text.length, 0);
  return { ...s, x: URL_X + start * CH, w: s.text.length * CH };
});
const flags = segs.filter((s) => s.tone === "flag");

// Network
const rand = mulberry32(1234);
const AREA = { x0: 70, x1: 500, y0: 210, y1: 540 };
type Node = { x: number; y: number; kind: 0 | 1 | 2 };
const nodes: Node[] = [];
let guard = 0;
while (nodes.length < 17 && guard++ < 4000) {
  const x = AREA.x0 + rand() * (AREA.x1 - AREA.x0);
  const y = AREA.y0 + rand() * (AREA.y1 - AREA.y0);
  if (nodes.every((p) => Math.hypot(p.x - x, p.y - y) > 62)) nodes.push({ x: r2(x), y: r2(y), kind: (nodes.length % 3) as 0 | 1 | 2 });
}
const center = { x: (AREA.x0 + AREA.x1) / 2, y: (AREA.y0 + AREA.y1) / 2 };
const flagged = nodes.reduce((best, p, i) => (Math.hypot(p.x - center.x, p.y - center.y) < Math.hypot(nodes[best].x - center.x, nodes[best].y - center.y) ? i : best), 0);
const edges: Array<[number, number]> = [];
nodes.forEach((p, i) => {
  const near = nodes
    .map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y) }))
    .filter((e) => e.j !== i)
    .sort((a, b) => a.d - b.d)
    .slice(0, 2);
  near.forEach(({ j }) => {
    if (!edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) edges.push([i, j]);
  });
});

const SIGNALS = [
  { label: "Lookalike domain", value: "+0.31" },
  { label: "Credential capture", value: "+0.27" },
  { label: "Urgency language", value: "+0.22" },
  { label: "Domain age", value: "+0.07" },
];

function Glyph({ node, flagged }: { node: Node; flagged: boolean }) {
  const stroke = flagged ? "#2997ff" : "#f5f5f7";
  const fill = flagged ? "#2997ff" : "#141416";
  const so = flagged ? 1 : 0.55;
  if (node.kind === 0) return <circle cx={node.x} cy={node.y} r={flagged ? 8 : 6} fill={fill} stroke={stroke} strokeOpacity={so} />;
  if (node.kind === 1) {
    const s = flagged ? 14 : 11;
    return <rect x={node.x - s / 2} y={node.y - s / 2} width={s} height={s} fill={fill} stroke={stroke} strokeOpacity={so} />;
  }
  const s = flagged ? 9 : 7.5;
  return (
    <path
      d={`M${node.x} ${node.y - s} L${node.x + s} ${node.y} L${node.x} ${node.y + s} L${node.x - s} ${node.y} Z`}
      fill={fill}
      stroke={stroke}
      strokeOpacity={so}
    />
  );
}

export function RiskVisual({ active, reduced }: VisualProps) {
  const animate = active && !reduced;
  const f = nodes[flagged];
  return (
    <svg viewBox="0 0 800 600" className="h-full w-full" aria-hidden>
      {/* URL under inspection */}
      <rect x="60" y="50" width="680" height="46" fill="#141416" stroke="#f5f5f7" strokeOpacity="0.18" />
      <circle cx="74" cy="73" r="3" fill="#2997ff" />
      {segs.map((s) => (
        <text
          key={s.text}
          x={s.x}
          y={URL_Y}
          textLength={s.w}
          lengthAdjust="spacingAndGlyphs"
          className="svg-ui"
          style={{ fontSize: 15, fill: s.tone === "muted" ? "#86868b" : s.tone === "flag" ? "#f5f5f7" : "#f5f5f7" }}
        >
          {s.text}
        </text>
      ))}
      {flags.map((s, i) => (
        <g key={s.text}>
          <line
            x1={s.x}
            x2={s.x + s.w}
            y1={URL_Y + 8}
            y2={URL_Y + 8}
            pathLength={1}
            stroke="#2997ff"
            strokeWidth="1.5"
            className="draw"
            style={vars({ "--draw-duration": "0.9s", "--draw-delay": `${0.3 + i * 0.25}s` })}
          />
          <g className="appear" style={vars({ "--appear-delay": `${0.6 + i * 0.25}s` })}>
            <line x1={s.x + s.w / 2} x2={s.x + s.w / 2} y1={URL_Y + 18} y2={URL_Y + 42 + i * 18} stroke="#2997ff" strokeOpacity="0.5" />
            <text x={s.x + s.w / 2 + 6} y={URL_Y + 46 + i * 18} className="svg-meta" style={{ fill: "#2997ff" }}>
              {s.note}
            </text>
          </g>
        </g>
      ))}

      {/* Network */}
      {edges.map(([a, b], i) => {
        const hot = a === flagged || b === flagged;
        return (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke={hot ? "#2997ff" : "#f5f5f7"}
            strokeOpacity={hot ? 0.7 : 0.14}
          />
        );
      })}
      {animate ? (
        <>
          <circle cx={f.x} cy={f.y} r="16" fill="none" stroke="#2997ff" style={{ transformOrigin: `${f.x}px ${f.y}px`, animation: "ping 2.2s cubic-bezier(0,0,0.2,1) infinite" }} />
          <circle cx={f.x} cy={f.y} r="16" fill="none" stroke="#2997ff" style={{ transformOrigin: `${f.x}px ${f.y}px`, animation: "ping 2.2s cubic-bezier(0,0,0.2,1) 1.1s infinite" }} />
        </>
      ) : (
        <circle cx={f.x} cy={f.y} r="22" fill="none" stroke="#2997ff" strokeOpacity="0.4" />
      )}
      {nodes.map((p, i) => (
        <Glyph key={i} node={p} flagged={i === flagged} />
      ))}
      <g transform={`translate(${AREA.x0} 574)`} className="svg-meta">
        <circle cx="4" cy="-4" r="4" fill="none" stroke="#f5f5f7" strokeOpacity="0.6" />
        <text x="14" y="0" className="svg-meta">
          Message
        </text>
        <rect x="88" y="-8" width="8" height="8" fill="none" stroke="#f5f5f7" strokeOpacity="0.6" />
        <text x="102" y="0" className="svg-meta">
          URL
        </text>
        <path d="M150 -9 L155 -4 L150 1 L145 -4 Z" fill="none" stroke="#f5f5f7" strokeOpacity="0.6" />
        <text x="162" y="0" className="svg-meta">
          Listing
        </text>
      </g>

      {/* Score */}
      <g transform="translate(556 236)">
        <text x="0" y="0" className="svg-meta">
          Risk score
        </text>
        <text x="0" y="64" className="svg-display" fontSize="66" fill="#f5f5f7">
          0.87
        </text>
        <rect x="0" y="86" width="184" height="2" fill="#f5f5f7" opacity="0.12" />
        <rect x="0" y="86" width={184 * 0.87} height="2" fill="#2997ff" className="appear" style={vars({ "--appear-delay": "0.9s" })} />
        <rect x={184 * 0.87 - 1} y="80" width="2" height="14" fill="#2997ff" />
        <text x="0" y="112" className="svg-meta">
          Low
        </text>
        <text x="184" y="112" textAnchor="end" className="svg-meta" style={{ fill: "#2997ff" }}>
          High
        </text>
        {SIGNALS.map((s, i) => (
          <g key={s.label} transform={`translate(0 ${150 + i * 30})`} className="appear" style={vars({ "--appear-delay": `${1.1 + i * 0.1}s` })}>
            <text x="0" y="0" className="svg-meta">
              {s.label}
            </text>
            <text x="184" y="0" textAnchor="end" className="svg-meta" style={{ fill: "#f5f5f7" }}>
              {s.value}
            </text>
            <rect x="0" y="10" width="184" height="1" fill="#f5f5f7" opacity="0.1" />
          </g>
        ))}
        <text x="0" y="292" className="svg-meta">
          Sample analysis
        </text>
      </g>
    </svg>
  );
}
