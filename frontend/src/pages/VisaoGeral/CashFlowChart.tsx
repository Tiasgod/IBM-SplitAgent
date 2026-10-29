import type { CashFlowPoint, RiskPeriod } from "./index";
import "./CashFlowChart.css";

// Y-axis labels (in thousands)
const Y_LABELS = [60, 40, 20, 0];

const PAD_LEFT = 52;  // space for y-axis labels
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 32; // space for x-axis labels

/**
 * Maps a data value (in thousands) to an SVG y-coordinate.
 * viewBox height is 200, data range 0–65.
 */
function yCoord(value: number, height: number, minVal: number, maxVal: number) {
  return PAD_TOP + ((maxVal - value) / (maxVal - minVal)) * (height - PAD_TOP - PAD_BOTTOM);
}

function xCoord(index: number, total: number, width: number) {
  return PAD_LEFT + (index / (total - 1)) * (width - PAD_LEFT - PAD_RIGHT);
}

interface CashFlowChartProps {
  points: CashFlowPoint[];
  minimumBalance: number;
  riskPeriods: RiskPeriod[];
}

export function CashFlowChart({ points: dataPoints, minimumBalance, riskPeriods }: CashFlowChartProps) {
  const WIDTH = 600;
  const HEIGHT = 200;
  const MIN_DATA = 0;
  const MAX_DATA = 65;

  const points = dataPoints.map((d, i) => ({
    ...d,
    x: xCoord(i, dataPoints.length, WIDTH),
    y: yCoord(d.value, HEIGHT, MIN_DATA, MAX_DATA),
  }));

  // Build SVG polyline points string
  const linePoints = points.map(p => `${p.x},${p.y}`).join(" ");

  // Build area fill path (close down to baseline)
  const areaPath =
    `M ${points[0].x},${points[0].y} ` +
    points.slice(1).map(p => `L ${p.x},${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x},${yCoord(0, HEIGHT, MIN_DATA, MAX_DATA)}` +
    ` L ${points[0].x},${yCoord(0, HEIGHT, MIN_DATA, MAX_DATA)} Z`;

  const chartBottom = yCoord(0, HEIGHT, MIN_DATA, MAX_DATA);

  // Min value line y
  const minY = yCoord(minimumBalance, HEIGHT, MIN_DATA, MAX_DATA);

  return (
    <div className="cashflow-chart">
      <div className="cashflow-chart__header">
        <span className="cashflow-chart__header-title">Projeção de saldo</span>
        <span className="cashflow-chart__header-subtitle">· próximos 30 dias</span>
        <span className="cashflow-chart__info-icon" aria-label="Informação">ℹ</span>
      </div>

      <div className="cashflow-chart__svg-wrapper">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="cashflow-chart__svg"
          aria-label="Gráfico de projeção de saldo dos próximos 30 dias"
          role="img"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#0E7573" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0E7573" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Y-axis grid lines + labels */}
          {Y_LABELS.map((val) => {
            const y = yCoord(val, HEIGHT, MIN_DATA, MAX_DATA);
            return (
              <g key={val}>
                <line
                  x1={PAD_LEFT}
                  y1={y}
                  x2={WIDTH - PAD_RIGHT}
                  y2={y}
                  stroke="#CBD5E0"
                  strokeWidth="0.75"
                  strokeDasharray="4 3"
                />
                <text
                  x={PAD_LEFT - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#5B6B7C"
                >
                  {val > 0 ? `${val} mil` : "0"}
                </text>
              </g>
            );
          })}

          {/* Risk periods */}
          {riskPeriods.map((rp) => {
            const startPoint = points.find(p => p.day === rp.startDay);
            const endPoint   = points.find(p => p.day === rp.endDay);
            if (!startPoint || !endPoint) return null;
            const riskX1 = startPoint.x;
            const riskX2 = endPoint.x;
            return (
              <g key={`${rp.startDay}-${rp.endDay}`}>
                {/* Risk period background */}
                <rect
                  x={riskX1}
                  y={PAD_TOP}
                  width={riskX2 - riskX1}
                  height={chartBottom - PAD_TOP}
                  fill="#FFC801"
                  fillOpacity="0.12"
                />
                {/* Risk period label */}
                <text
                  x={(riskX1 + riskX2) / 2}
                  y={PAD_TOP + 14}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#D8672B"
                >
                  Período de risco
                </text>
                <text
                  x={(riskX1 + riskX2) / 2}
                  y={PAD_TOP + 26}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#D8672B"
                >
                  {rp.startDay} – {rp.endDay}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line */}
          <polyline
            points={linePoints}
            fill="none"
            stroke="#0E7573"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Minimum value dashed line */}
          <line
            x1={PAD_LEFT}
            y1={minY}
            x2={WIDTH - PAD_RIGHT}
            y2={minY}
            stroke="#D8672B"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <text
            x={WIDTH - PAD_RIGHT - 4}
            y={minY - 5}
            textAnchor="end"
            fontSize="9.5"
            fontWeight="600"
            fill="#D8672B"
          >
            valor mínimo
          </text>

          {/* Data point dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#0E7573"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ))}

          {/* X-axis labels — only show first, middle, last */}
          {[0, Math.floor((dataPoints.length - 1) / 2), dataPoints.length - 1].map((i) => (
            <text
              key={i}
              x={points[i].x}
              y={HEIGHT - 4}
              textAnchor="middle"
              fontSize="10"
              fill="#5B6B7C"
            >
              {dataPoints[i].day}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
