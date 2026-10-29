import {
  Search,
  FileText,
  RefreshCw,
  Banknote,
} from "lucide-react";
import "./FinancialSummaryCard.css";

interface FinancialSummaryCardProps {
  estimatedNet: number;
  totalSold: number;
  estimatedTaxes: number;
  netValue: number;
  currentBalance: number;
}

function fmt(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function FinancialSummaryCard({
  estimatedNet,
  totalSold,
  estimatedTaxes,
  netValue,
  currentBalance,
}: FinancialSummaryCardProps) {
  const metrics = [
    { icon: Search,    label: "Bruto",    value: totalSold },
    { icon: FileText,  label: "Tributos", value: estimatedTaxes },
    { icon: RefreshCw, label: "Líquido",  value: netValue },
    { icon: Banknote,  label: "Saldo",    value: currentBalance },
  ];

  return (
    <div className="fin-summary">
      <h2 className="fin-summary__title">Resumo Financeiro do Mês</h2>

      <div className="fin-summary__liquid">
        <span className="fin-summary__liquid-label">Líquido estimado:</span>
        <span className="fin-summary__liquid-value">{fmt(estimatedNet)}</span>
      </div>

      <div className="fin-summary__grid">
        {metrics.map(({ icon: Icon, label, value }) => (
          <div key={label} className="fin-summary__metric">
            <div className="fin-summary__metric-icon" aria-hidden="true">
              <Icon size={18} strokeWidth={1.75} />
            </div>
            <div className="fin-summary__metric-info">
              <span className="fin-summary__metric-label">{label}</span>
              <span className="fin-summary__metric-value">{fmt(value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
