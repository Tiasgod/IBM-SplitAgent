import { useState, useRef, useEffect } from "react";
import { Lightbulb, ListChecks, TrendingUp, CalendarDays, ChevronDown, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { ChatShell } from "../../components/layout/ChatShell";
import { Button } from "../../components/ui/Button";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "./Historico.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Decision {
  id: string;
  date: string;
  recommendation: string;
  userChoice: string;
  projectedResult: string;
}

// ─── Placeholder data (will come from backend) ────────────────────────────────

const DECISIONS: Decision[] = [
  {
    id: "1",
    date: "12/09/2026",
    recommendation: "Antecipar recebíveis",
    userChoice: "Antecipação parcial de R$ 15.000",
    projectedResult: "Saldo mínimo sobe para R$ 18.000",
  },
  {
    id: "2",
    date: "03/09/2026",
    recommendation: "Antecipar recebíveis",
    userChoice: "Antecipação parcial de R$ 15.000",
    projectedResult: "Saldo mínimo sobe para R$ 18.000",
  },
  {
    id: "3",
    date: "20/08/2026",
    recommendation: "Reduzir despesas variáveis",
    userChoice: "Corte de R$ 3.000 em fornecedores",
    projectedResult: "Fluxo positivo por 45 dias",
  },
];

const PERIOD_OPTIONS = [
  "Todos os períodos",
  "Últimos 30 dias",
  "Últimos 3 meses",
  "Últimos 6 meses",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function DecisionCard({ decision }: { decision: Decision }) {
  return (
    <li className="historico__entry">
      <span className="historico__date">{decision.date}</span>
      <div className="historico__card">
        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--gold" aria-hidden="true">
            <Lightbulb size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Recomendação do Split Payment:</span>
            <span className="historico__row-value">{decision.recommendation}</span>
          </div>
        </div>

        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--dark" aria-hidden="true">
            <ListChecks size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Sua decisão</span>
            <span className="historico__row-value">{decision.userChoice}</span>
          </div>
        </div>

        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--teal" aria-hidden="true">
            <TrendingUp size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Resultado projeto</span>
            <span className="historico__row-value">{decision.projectedResult}</span>
          </div>
        </div>
      </div>
    </li>
  );
}

function PeriodFilter() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(PERIOD_OPTIONS[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="historico__filter-wrap" ref={ref}>
      <button
        className="historico__filter-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <CalendarDays size={16} strokeWidth={1.75} aria-hidden="true" />
        <span>{selected}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`historico__filter-chevron${open ? " historico__filter-chevron--open" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul className="historico__filter-dropdown" role="listbox">
          {PERIOD_OPTIONS.map((option) => (
            <li
              key={option}
              role="option"
              aria-selected={option === selected}
              className={`historico__filter-option${option === selected ? " historico__filter-option--active" : ""}`}
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="historico__empty">
      <p className="historico__empty-text">Ainda não há histórico registrado...</p>
      {isDesktop && (
        <Link to="/assistente" className="historico__empty-cta">
          <Button variant="cta" icon={<Bot size={18} strokeWidth={1.75} />}>
            Falar com SplitAgent
          </Button>
        </Link>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Historico() {
  return (
    <ChatShell headerVariant="nav">
      <div className="historico">
        <div className="historico__page-header">
          <h1 className="historico__title">Histórico</h1>
          <p className="historico__subtitle">
            Acompanhe as recomendações que você aceitou e os resultados projetados
          </p>
        </div>

        <PeriodFilter />

        {DECISIONS.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="historico__list">
            {DECISIONS.map((d) => (
              <DecisionCard key={d.id} decision={d} />
            ))}
          </ul>
        )}
      </div>
    </ChatShell>
  );
}
