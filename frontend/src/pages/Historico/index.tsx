import { useState, useRef, useEffect } from "react";
import { Lightbulb, TrendingUp, CalendarDays, ChevronDown, Calculator, DollarSign, Landmark, Banknote } from "lucide-react";
import { Link } from "react-router-dom";
import { ChatShell } from "../../components/layout/ChatShell";
import { Button } from "../../components/ui/Button";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { simuladorService } from "../../services/simulador.service";
import type { SimulacaoHistorico } from "../../services/simulador.service";
import "./Historico.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtBRL = (s: string | number | null | undefined): string => {
  if (s == null || s === "") return "—";
  if (typeof s === "number") {
    return s.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  const n = /^\d+(\.\d+)?$/.test(s.trim())
    ? parseFloat(s)
    : parseFloat(s.replace(/[^\d,]/g, "").replace(",", "."));
  if (isNaN(n)) return s;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const fmtDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
};

// ─── Period filter helpers ────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  "Todos os períodos",
  "Últimos 30 dias",
  "Últimos 3 meses",
  "Últimos 6 meses",
];

function filterByPeriod(simulations: SimulacaoHistorico[], period: string): SimulacaoHistorico[] {
  if (period === "Todos os períodos") return simulations;
  const now = new Date();
  const cutoff = new Date(now);
  if (period === "Últimos 30 dias")   cutoff.setDate(now.getDate() - 30);
  else if (period === "Últimos 3 meses") cutoff.setMonth(now.getMonth() - 3);
  else if (period === "Últimos 6 meses") cutoff.setMonth(now.getMonth() - 6);
  else return simulations;
  return simulations.filter(s => new Date(s.criado_em) >= cutoff);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SimulationCard({ simulation }: { simulation: SimulacaoHistorico }) {
  const { parametros: p, resultado: r } = simulation;
  const aliquota = parseFloat(String(p.aliquota_tributaria_percentual));

  return (
    <li className="historico__entry">
      <span className="historico__date">{fmtDate(simulation.criado_em)}</span>
      <div className="historico__card">

        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--dark" aria-hidden="true">
            <CalendarDays size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Data simulada</span>
            <span className="historico__row-value">
              {new Date(p.data + "T00:00:00").toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>

        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--dark" aria-hidden="true">
            <DollarSign size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Valor simulado</span>
            <span className="historico__row-value">{fmtBRL(r.valor_simulado)}</span>
          </div>
        </div>

        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--dark" aria-hidden="true">
            <Landmark size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Alíquota tributária</span>
            <span className="historico__row-value">{aliquota}%</span>
          </div>
        </div>

        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--gold" aria-hidden="true">
            <Lightbulb size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Impostos estimados</span>
            <span className="historico__row-value">{fmtBRL(r.tributos_estimados_simulacao)}</span>
          </div>
        </div>

        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--teal" aria-hidden="true">
            <TrendingUp size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Valor bruto</span>
            <span className="historico__row-value">{fmtBRL(r.valor_simulado)}</span>
          </div>
        </div>

        <div className="historico__row">
          <span className="historico__row-badge historico__row-badge--teal" aria-hidden="true">
            <Banknote size={18} strokeWidth={1.75} />
          </span>
          <div className="historico__row-body">
            <span className="historico__row-label">Valor recebido líquido</span>
            <span className="historico__row-value">{fmtBRL(r.valor_liquido_simulacao)}</span>
          </div>
        </div>

      </div>
    </li>
  );
}

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
        onClick={() => setOpen(o => !o)}
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
          {PERIOD_OPTIONS.map(option => (
            <li
              key={option}
              role="option"
              aria-selected={option === selected}
              className={`historico__filter-option${option === selected ? " historico__filter-option--active" : ""}`}
              onClick={() => { onChange(option); setOpen(false); }}
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

function NoResults() {
  return (
    <div className="historico__empty">
      <p className="historico__empty-text">Nenhuma simulação neste período.</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Historico() {
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0]);
  const [simulations, setSimulations] = useState<SimulacaoHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    simuladorService.listarSimulacoes()
      .then(res => setSimulations(res.simulacoes))
      .catch(err => setError(err instanceof Error ? err.message : "Erro ao carregar histórico."))
      .finally(() => setLoading(false));
  }, []);

  function renderContent() {
    if (loading) {
      return <p className="historico__loading">Carregando...</p>;
    }
    if (error) {
      return <p className="historico__error" role="alert">{error}</p>;
    }
    if (simulations.length === 0) {
      return <EmptyState />;
    }
    const filtered = filterByPeriod(simulations, period);
    if (filtered.length === 0) {
      return <NoResults />;
    }
    return (
      <ul className="historico__list">
        {filtered.map(s => (
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
            Veja todas as simulações de venda que você realizou
          </p>
        </div>

        {!loading && !error && simulations.length > 0 && (
          <PeriodFilter selected={period} onChange={setPeriod} />
        )}

        {renderContent()}
      </div>
    </ChatShell>
  );
}
