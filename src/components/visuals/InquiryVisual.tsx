import { r2, toPath, vars } from "./shared";

// Isometric projection for the printed part.
const O = { x: 222, y: 382 };
const S = 1.22;
const C30 = 0.866;
const S30 = 0.5;
const DIM = { x: 120, y: 80, z: 45 };

function P(x: number, y: number, z: number): [number, number] {
  return [r2(O.x + (x - y) * C30 * S), r2(O.y + (x + y) * S30 * S - z * S)];
}
const pts = (list: Array<[number, number, number]>) => list.map(([x, y, z]) => P(x, y, z));

const TOP = toPath(pts([[0, 0, DIM.z], [DIM.x, 0, DIM.z], [DIM.x, DIM.y, DIM.z], [0, DIM.y, DIM.z]]), true);
const RIGHT = toPath(pts([[DIM.x, 0, 0], [DIM.x, DIM.y, 0], [DIM.x, DIM.y, DIM.z], [DIM.x, 0, DIM.z]]), true);
const LEFT = toPath(pts([[0, DIM.y, 0], [DIM.x, DIM.y, 0], [DIM.x, DIM.y, DIM.z], [0, DIM.y, DIM.z]]), true);

// Print layers on both visible faces.
const LAYERS: string[] = [];
for (let z = 3; z < DIM.z; z += 3) {
  LAYERS.push(toPath([P(0, DIM.y, z), P(DIM.x, DIM.y, z)]));
  LAYERS.push(toPath([P(DIM.x, DIM.y, z), P(DIM.x, 0, z)]));
}

// Top plane as an affine matrix so the infill and bore can be drawn in flat part coordinates.
const TOP_MATRIX = `matrix(${r2(C30 * S)} ${r2(S30 * S)} ${r2(-C30 * S)} ${r2(S30 * S)} ${O.x} ${r2(O.y - DIM.z * S)})`;
const INFILL: Array<[number, number, number, number]> = [];
for (let k = -DIM.y; k < DIM.x; k += 8) INFILL.push([k, 0, k + DIM.y, DIM.y]);

// Dimension lines.
const dimLen = { a: P(0, DIM.y + 20, 0), b: P(DIM.x, DIM.y + 20, 0), t: P(DIM.x / 2, DIM.y + 34, 0) };
const dimWid = { a: P(DIM.x + 20, 0, 0), b: P(DIM.x + 20, DIM.y, 0), t: P(DIM.x + 36, DIM.y / 2, 0) };
const dimHgt = { a: P(-16, DIM.y + 16, 0), b: P(-16, DIM.y + 16, DIM.z), t: P(-30, DIM.y + 30, DIM.z / 2) };

const PHONE = { x: 486, y: 46, w: 232, h: 512, r: 34 };
const ROWS = [
  { label: "Client", value: "Sample client" },
  { label: "Material", value: "PETG, matte black" },
  { label: "Dimensions", value: "120 × 80 × 45 mm" },
  { label: "Testing", value: "Load and heat cycle" },
];

export function InquiryVisual() {
  const px = PHONE.x + 22;
  return (
    <svg viewBox="0 0 800 600" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="inq-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3d3d3f" />
          <stop offset="1" stopColor="#272729" />
        </linearGradient>
        <linearGradient id="inq-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f1f21" />
          <stop offset="1" stopColor="#161618" />
        </linearGradient>
        <linearGradient id="inq-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2d2d2f" />
          <stop offset="1" stopColor="#1c1c1e" />
        </linearGradient>
        <linearGradient id="inq-thumb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4e4e50" />
          <stop offset="1" stopColor="#202022" />
        </linearGradient>
        <linearGradient id="inq-bezel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5f5f61" />
          <stop offset="0.5" stopColor="#28282a" />
          <stop offset="1" stopColor="#4e4e50" />
        </linearGradient>
        <clipPath id="inq-topclip">
          <rect x="0" y="0" width={DIM.x} height={DIM.y} />
        </clipPath>
      </defs>

      {/* Printed part */}
      <ellipse cx={O.x + 30} cy={O.y + 150} rx="190" ry="26" fill="#000" opacity="0.35" />
      <path d={LEFT} fill="url(#inq-left)" stroke="#f5f5f7" strokeOpacity="0.3" />
      <path d={RIGHT} fill="url(#inq-right)" stroke="#f5f5f7" strokeOpacity="0.3" />
      {LAYERS.map((d, i) => (
        <path key={i} d={d} stroke="#f5f5f7" strokeOpacity="0.09" fill="none" />
      ))}
      <path d={TOP} fill="url(#inq-top)" stroke="#f5f5f7" strokeOpacity="0.45" />
      <g transform={TOP_MATRIX}>
        <g clipPath="url(#inq-topclip)">
          {INFILL.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f5f5f7" strokeOpacity="0.12" vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <circle cx={DIM.x * 0.62} cy={DIM.y / 2} r="17" fill="#111113" stroke="#f5f5f7" strokeOpacity="0.5" vectorEffect="non-scaling-stroke" />
        <circle cx={DIM.x * 0.62} cy={DIM.y / 2} r="11" fill="none" stroke="#2997ff" strokeOpacity="0.8" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
      </g>

      <g className="appear" style={vars({ "--appear-delay": "0.5s" })} stroke="#2997ff" fill="none">
        <path d={toPath([dimLen.a, dimLen.b])} />
        <path d={toPath([P(0, DIM.y + 4, 0), P(0, DIM.y + 26, 0)])} strokeOpacity="0.6" />
        <path d={toPath([P(DIM.x, DIM.y + 4, 0), P(DIM.x, DIM.y + 26, 0)])} strokeOpacity="0.6" />
        <path d={toPath([dimWid.a, dimWid.b])} />
        <path d={toPath([P(DIM.x + 4, 0, 0), P(DIM.x + 26, 0, 0)])} strokeOpacity="0.6" />
        <path d={toPath([P(DIM.x + 4, DIM.y, 0), P(DIM.x + 26, DIM.y, 0)])} strokeOpacity="0.6" />
        <path d={toPath([dimHgt.a, dimHgt.b])} />
      </g>
      <g className="appear" style={vars({ "--appear-delay": "0.8s" })}>
        <text x={dimLen.t[0] - 10} y={dimLen.t[1] + 10} className="svg-meta" style={{ fill: "#2997ff" }}>
          120
        </text>
        <text x={dimWid.t[0] + 4} y={dimWid.t[1] + 8} className="svg-meta" style={{ fill: "#2997ff" }}>
          80
        </text>
        <text x={dimHgt.t[0] - 22} y={dimHgt.t[1] + 4} className="svg-meta" style={{ fill: "#2997ff" }}>
          45
        </text>
        <text x="60" y="64" className="svg-meta">
          Part reference
        </text>
        <text x="60" y="82" className="svg-meta" style={{ fill: "#f5f5f7" }}>
          Bracket, 0.2 mm layers
        </text>
      </g>

      {/* Device */}
      <rect x={PHONE.x - 3} y={PHONE.y - 3} width={PHONE.w + 6} height={PHONE.h + 6} rx={PHONE.r + 3} fill="url(#inq-bezel)" />
      <rect x={PHONE.x} y={PHONE.y} width={PHONE.w} height={PHONE.h} rx={PHONE.r} fill="#111113" />
      <circle cx={PHONE.x + PHONE.w / 2} cy={PHONE.y + 22} r="5" fill="#000" stroke="#2d2d2f" />
      <text x={px} y={PHONE.y + 27} className="svg-meta" style={{ fill: "#f5f5f7", fontSize: 10 }}>
        9:41
      </text>
      <g transform={`translate(${PHONE.x + PHONE.w - 46} ${PHONE.y + 19})`} fill="#f5f5f7">
        <rect x="0" y="4" width="3" height="4" />
        <rect x="5" y="2" width="3" height="6" />
        <rect x="10" y="0" width="3" height="8" />
        <rect x="18" y="0" width="16" height="8" rx="2" fill="none" stroke="#f5f5f7" />
        <rect x="20" y="2" width="10" height="4" />
      </g>

      <text x={px} y={PHONE.y + 82} className="svg-display" fontSize="27" fill="#f5f5f7">
        New inquiry
      </text>
      <text x={px} y={PHONE.y + 104} className="svg-meta" style={{ fill: "#2997ff" }}>
        No. 0142, draft
      </text>

      {ROWS.map((row, i) => {
        const y = PHONE.y + 142 + i * 46;
        return (
          <g key={row.label} className="appear" style={vars({ "--appear-delay": `${0.3 + i * 0.12}s` })}>
            <text x={px} y={y} className="svg-meta" style={{ fontSize: 9.5 }}>
              {row.label}
            </text>
            <text x={px} y={y + 18} className="svg-ui">
              {row.value}
            </text>
            <rect x={px} y={y + 28} width={PHONE.w - 44} height="1" fill="#f5f5f7" opacity="0.1" />
          </g>
        );
      })}

      <g className="appear" style={vars({ "--appear-delay": "0.85s" })}>
        <text x={px} y={PHONE.y + 326} className="svg-meta" style={{ fontSize: 9.5 }}>
          Reference images
        </text>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={px + i * 52} y={PHONE.y + 336} width="44" height="44" rx="3" fill="url(#inq-thumb)" />
            <path
              d={`M${px + i * 52 + 8} ${PHONE.y + 372} l10 -12 l8 8 l6 -6 l12 10`}
              fill="none"
              stroke="#f5f5f7"
              strokeOpacity="0.35"
            />
          </g>
        ))}
        <rect x={px + 156} y={PHONE.y + 336} width="44" height="44" rx="3" fill="none" stroke="#f5f5f7" strokeOpacity="0.25" strokeDasharray="3 3" />
        <text x={px + 178} y={PHONE.y + 362} textAnchor="middle" className="svg-ui" style={{ fill: "#86868b" }}>
          +
        </text>
      </g>

      <g className="appear" style={vars({ "--appear-delay": "1.05s" })}>
        <text x={px} y={PHONE.y + 408} className="svg-meta" style={{ fontSize: 9.5 }}>
          Quote
        </text>
        <text x={px} y={PHONE.y + 432} className="svg-display" fontSize="24" fill="#f5f5f7">
          CAD 240.00
        </text>
        <text x={px} y={PHONE.y + 450} className="svg-meta" style={{ fill: "#2997ff" }}>
          ≈ USD 175.20 at today&apos;s rate
        </text>
      </g>
      <rect x={px} y={PHONE.y + 466} width={PHONE.w - 44} height="30" rx="2" fill="#2997ff" />
      <text x={px + (PHONE.w - 44) / 2} y={PHONE.y + 485} textAnchor="middle" className="svg-ui" style={{ fill: "#151517", fontSize: 11 }}>
        Send quote
      </text>
    </svg>
  );
}
