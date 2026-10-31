import { useState, useRef, useEffect } from "react";
import { Lightbulb, TrendingUp, CalendarDays, ChevronDown, Calculator, Tag, DollarSign, Landmark, Banknote } from "lucide-react";
import { Link } from "react-router-dom";
import { ChatShell } from "../../components/layout/ChatShell";
import { Button } from "../../components/ui/Button";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "./Historico.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Simulation {
  id: string;
  date: string;
  transactionType: string;
  simulatedValue: number;
  taxRegime: string;
  estimatedTax: number;
  aliquota: number;
  totalSaleValue: number;
  netReceivedValue: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_SIMULATIONS: Simulation[] = [
  {
    id: "1",
    date: "28/10/2026",
    transactionType: "Venda",
    simulatedValue: 12000,
    taxRegime: "Simples Nacional (~6%)",
    estimatedTax: 720,
    aliquota: 6,
    totalSaleValue: 12000,
    netReceivedValue: 11280,
  },
  {
    id: "2",
    date: "25/10/2026",
    transactionType: "Venda",
    simulatedValue: 5000,
    taxRegime: "Lucro Presumido (~13,33%)",
    estimatedTax: 666.5,
    aliquota: 13.33,
    totalSaleValue: 5000,
    netReceivedValue: 4333.5,
  },
  {
    id: "3",
    date: "20/10/2026",
    transactionType: "Despesa",
    simulatedValue: 8500,
    taxRegime: "Lucro Real (~15%)",
    estimatedTax: 1275,
    aliquota: 15,
    totalSaleValue: 8500,
    netReceivedValue: 7225,
  },
];

const PERIOD_OPTIONS = [
  "Todos os períodos",
  "Últimos 30 dias",
  "Últimos 3 meses",
  "Últimos 6 meses",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SimulationCard({ simulation }: { simulation: Simulation }) {
  const fmt = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <li className="historico__entry">
      <span className="historico__date">{simulation.date}</span>
      <div className="historico__card">
        {/* Grupo 1 — Dados da operação */}
        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--gold" aria-hidden="true">
            <Tag size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Tipo de transação</span>
            <span className="historico__row-value">{simulation.transactionType}</span>
          </div>
        </div>

        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--dark" aria-hidden="true">
            <CalendarDays size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Data</span>
            <span className="historico__row-value">{simulation.date}</span>
          </div>
        </div>

        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--dark" aria-hidden="true">
            <DollarSign size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Valor simulado</span>
            <span className="historico__row-value">{fmt(simulation.simulatedValue)}</span>
          </div>
        </div>

        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--dark" aria-hidden="true">
            <Landmark size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Regime tributário</span>
            <span className="historico__row-value">{simulation.taxRegime}</span>
          </div>
        </div>

        {/* Grupo 2 — Resultado da simulação */}
        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--gold" aria-hidden="true">
            <Lightbulb size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Impostos estimados</span>
            <span className="historico__row-value">
              {fmt(simulation.estimatedTax)} · Alíquota: {simulation.aliquota}%
            </span>
          </div>
        </div>

        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--teal" aria-hidden="true">
            <TrendingUp size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Valor total vendido</span>
            <span className="historico__row-value">{fmt(simulation.totalSaleValue)}</span>
          </div>
        </div>

        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--teal" aria-hidden="true">
            <Banknote size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Valor recebido líquido</span>
            <span className="historico__row-value">{fmt(simulation.netReceivedValue)}</span>
          </div>
        </div>
      </div>
    </li>
  );
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

function parseBRDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function filterByPeriod(simulations: Simulation[], period: string): Simulation[] {
  if (period === "Todos os períodos") return simulations;

  const now = new Date();
  const cutoff = new Date(now);

  if (period === "Últimos 30 dias") {
    cutoff.setDate(now.getDate() - 30);
  } else if (period === "Últimos 3 meses") {
    cutoff.setMonth(now.getMonth() - 3);
  } else if (period === "Últimos 6 meses") {
    cutoff.setMonth(now.getMonth() - 6);
  } else {
    return simulations;
  }

  return simulations.filter((s) => parseBRDate(s.date) >= cutoff);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PeriodFilterProps {
  selected: string;
  onChange: (value: string) => void;
}

function PeriodFilter({ selected, onChange }: PeriodFilterProps) {
  const [open, setOpen] = useState(false);
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
                onChange(option);
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

function NoResults() {
  return (
    <div className="historico__empty">
      <p className="historico__empty-text">Nenhuma simulação neste período.</p>
    </div>
  );
}

function EmptyState() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="historico__empty">
      <p className="historico__empty-text">Nenhuma simulação realizada ainda...</p>
      {isDesktop && (
        <Link to="/simulador" className="historico__empty-cta">
          <Button variant="cta" icon={<Calculator size={18} strokeWidth={1.75} />}>
            Fazer uma simulação
          </Button>
        </Link>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Historico() {
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0]);

  function renderContent() {
    if (MOCK_SIMULATIONS.length === 0) {
      return <EmptyState />;
    }
    const filtered = filterByPeriod(MOCK_SIMULATIONS, period);
    if (filtered.length === 0) {
      return <NoResults />;
    }
    return (
      <ul className="historico__list">
        {filtered.map((s) => (
          <SimulationCard key={s.id} simulation={s} />
        ))}
      </ul>
    );
  }

  return (
    <ChatShell headerVariant="nav">
      <div className="historico">
        <div className="historico__page-header">
          <h1 className="historico__title">Histórico de Simulações</h1>
          <p className="historico__subtitle">
            Veja todas as simulações de transações que você realizou
          </p>
        </div>

        <PeriodFilter selected={period} onChange={setPeriod} />

        {renderContent()}
      </div>
    </ChatShell>
  );
}
