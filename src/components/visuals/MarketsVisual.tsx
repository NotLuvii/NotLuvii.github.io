import { mulberry32, r2, toPath, vars } from "./shared";

type Candle = { x: number; o: number; c: number; h: number; l: number };

const rand = mulberry32(7);
const N = 44;
const X0 = 64;
const X1 = 560;
const step = (X1 - X0) / N;

const candles: Candle[] = [];
let price = 100;
for (let i = 0; i < N; i++) {
  const drift = 0.18 + Math.sin(i / 6) * 0.9;
  const o = price;
  const c = o + drift + (rand() - 0.5) * 4.2;
  const h = Math.max(o, c) + rand() * 2.2;
  const l = Math.min(o, c) - rand() * 2.2;
  candles.push({ x: X0 + i * step + step / 2, o, c, h, l });
  price = c;
}
const lo = Math.min(...candles.map((k) => k.l)) - 6;
const hi = Math.max(...candles.map((k) => k.h)) + 18;
const Y0 = 70;
const Y1 = 400;
const py = (v: number) => Y1 - ((v - lo) / (hi - lo)) * (Y1 - Y0);

const MA: Array<[number, number]> = candles.map((k, i) => {
  const win = candles.slice(Math.max(0, i - 7), i + 1);
  const avg = win.reduce((s, w) => s + w.c, 0) / win.length;
  return [k.x, py(avg)];
});

const last = candles[N - 1];
const FX0 = last.x;
const FX1 = 740;
const fx = (t: number) => FX0 + t * (FX1 - FX0);
const median: Array<[number, number]> = [];
const upper: Array<[number, number]> = [];
const lower: Array<[number, number]> = [];
for (let i = 0; i <= 20; i++) {
  const t = i / 20;
  const m = last.c + t * 7 + Math.sin(t * 3) * 1.2;
  const spread = 1 + t * 14;
  median.push([fx(t), py(m)]);
  upper.push([fx(t), py(m + spread)]);
  lower.push([fx(t), py(m - spread)]);
}
const CONE = toPath([...upper, ...lower.slice().reverse()], true);
const CONE_INNER = toPath(
  [
    ...upper.map(([x, y], i) => [x, y + (median[i][1] - y) * 0.5] as [number, number]),
    ...lower
      .map(([x, y], i) => [x, y + (median[i][1] - y) * 0.5] as [number, number])
      .reverse(),
  ],
  true,
);

const ALLOC = [
  { label: "Technology", w: 0.34 },
  { label: "Energy", w: 0.18 },
  { label: "Financials", w: 0.2 },
  { label: "Health", w: 0.16 },
  { label: "Cash", w: 0.12 },
].map((a, i, all) => ({ ...a, start: all.slice(0, i).reduce((s, b) => s + b.w, 0) }));

export function MarketsVisual() {
  return (
    <svg viewBox="0 0 800 600" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="mk-cone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2997ff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#2997ff" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3, 4].map((i) => {
        const y = Y0 + ((Y1 - Y0) / 4) * i;
        const v = hi - ((hi - lo) / 4) * i;
        return (
          <g key={i}>
            <line x1={X0} x2={FX1} y1={r2(y)} y2={r2(y)} stroke="#f5f5f7" strokeOpacity="0.06" />
            <text x={FX1 + 10} y={r2(y + 4)} className="svg-meta">
              {v.toFixed(0)}
            </text>
          </g>
        );
      })}
      <line x1={r2(FX0)} x2={r2(FX0)} y1={Y0 - 20} y2={Y1 + 10} stroke="#2997ff" strokeOpacity="0.5" strokeDasharray="2 4" />
      <text x={r2(FX0 + 8)} y={Y0 - 8} className="svg-meta" style={{ fill: "#2997ff" }}>
        Model forecast, experimental
      </text>
      <text x={X0} y={Y0 - 8} className="svg-meta">
        Price history, daily
      </text>

      {candles.map((k, i) => {
        const up = k.c >= k.o;
        const top = py(Math.max(k.o, k.c));
        const bottom = py(Math.min(k.o, k.c));
        return (
          <g key={i} className="appear" style={vars({ "--appear-delay": `${0.1 + i * 0.025}s` })}>
            <line x1={r2(k.x)} x2={r2(k.x)} y1={r2(py(k.h))} y2={r2(py(k.l))} stroke="#f5f5f7" strokeOpacity="0.45" />
            <rect
              x={r2(k.x - step * 0.3)}
              y={r2(top)}
              width={r2(step * 0.6)}
              height={r2(Math.max(1, bottom - top))}
              fill={up ? "#101012" : "#86868b"}
              stroke={up ? "#f5f5f7" : "none"}
              strokeOpacity="0.8"
            />
          </g>
        );
      })}

      <path
        d={toPath(MA)}
        pathLength={1}
        fill="none"
        stroke="#f5f5f7"
        strokeOpacity="0.55"
        strokeWidth="1.2"
        className="draw"
        style={vars({ "--draw-duration": "2.4s", "--draw-delay": "0.6s" })}
      />

      <g className="appear" style={vars({ "--appear-delay": "1.4s" })}>
        <path d={CONE} fill="url(#mk-cone)" />
        <path d={CONE_INNER} fill="url(#mk-cone)" />
      </g>
      <path
        d={toPath(median)}
        pathLength={1}
        fill="none"
        stroke="#2997ff"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        className="appear"
        style={vars({ "--appear-delay": "1.6s" })}
      />
      <circle cx={r2(FX0)} cy={r2(py(last.c))} r="4" fill="#2997ff" />

      {/* Allocation */}
      <text x={X0} y="462" className="svg-meta">
        Allocation
      </text>
      <text x={FX1} y="462" textAnchor="end" className="svg-meta" style={{ fill: "#f5f5f7" }}>
        12 holdings
      </text>
      {ALLOC.map((a, i) => {
        const x = X0 + a.start * (FX1 - X0);
        const w = a.w * (FX1 - X0);
        return (
          <g key={a.label} className="appear" style={vars({ "--appear-delay": `${0.8 + i * 0.1}s` })}>
            <rect x={r2(x)} y="478" width={r2(w - 3)} height="10" fill={i === 0 ? "#2997ff" : "#f5f5f7"} opacity={i === 0 ? 0.9 : 0.12 + i * 0.1} />
            <text x={r2(x)} y="510" className="svg-meta">
              {a.label}
            </text>
            <text x={r2(x)} y="528" className="svg-meta" style={{ fill: "#f5f5f7" }}>
              {Math.round(a.w * 100)}%
            </text>
          </g>
        );
      })}
      <text x={X0} y="572" className="svg-meta">
        Illustrative data
      </text>
    </svg>
  );
}
