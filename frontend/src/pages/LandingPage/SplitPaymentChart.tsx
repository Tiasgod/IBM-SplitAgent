import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import "./SplitPaymentChart.css";

const data = [
  {
    name: "Recebimento tradicional",
    empresa: 100,
    tributos: 0,
  },
  {
    name: "Com Split Payment",
    empresa: 70,
    tributos: 30,
  },
];

const COLORS = {
  empresa: "#16A36A",
  tributos: "#D99A36",
};

export default function SplitPaymentChart() {
  return (
    <div className="lp-split-chart">
      <div className="lp-split-chart__header">
        <span className="lp-split-chart__eyebrow">
          SIMULAÇÃO ILUSTRATIVA
        </span>
        <h4>Para onde vai o dinheiro da venda?</h4>
        <strong className="lp-split-chart__value">
          R$ 1.000,00
        </strong>
      </div>

      <div className="lp-split-chart__graph">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart
            data={data}
            layout="vertical"
            barSize={22}
            barCategoryGap={24}
            margin={{ top: 5, right: 8, left: 0, bottom: 5 }}
          >
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis
              type="category"
              dataKey="name"
              width={145}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-bg)",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            <Tooltip
              cursor={false}
              formatter={(value, name) => [
                `${value}%`,
                name === "empresa"
                  ? "Destinado à empresa"
                  : "Tributos segregados",
              ]}
              contentStyle={{
                background: "var(--color-primary-hover)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                color: "var(--color-bg)",
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="empresa"
              stackId="a"
              fill={COLORS.empresa}
              radius={[5, 0, 0, 5]}
            />
            <Bar
              dataKey="tributos"
              stackId="a"
              fill={COLORS.tributos}
              radius={[0, 5, 5, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="lp-split-chart__legend">
        <span>
          <i style={{ background: COLORS.empresa }} />
          Destinado à empresa
        </span>
        <span>
          <i style={{ background: COLORS.tributos }} />
          Tributos segregados
        </span>
      </div>

      <p className="lp-split-chart__disclaimer">
        Simulação ilustrativa. Os percentuais são hipotéticos. Os impactos efetivos dependerão da regulamentação e da implementação do Split Payment.
      </p>
    </div>
  );
}