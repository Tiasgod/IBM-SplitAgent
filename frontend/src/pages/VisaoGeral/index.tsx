import { Bot } from "lucide-react";
import { PageLayout } from "../../components/layout/PageLayout";
import { Button } from "../../components/ui/Button";
import { FinancialSummaryCard } from "./FinancialSummaryCard";
import { CashFlowChart } from "./CashFlowChart";
import { useAuth } from "../../hooks/useAuth";
import "./VisaoGeral.css";

export default function VisaoGeral() {
  const { user } = useAuth();
  const primeiroNome = user?.nome?.split(" ")[0] ?? "você";

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
          liquidoEstimado={14000}
          bruto={84200}
          tributos={84200}
          liquido={84200}
          saldo={84200}
        />

        {/* Cash flow projection chart */}
        <CashFlowChart />

        {/* Cash squeeze alert card */}
        <div className="visao-geral__alert-card">
          <div className="visao-geral__alert-body">
            <span className="visao-geral__alert-icon" aria-hidden="true">⚠</span>
            <div className="visao-geral__alert-text">
              <p className="visao-geral__alert-title">
                Aperto de caixa previsto entre os dias 10 e 22!
              </p>
              <p className="visao-geral__alert-desc">
                Contas a pagar somam R$ 41 mil nesse período. Quer ver o que fazer?
              </p>
            </div>
          </div>
          <Button
            variant="cta"
            icon={<Bot size={20} strokeWidth={1.75} aria-hidden="true" />}
            className="visao-geral__cta-btn"
          >
            Falar com SplitAgent
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
