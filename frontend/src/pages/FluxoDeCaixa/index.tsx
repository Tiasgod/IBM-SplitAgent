import { Lightbulb } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChatShell } from "../../components/layout/ChatShell";
import "./FluxoDeCaixa.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BalanceSummary {
  availableBalance: number;
  lowestForecast: number;
  forecastDays: number;
}

export interface CashProjection {
  totalInflows: number;
  totalOutflows: number;
  chartData: CashChartPoint[];
}

export interface CashChartPoint {
  label: string;
  value: number;
  isNegative?: boolean;
}

export interface Movement {
  id: string;
  title: string;
  description: string;
  date: string;
  amount: number; // positive = entrada, negative = saída
}

export interface AgentAlert {
  message: string;
  linkLabel: string;
  linkHref: string;
}

// ─── Placeholder data (will come from backend) ────────────────────────────────

const BALANCE_SUMMARY: BalanceSummary = {
  availableBalance: 18500,
  lowestForecast: 6200,
  forecastDays: 30,
};

const CASH_PROJECTION: CashProjection = {
  totalInflows: 24000,
  totalOutflows: 36000,
  chartData: [
    { label: "Hoje",  value: 18500 },
    { label: "Dia 7", value: 14800 },
    { label: "Dia 15", value: 6200, isNegative: true },
    { label: "Dia 22", value: 9700 },
    { label: "Dia 30", value: 11500 },
  ],
};

const MOVEMENTS: Movement[] = [
  {
    id: "1",
    title: "Aluguel",
    description: "Despesa prevista",
    date: "23 out.",
    amount: -3200,
  },
  {
    id: "2",
    title: "Recebimento de vendas",
    description: "Entrada prevista",
    date: "25 out.",
    amount: 8500,
  },
  {
    id: "3",
    title: "Fornecedor",
    description: "Despesa prevista",
    date: "28 out.",
    amount: -6000,
  },
  {
    id: "4",
    title: "Recebimento de vendas",
    description: "Entrada prevista",
    date: "29 out.",
    amount: 1000,
  },
  {
    id: "5",
    title: "Compra de máquina",
    description: "Despesa prevista",
    date: "30 out.",
    amount: -2000,
  },
];

const AGENT_ALERT: AgentAlert = {
  message:
    "Há uma concentração de pagamentos antes de alguns recebimentos previstos. Confira essas datas antes de assumir uma nova despesa.",
  linkLabel: "Analisar com o agente",
  linkHref: "/assistente",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(value: number): string {
  return Math.abs(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function formatBRLCompact(value: number): string {
  return Math.abs(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BalanceCard({ data }: { data: BalanceSummary }) {
  return (
    <div className="fluxo__card fluxo__balance-card">
      <p className="fluxo__balance-label">Saldo disponível</p>
      <p className="fluxo__balance-value">{formatBRL(data.availableBalance)}</p>
      <p className="fluxo__balance-forecast">
        Menor saldo previsto:{" "}
        <span className="fluxo__balance-forecast-value">
          {formatBRL(data.lowestForecast)}
        </span>
      </p>
      <p className="fluxo__balance-period">
        Próximos {data.forecastDays} dias
      </p>
    </div>
  );
}

function ProjectionCard({ data }: { data: CashProjection }) {
  const max = Math.max(...data.chartData.map((d) => d.value));

  return (
    <div className="fluxo__card fluxo__projection-card">
      <h2 className="fluxo__card-title">Projeção do caixa</h2>

      <div className="fluxo__projection-summary">
        <span className="fluxo__projection-inflows-label">
          Entradas previstas
        </span>
        <span className="fluxo__projection-inflows-value">
          {formatBRLCompact(data.totalInflows)}
        </span>
        <span className="fluxo__projection-outflows-label">
          Saídas previstas
        </span>
        <span className="fluxo__projection-outflows-value">
          {formatBRLCompact(data.totalOutflows)}
        </span>
      </div>

      <div className="fluxo__chart-wrapper" aria-label="Projeção do caixa por período">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={data.chartData}
            layout="vertical"
            margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
            barSize={14}
          >
            <XAxis type="number" domain={[0, max * 1.15]} hide />
            <YAxis
              type="category"
              dataKey="label"
              width={46}
              tick={{ fontSize: 12, fill: "#5B6B7C", fontFamily: "Ubuntu, system-ui, sans-serif" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(v) => [formatBRL(Number(v)), "Saldo"]}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              contentStyle={{ fontSize: 12, borderRadius: 6 }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} background={{ fill: "#F2F5F9", radius: 4 }}>
              {data.chartData.map((entry) => (
                <Cell
                  key={entry.label}
                  fill={entry.isNegative ? "#D8672B" : "#0E7573"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AgentAlertCard({ alert }: { alert: AgentAlert }) {
  return (
    <div className="fluxo__card fluxo__agent-alert">
      <div className="fluxo__agent-alert-header">
        <Lightbulb size={18} strokeWidth={1.75} aria-hidden="true" />
        <span className="fluxo__agent-alert-title">Alerta do SplitAgent</span>
      </div>
      <p className="fluxo__agent-alert-message">{alert.message}</p>
      <a href={alert.linkHref} className="fluxo__agent-alert-link">
        {alert.linkLabel} →
      </a>
    </div>
  );
}

function MovementItem({ movement }: { movement: Movement }) {
  const isPositive = movement.amount > 0;
  return (
    <li className="fluxo__movement-item">
      <div className="fluxo__movement-info">
        <p className="fluxo__movement-title">{movement.title}</p>
        <p className="fluxo__movement-description">{movement.description}</p>
        <p className="fluxo__movement-date">{movement.date}</p>
      </div>
      <span
        className={`fluxo__movement-amount ${
          isPositive
            ? "fluxo__movement-amount--positive"
            : "fluxo__movement-amount--negative"
        }`}
      >
        {isPositive ? "+ " : "- "}
        {formatBRLCompact(movement.amount)}
      </span>
    </li>
  );
}

function MovementsCard({ movements }: { movements: Movement[] }) {
  return (
    <div className="fluxo__card fluxo__movements-card">
      <h2 className="fluxo__card-title">Próximas movimentações</h2>
      <ul className="fluxo__movement-list">
        {movements.map((m) => (
          <MovementItem key={m.id} movement={m} />
        ))}
      </ul>
      <div className="fluxo__movements-footer">
        <a href="#ver-todas" className="fluxo__movements-see-all">
          Ver todas
        </a>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FluxoDeCaixa() {
  return (
    <ChatShell headerVariant="nav">
      <div className="fluxo">
        <div className="fluxo__page-header">
          <h1 className="fluxo__title">Fluxo de Caixa</h1>
          <p className="fluxo__subtitle">
            Acompanhe o que entra, o que sai e o saldo previsto.
          </p>
        </div>

        <div className="fluxo__layout">
          {/* Coluna esquerda */}
          <div className="fluxo__col-left">
            <BalanceCard data={BALANCE_SUMMARY} />
            <ProjectionCard data={CASH_PROJECTION} />
            <AgentAlertCard alert={AGENT_ALERT} />
          </div>

          {/* Coluna direita */}
          <MovementsCard movements={MOVEMENTS} />
        </div>
      </div>
    </ChatShell>
  );
}
