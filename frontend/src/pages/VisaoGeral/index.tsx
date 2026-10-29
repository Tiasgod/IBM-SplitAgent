import { useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";
import { PageLayout } from "../../components/layout/PageLayout";
import { Button } from "../../components/ui/Button";
import { FinancialSummaryCard } from "./FinancialSummaryCard";
import { CashFlowChart } from "./CashFlowChart";
import { useAuth } from "../../hooks/useAuth";
import "./VisaoGeral.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CashSituation = "saudavel" | "atencao" | "critica";

export interface CashFlowPoint {
  day: string;
  value: number;
}

export interface RiskPeriod {
  startDay: string;
  endDay: string;
  totalOutflows: number;
}

export interface FinancialSummary {
  estimatedNet: number;
  totalSold: number;
  estimatedTaxes: number;
  netValue: number;
  currentBalance: number;
}

export interface VisaoGeralData {
  userName: string;
  summary: FinancialSummary;
  projectionPoints: CashFlowPoint[];
  minimumBalance: number;
  lowestBalance: number;
  lowestBalanceDay: string;
  riskPeriods: RiskPeriod[];
  situation: CashSituation;
}

// ─── Placeholder data (will come from backend) ────────────────────────────────

const VISAO_GERAL_DATA: VisaoGeralData = {
  userName: "Fulana",
  summary: {
    estimatedNet:   14000,
    totalSold:      84200,
    estimatedTaxes: 84200,
    netValue:       84200,
    currentBalance: 84200,
  },
  projectionPoints: [
    { day: "Hoje",   value: 55 },
    { day: "Dia 5",  value: 50 },
    { day: "Dia 10", value: 38 },
    { day: "Dia 15", value: 28 },
    { day: "Dia 20", value: 24 },
    { day: "Dia 22", value: 26 },
    { day: "Dia 25", value: 34 },
    { day: "Dia 30", value: 42 },
  ],
  minimumBalance: 25,
  lowestBalance: 24,
  lowestBalanceDay: "Dia 20",
  riskPeriods: [
    { startDay: "Dia 10", endDay: "Dia 22", totalOutflows: 41000 },
  ],
  situation: "atencao",
};

// ─── Alert sub-component ──────────────────────────────────────────────────────

function CashAlertCard({
  situation,
  riskPeriod,
}: {
  situation: CashSituation;
  riskPeriod: RiskPeriod;
}) {
  const navigate = useNavigate();

  const isCritica = situation === "critica";
  const modifierClass = isCritica
    ? "visao-geral__alert-card--critica"
    : "visao-geral__alert-card--atencao";

  const title = isCritica
    ? `Caixa crítico entre os dias ${riskPeriod.startDay.replace("Dia ", "")} e ${riskPeriod.endDay.replace("Dia ", "")}!`
    : `Aperto de caixa previsto entre os dias ${riskPeriod.startDay.replace("Dia ", "")} e ${riskPeriod.endDay.replace("Dia ", "")}!`;

  const outflowsFormatted = (riskPeriod.totalOutflows / 1000).toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
  });

  const desc = isCritica
    ? `Contas a pagar somam R$ ${outflowsFormatted} mil nesse período. Ação imediata recomendada.`
    : `Contas a pagar somam R$ ${outflowsFormatted} mil nesse período. Quer ver o que fazer?`;

  return (
    <div className={`visao-geral__alert-card ${modifierClass}`}>
      <div className="visao-geral__alert-body">
        <span className="visao-geral__alert-icon" aria-hidden="true">⚠</span>
        <div className="visao-geral__alert-text">
          <p className="visao-geral__alert-title">{title}</p>
          <p className="visao-geral__alert-desc">{desc}</p>
        </div>
      </div>
      <Button
        variant="cta"
        icon={<Bot size={20} strokeWidth={1.75} aria-hidden="true" />}
        className="visao-geral__cta-btn"
        onClick={() => navigate("/assistente")}
      >
        Falar com SplitAgent
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VisaoGeral() {
  const { user } = useAuth();
  const primeiroNome = user?.nome?.split(" ")[0] ?? "você";
  const { summary, projectionPoints, minimumBalance, riskPeriods, situation } = VISAO_GERAL_DATA;

  return (
    <PageLayout headerVariant="nav">
      <div className="visao-geral">
        {/* Page header */}
        <div className="visao-geral__page-header">
          <p className="visao-geral__eyebrow">Olá, {primeiroNome}</p>
          <h1 className="visao-geral__title">Visão geral</h1>
        </div>

        {/* Financial summary card */}
        <FinancialSummaryCard
          estimatedNet={summary.estimatedNet}
          totalSold={summary.totalSold}
          estimatedTaxes={summary.estimatedTaxes}
          netValue={summary.netValue}
          currentBalance={summary.currentBalance}
        />

        {/* Cash flow projection chart */}
        <CashFlowChart
          points={projectionPoints}
          minimumBalance={minimumBalance}
          riskPeriods={riskPeriods}
        />

        {/* Cash squeeze alert card — only shown when situation is not "saudavel" */}
        {situation !== "saudavel" && riskPeriods.length > 0 && (
          <CashAlertCard situation={situation} riskPeriod={riskPeriods[0]} />
        )}
      </div>
    </PageLayout>
  );
}
