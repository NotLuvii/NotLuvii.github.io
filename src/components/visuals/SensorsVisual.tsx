import { vars, type VisualProps } from "./shared";

/**
 * Sensor management: a floor of sensors reporting to a gateway, one flagged by automated fault
 * detection, and the status view a technician sees. Illustrative data.
 */

const GATEWAY = { x: 260, y: 300 };

const SENSORS = [
  { id: "S-01", x: 110, y: 150, kind: "Temp" },
  { id: "S-02", x: 250, y: 120, kind: "Temp" },
  { id: "S-03", x: 400, y: 160, kind: "Flow" },
  { id: "S-04", x: 90, y: 330, kind: "Vibration" },
  { id: "S-05", x: 420, y: 330, kind: "Pressure" },
  { id: "S-06", x: 140, y: 470, kind: "Humidity" },
  { id: "S-07", x: 300, y: 480, kind: "Pressure", fault: true },
  { id: "S-08", x: 430, y: 470, kind: "Temp" },
];

const ROWS = [
  { id: "S-07", kind: "Pressure", status: "Fault: no reading for 4 min", fault: true },
  { id: "S-05", kind: "Pressure", status: "Normal" },
  { id: "S-03", kind: "Flow", status: "Normal" },
  { id: "S-01", kind: "Temp", status: "Normal" },
  { id: "S-08", kind: "Temp", status: "Normal" },
];

export function SensorsVisual({ active, reduced }: VisualProps) {
  const animate = active && !reduced;
  const fault = SENSORS.find((s) => s.fault)!;
  return (
    <svg viewBox="0 0 800 600" className="h-full w-full" aria-hidden>
      {/* Floor plan */}
      <rect x="40" y="70" width="460" height="480" rx="16" fill="none" stroke="#f5f5f7" strokeOpacity="0.14" />
      <path d="M40 250 H200 M300 250 V70 M300 380 H500" fill="none" stroke="#f5f5f7" strokeOpacity="0.1" strokeDasharray="2 6" />
      <text x="56" y="98" className="svg-meta appear">
        Line 2, east bay
      </text>

      {/* Links to the gateway */}
      {SENSORS.map((s, i) => (
        <line
          key={`l-${s.id}`}
          x1={GATEWAY.x}
          y1={GATEWAY.y}
          x2={s.x}
          y2={s.y}
          pathLength={1}
          stroke={s.fault ? "#2997ff" : "#f5f5f7"}
          strokeOpacity={s.fault ? 0.7 : 0.18}
          strokeDasharray={s.fault ? "0.02 0.03" : undefined}
          className={s.fault ? "appear" : "draw"}
          style={vars({ "--draw-duration": "1.2s", "--draw-delay": `${0.2 + i * 0.06}s`, "--appear-delay": "1s" })}
        />
      ))}

      {/* Gateway */}
      <g className="appear" style={vars({ "--appear-delay": "0.1s" })}>
        <rect x={GATEWAY.x - 26} y={GATEWAY.y - 18} width="52" height="36" rx="8" fill="#1d1d1f" stroke="#f5f5f7" strokeOpacity="0.5" />
        <text x={GATEWAY.x} y={GATEWAY.y + 4} textAnchor="middle" className="svg-meta">
          Gateway
        </text>
      </g>

      {/* Sensors */}
      {SENSORS.map((s, i) => (
        <g key={s.id} className="appear" style={vars({ "--appear-delay": `${0.4 + i * 0.07}s` })}>
          <circle cx={s.x} cy={s.y} r="13" fill="#1d1d1f" stroke={s.fault ? "#2997ff" : "#f5f5f7"} strokeOpacity={s.fault ? 1 : 0.5} strokeWidth={s.fault ? 2 : 1} />
          <circle cx={s.x} cy={s.y} r="4" fill={s.fault ? "#2997ff" : "#f5f5f7"} fillOpacity={s.fault ? 1 : 0.7} />
          <text x={s.x} y={s.y + 32} textAnchor="middle" className="svg-meta">
            {s.id}
          </text>
        </g>
      ))}
      {animate && (
        <>
          <circle cx={fault.x} cy={fault.y} r="14" fill="none" stroke="#2997ff" style={{ transformOrigin: `${fault.x}px ${fault.y}px`, animation: "ping 2.2s cubic-bezier(0,0,0.2,1) infinite" }} />
          <circle cx={fault.x} cy={fault.y} r="14" fill="none" stroke="#2997ff" style={{ transformOrigin: `${fault.x}px ${fault.y}px`, animation: "ping 2.2s cubic-bezier(0,0,0.2,1) 1.1s infinite" }} />
        </>
      )}

      {/* Status view */}
      <g className="appear" style={vars({ "--appear-delay": "0.8s" })}>
        <rect x="524" y="70" width="236" height="480" rx="16" fill="#f5f5f7" fillOpacity="0.05" stroke="#f5f5f7" strokeOpacity="0.12" />
        <text style={{ fontSize: 15 }} x="544" y="104" className="svg-ui">
          Sensor health
        </text>
        <rect x="544" y="118" width="108" height="22" rx="11" fill="none" stroke="#f5f5f7" strokeOpacity="0.3" />
        <text x="598" y="133" textAnchor="middle" className="svg-meta">
          Technician view
        </text>
        <text x="544" y="176" className="svg-display" fontSize="40" fill="#f5f5f7">
          7/8
        </text>
        <text x="624" y="174" className="svg-meta">
          reporting
        </text>
        {ROWS.map((row, i) => {
          const y = 230 + i * 62;
          return (
            <g key={row.id}>
              <line x1="544" x2="740" y1={y - 24} y2={y - 24} stroke="#f5f5f7" strokeOpacity="0.08" />
              <circle cx="550" cy={y - 4} r="4" fill={row.fault ? "#2997ff" : "#f5f5f7"} fillOpacity={row.fault ? 1 : 0.5} />
              <text x="564" y={y} className="svg-ui">
                {row.id}
                <tspan className="svg-meta" dx="8">
                  {row.kind}
                </tspan>
              </text>
              <text x="564" y={y + 20} className="svg-meta" style={row.fault ? { fill: "#2997ff" } : undefined}>
                {row.status}
              </text>
            </g>
          );
        })}
      </g>
      <text x="760" y="586" textAnchor="end" className="svg-meta appear" style={vars({ "--appear-delay": "1.4s" })}>
        Illustrative data
      </text>
    </svg>
  );
}
