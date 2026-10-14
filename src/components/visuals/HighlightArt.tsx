import type { HighlightArt as ArtKey } from "@/content/highlights";

/**
 * Small line drawings for the highlight cards. One stroke colour plus Apple blue for the part that
 * matters; drawn for both card tones.
 */
export function HighlightArt({ art, tone }: { art: ArtKey; tone: "light" | "dark" }) {
  const ink = tone === "dark" ? "#f5f5f7" : "#1d1d1f";
  const blue = tone === "dark" ? "#2997ff" : "#0071e3";
  const soft = { stroke: ink, strokeOpacity: 0.28, strokeWidth: 1.5, fill: "none" } as const;
  const firm = { stroke: ink, strokeOpacity: 0.75, strokeWidth: 1.75, fill: "none" } as const;

  return (
    <svg viewBox="0 0 360 240" className="h-full w-full" aria-hidden strokeLinecap="round" strokeLinejoin="round">
      {art === "trace" && (
        <g>
          {[0, 1].map((col) => (
            <g key={col}>
              <rect x={40 + col * 180} y="36" width="100" height="168" rx="12" {...firm} />
              {[0, 1, 2, 3, 4].map((r) => (
                <line key={r} x1={56 + col * 180} x2={124 + col * 180} y1={66 + r * 28} y2={66 + r * 28} {...soft} />
              ))}
            </g>
          ))}
          {[0, 1, 3, 4].map((r) => (
            <path key={r} d={`M140 ${66 + r * 28} C170 ${66 + r * 28} 190 ${66 + r * 28} 220 ${66 + r * 28}`} {...soft} />
          ))}
          <path d="M140 122 C170 122 190 122 220 122" stroke={blue} strokeWidth="2.5" fill="none" />
          <circle cx="180" cy="122" r="18" stroke={blue} strokeWidth="2.5" fill="none" />
          <line x1="193" y1="135" x2="206" y2="148" stroke={blue} strokeWidth="3" />
        </g>
      )}

      {art === "schedule" && (
        <g>
          <rect x="44" y="40" width="200" height="164" rx="14" {...firm} />
          <line x1="44" x2="244" y1="76" y2="76" {...firm} />
          {Array.from({ length: 4 }).flatMap((_, r) =>
            Array.from({ length: 7 }).map((__, c) => (
              <circle key={`${r}-${c}`} cx={66 + c * 26} cy={102 + r * 28} r={c === 0 ? 6 : 3} fill={c === 0 ? blue : ink} fillOpacity={c === 0 ? 1 : 0.3} />
            )),
          )}
          <rect x="226" y="120" width="96" height="66" rx="8" fill={tone === "dark" ? "#1d1d1f" : "#ffffff"} stroke={blue} strokeWidth="2" />
          <path d="M228 124 L274 160 L320 124" stroke={blue} strokeWidth="2" fill="none" />
        </g>
      )}

      {art === "route" && (
        <g>
          <path d="M30 190 C90 190 100 120 160 120 S240 60 330 56" stroke={blue} strokeWidth="3" fill="none" />
          {[
            [62, 172, 70, 189],
            [118, 146, 124, 160],
            [150, 98, 160, 119],
            [206, 112, 205, 98],
            [252, 52, 256, 70],
            [300, 80, 302, 60],
          ].map(([x, y, tx, ty], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill={ink} fillOpacity="0.3" />
              <line x1={x} y1={y} x2={tx} y2={ty} {...soft} strokeDasharray="2 4" />
              <circle cx={tx} cy={ty} r="5" fill={blue} />
            </g>
          ))}
        </g>
      )}

      {art === "live" && (
        <g>
          {[18, 40, 64, 90].map((r, i) => (
            <circle key={r} cx="110" cy="120" r={r} stroke={i === 0 ? blue : ink} strokeOpacity={i === 0 ? 1 : 0.5 - i * 0.1} strokeWidth={i === 0 ? 3 : 1.5} fill="none" />
          ))}
          <circle cx="110" cy="120" r="7" fill={blue} />
          <path d="M210 120 H236 L248 84 L262 156 L276 104 L288 132 L298 120 H330" stroke={ink} strokeOpacity="0.75" strokeWidth="2" fill="none" />
        </g>
      )}

      {art === "steps" && (
        <g>
          <line x1="60" x2="300" y1="120" y2="120" {...soft} />
          {[0, 1, 2, 3].map((i) => {
            const x = 60 + i * 80;
            const done = i < 3;
            return (
              <g key={i}>
                <circle cx={x} cy="120" r="24" fill={done ? blue : tone === "dark" ? "#000" : "#fff"} stroke={done ? blue : ink} strokeOpacity={done ? 1 : 0.6} strokeWidth="2" />
                {done ? (
                  <path d={`M${x - 9} 120 l6 6 l12 -13`} stroke="#ffffff" strokeWidth="3" fill="none" />
                ) : (
                  <circle cx={x} cy="120" r="6" fill={ink} fillOpacity="0.6" />
                )}
              </g>
            );
          })}
        </g>
      )}

      {art === "docs" && (
        <g>
          <rect x="128" y="52" width="140" height="170" rx="12" {...soft} />
          <rect x="108" y="36" width="140" height="170" rx="12" {...soft} />
          <rect x="88" y="20" width="140" height="170" rx="12" fill={tone === "dark" ? "#1d1d1f" : "#ffffff"} stroke={ink} strokeOpacity="0.75" strokeWidth="1.75" />
          {[0, 1, 2, 3].map((r) => (
            <g key={r}>
              <rect x="106" y={48 + r * 32} width="14" height="14" rx="3" fill={r < 3 ? blue : "none"} stroke={blue} strokeWidth="1.75" />
              {r < 3 && <path d={`M109 ${55 + r * 32} l3 3 l5 -6`} stroke="#ffffff" strokeWidth="2" fill="none" />}
              <line x1="132" x2={r % 2 ? 196 : 210} y1={55 + r * 32} y2={55 + r * 32} {...soft} />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
