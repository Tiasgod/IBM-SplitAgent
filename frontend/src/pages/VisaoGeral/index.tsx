import { useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";
import { PageLayout } from "../../components/layout/PageLayout";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { FinancialSummaryCard } from "./FinancialSummaryCard";
import { CashFlowChart } from "./CashFlowChart";
import { useAuth } from "../../hooks/useAuth";
import { useStaleCache } from "../../hooks/useStaleCache";
import {
  calculosFinanceirosService,
  type CashSituation,
  type RiskPeriod,
  type VisaoGeralPageData,
} from "../../services/calculos-financeiros.service";
import "./VisaoGeral.css";

// ─── Re-exports for CashFlowChart.tsx (imports CashFlowPoint & RiskPeriod from "./index") ──

export type { CashSituation, CashFlowPoint, RiskPeriod } from "../../services/calculos-financeiros.service";

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
    : `Contas ar somam R$ ${outflowsFormatted} mil nesse período. Quer ver o que fazer?`;

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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function VisaoGeralSkeleton() {
  return (
    <PageLayout headerVariant="nav">
      <div className="visao-geral">
        <div className="visao-geral__page-header">
          <Skeleton width="120px" height="0.875rem" />
          <Skeleton width="160px" height="1.5rem" style={{ marginTop: 6 }} />
        </div>
        {/* FinancialSummaryCard shape */}
        <div className="visao-geral__summary-skeleton">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="visao-geral__summary-skeleton-item">
              <Skeleton width="60%" height="0.75rem" />
              <Skeleton width="80%" height="1.25rem" style={{ marginTop: 6 }} />
            </div>
          ))}
        </div>
        {/* CashFlowChart shape */}
        <div className="visao-geral__chart-skeleton">
          <Skeleton width="140px" height="0.875rem" />
          <Skeleton width="100%" height="140px" borderRadius="8px" style={{ marginTop: 12 }} />
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VisaoGeral() {
  const { user } = useAuth();
  const primeiroNome = user?.nome?.split(" ")[0] ?? "você";

  const { data, loading, error } = useStaleCache<VisaoGeralPageData>(
    "cache:visao-geral",
    calculosFinanceirosService.buscarVisaoGeral
  );

  if (loading) {
    return <VisaoGeralSkeleton />;
  }

  if (error && !data) {
    return (
      <PageLayout headerVariant="nav">
        <p style={{ textAlign: "center" }}>{error}</p>
      </PageLayout>
    );
  }

  const { summary, projectionPoints, minimumBalance, riskPeriods, situation } = data!;

  return (
    <PageLayout headerVariant="nav">
      <div className="visao-geral">
        {/* Page header */}
        <div className="visao-geral__page-header">
          <p className="visao-geral__eyebrow">Olá, {primeiroNome}</p>
          <h1 className="visao-geral__title">Visão geral</h1>
          {error && <p className="visao-geral__stale-error">{error} — exibindo dados anteriores.</p>}
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
