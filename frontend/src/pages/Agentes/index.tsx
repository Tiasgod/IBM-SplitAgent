import { useState } from "react";
import {
  TrendingUp,
  CreditCard,
  Receipt,
  SplitSquareHorizontal,
  ChevronRight,
  Bot,
  Loader2,
} from "lucide-react";
import { PageLayout } from "../../components/layout/PageLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import {
  agentesService,
  type AnalisarFinanceiroParams,
  type SimularSplitRequest,
  type AnalisarCreditoRequest,
  type EstimarTributosRequest,
  type SplitParticipant,
} from "../../services/agentes.service";
import "./Agentes.css";

// ─── Constants ───────────────────────────────────────────────────────────────

const ALIQUOTA_OPTIONS = [
  { value: "6",     label: "Simples Nacional (~6%)" },
  { value: "13.33", label: "Lucro Presumido (~13,33%)" },
  { value: "15",    label: "Lucro Real (~15%)" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function extractText(res: Record<string, unknown>): string {
  // 1. ia_generativa.recomendacao (análise financeira com watsonx)
  const ia = res["ia_generativa"] as Record<string, unknown> | undefined;
  if (typeof ia?.["recomendacao"] === "string" && ia["recomendacao"].trim())
    return ia["recomendacao"].trim();

  // 2. split-payment: monta resumo a partir de results
  const results = res["results"] as Record<string, unknown> | undefined;
  if (results) {
    const lines: string[] = [];
    const add = (obj: Record<string, unknown> | undefined) => {
      if (typeof obj?.["message"] === "string") lines.push(obj["message"] as string);
    };
    add(results["guardian"]     as Record<string, unknown> | undefined);
    add(results["inclusion"]    as Record<string, unknown> | undefined);
    add(results["split_payment"] as Record<string, unknown> | undefined);
    const split = results["split_payment"] as Record<string, unknown> | undefined;
    const shares = split?.["shares"] as { name: string; amount: string }[] | undefined;
    if (shares && shares.length > 0) {
      lines.push("");
      lines.push("Divisão:");
      shares.forEach(s => {
        const amt = parseFloat(s.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        lines.push(`  • ${s.name || "Participante"}: ${amt}`);
      });
    }
    if (lines.length > 0) return lines.join("\n");
  }

  // 3. crédito / tributos: message + campos numéricos relevantes
  const msgLines: string[] = [];
  if (typeof res["message"] === "string" && res["message"].trim())
    msgLines.push(res["message"].trim());
  if (typeof res["aviso"] === "string" && res["aviso"].trim())
    msgLines.push(`⚠ ${res["aviso"].trim()}`);
  const numFields: [string, string][] = [
    ["available_credit",      "Crédito disponível"],
    ["purchase_amount",       "Valor da operação"],
    ["base_calculo",          "Base de cálculo"],
    ["tributos_estimados",    "Tributos estimados"],
    ["valor_liquido_estimado","Valor líquido estimado"],
  ];
  for (const [key, label] of numFields) {
    const v = res[key];
    if (v !== undefined && v !== null) {
      const n = parseFloat(String(v));
      if (!isNaN(n))
        msgLines.push(`${label}: ${n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`);
    }
  }
  if (msgLines.length > 0) return msgLines.join("\n");

  // 4. fallback
  return JSON.stringify(res, null, 2);
}

// ─── Skeleton card (shown while loading) ─────────────────────────────────────

function AgentSkeletonCard({ title }: { title: string }) {
  return (
    <div className="agentes__agent-card agentes__agent-card--skeleton">
      <div className="agentes__agent-card-header">
        <Bot size={16} strokeWidth={1.75} aria-hidden="true" />
        <span className="agentes__agent-card-title">{title}</span>
      </div>
      <div className="agentes__agent-card-body">
        <div className="agentes__skeleton-line agentes__skeleton-line--full" />
        <div className="agentes__skeleton-line agentes__skeleton-line--lg" />
        <div className="agentes__skeleton-line agentes__skeleton-line--md" />
        <div className="agentes__skeleton-line agentes__skeleton-line--sm" />
        <div className="agentes__skeleton-line agentes__skeleton-line--lg" />
      </div>
    </div>
  );
}

// ─── Shared text result card ──────────────────────────────────────────────────

function AgentTextCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="agentes__agent-card">
      <div className="agentes__agent-card-header">
        <Bot size={16} strokeWidth={1.75} aria-hidden="true" />
        <span className="agentes__agent-card-title">{title}</span>
      </div>
      <div className="agentes__agent-card-body">
        <p className="agentes__agent-card-para">{text}</p>
      </div>
    </div>
  );
}

// ─── Tab: Análise financeira ──────────────────────────────────────────────────

function TabFinanceiro() {
  const [aliquota, setAliquota] = useState("6");
  const [saldoMin, setSaldoMin] = useState("0.00");
  const [horizonte, setHorizonte] = useState("30");
  const [incluirIa, setIncluirIa] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const params: AnalisarFinanceiroParams = {
        aliquota_tributaria_percentual: parseFloat(aliquota),
        saldo_minimo: parseFloat(saldoMin),
        horizonte_dias: parseInt(horizonte, 10),
        incluir_ia: incluirIa,
      };
      const res = await agentesService.analisarFinanceiro(params);
      setResult(res as Record<string, unknown>);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao analisar fluxo financeiro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="agentes__form" onSubmit={handleSubmit}>
      <div className="agentes__fields">
        <div className="agentes__field">
          <Select
            label="Alíquota tributária"
            options={ALIQUOTA_OPTIONS}
            placeholder="Selecione o regime"
            value={aliquota}
            onChange={e => setAliquota(e.target.value)}
          />
        </div>
        <div className="agentes__field">
          <label className="agentes__label">Saldo mínimo (R$)</label>
          <Input
            variant="number"
            value={saldoMin}
            min={0}
            step={0.01}
            onChange={e => setSaldoMin(e.target.value)}
          />
        </div>
        <div className="agentes__field">
          <label className="agentes__label">Horizonte (dias)</label>
          <Input
            variant="number"
            value={horizonte}
            min={1}
            max={90}
            step={1}
            onChange={e => setHorizonte(e.target.value)}
          />
        </div>
        <div className="agentes__field agentes__field--toggle">
          <label className="agentes__label">Incluir IA (watsonx)</label>
          <button
            type="button"
            role="switch"
            aria-checked={incluirIa}
            className={`agentes__toggle${incluirIa ? " agentes__toggle--on" : ""}`}
            onClick={() => setIncluirIa(v => !v)}
          >
            <span className="agentes__toggle-thumb" />
          </button>
        </div>
      </div>
      {error && <p className="agentes__error">{error}</p>}
      <Button type="submit" variant="primary" disabled={loading} className="agentes__submit">
        {loading ? <Loader2 size={16} className="agentes__spin" /> : null}
        {loading ? "Analisando…" : "Analisar fluxo financeiro"}
      </Button>
      {loading && <AgentSkeletonCard title="Análise financeira" />}
      {result && <AgentTextCard title="Análise financeira" text={extractText(result)} />}
    </form>
  );
}

// ─── Tab: Split payment ───────────────────────────────────────────────────────

function TabSplit() {
  const [total, setTotal] = useState("1000");
  const [participants, setParticipants] = useState<SplitParticipant[]>([
    { name: "", weight: 1 },
    { name: "", weight: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  function updateParticipant(index: number, field: keyof SplitParticipant, value: string) {
    setParticipants(prev =>
      prev.map((p, i) =>
        i === index
          ? { ...p, [field]: field === "weight" ? parseFloat(value) || 0 : value }
          : p
      )
    );
  }

  function addParticipant() {
    setParticipants(prev => [...prev, { name: "", weight: 1 }]);
  }

  function removeParticipant(index: number) {
    setParticipants(prev => prev.filter((_, i) => i !== index));
  }

  const totalWeight = participants.reduce((s, p) => s + (p.weight || 0), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const body: SimularSplitRequest = {
        total: parseFloat(total),
        participants,
      };
      const res = await agentesService.simularSplit(body);
      setResult(res as Record<string, unknown>);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao simular divisão de pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="agentes__form" onSubmit={handleSubmit}>
      <div className="agentes__fields">
        <div className="agentes__field">
          <label className="agentes__label">Valor total (R$)</label>
          <Input
            variant="number"
            value={total}
            min={1}
            step={0.01}
            onChange={e => setTotal(e.target.value)}
          />
        </div>
      </div>

      <div className="agentes__participants">
        <div className="agentes__participants-header">
          <span className="agentes__participants-title">Participantes</span>
          <button type="button" className="agentes__add-btn" onClick={addParticipant}>
            + Adicionar
          </button>
        </div>

        {participants.map((p, i) => {
          const share = totalWeight > 0 ? (p.weight / totalWeight) * parseFloat(total || "0") : 0;
          return (
            <div key={i} className="agentes__participant-row">
              <Input
                placeholder="Nome"
                value={p.name}
                onChange={e => updateParticipant(i, "name", e.target.value)}
                className="agentes__participant-name"
              />
              <div className="agentes__participant-weight-wrap">
                <Input
                  variant="number"
                  placeholder="Peso"
                  value={String(p.weight)}
                  min={1}
                  step={1}
                  onChange={e => updateParticipant(i, "weight", e.target.value)}
                  className="agentes__participant-weight"
                />
                <span className="agentes__participant-share">{fmtBRL(share)}</span>
              </div>
              {participants.length > 2 && (
                <button
                  type="button"
                  className="agentes__remove-btn"
                  aria-label="Remover participante"
                  onClick={() => removeParticipant(i)}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="agentes__error">{error}</p>}
      <Button type="submit" variant="primary" disabled={loading} className="agentes__submit">
        {loading ? <Loader2 size={16} className="agentes__spin" /> : null}
        {loading ? "Simulando…" : "Simular divisão"}
      </Button>
      {loading && <AgentSkeletonCard title="Resultado da divisão" />}
      {result && <AgentTextCard title="Resultado da divisão" text={extractText(result)} />}
    </form>
  );
}

// ─── Tab: Análise de crédito ──────────────────────────────────────────────────

function TabCredito() {
  const [total, setTotal] = useState("0");
  const [creditLimit, setCreditLimit] = useState("0");
  const [currentDebt, setCurrentDebt] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const body: AnalisarCreditoRequest = {
        total: parseFloat(total),
        credit_context: {
          credit_limit: parseFloat(creditLimit),
          current_debt: parseFloat(currentDebt),
        },
      };
      const res = await agentesService.analisarCredito(body);
      setResult(res as Record<string, unknown>);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao analisar crédito.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="agentes__form" onSubmit={handleSubmit}>
      <div className="agentes__fields">
        <div className="agentes__field">
          <label className="agentes__label">Valor da operação (R$)</label>
          <Input
            variant="number"
            value={total}
            min={0}
            step={0.01}
            onChange={e => setTotal(e.target.value)}
          />
        </div>
        <div className="agentes__field">
          <label className="agentes__label">Limite de crédito (R$)</label>
          <Input
            variant="number"
            value={creditLimit}
            min={0}
            step={0.01}
            onChange={e => setCreditLimit(e.target.value)}
          />
        </div>
        <div className="agentes__field">
          <label className="agentes__label">Dívida atual (R$)</label>
          <Input
            variant="number"
            value={currentDebt}
            min={0}
            step={0.01}
            onChange={e => setCurrentDebt(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="agentes__error">{error}</p>}
      <Button type="submit" variant="primary" disabled={loading} className="agentes__submit">
        {loading ? <Loader2 size={16} className="agentes__spin" /> : null}
        {loading ? "Analisando…" : "Analisar crédito"}
      </Button>
      {loading && <AgentSkeletonCard title="Análise de crédito" />}
      {result && <AgentTextCard title="Análise de crédito" text={extractText(result)} />}
    </form>
  );
}

// ─── Tab: Estimativa de tributos ──────────────────────────────────────────────

function TabTributos() {
  const [total, setTotal] = useState("0");
  const [aliquota, setAliquota] = useState("6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const body: EstimarTributosRequest = {
        total: parseFloat(total),
        aliquota_percentual: parseFloat(aliquota),
      };
      const res = await agentesService.estimarTributos(body);
      setResult(res as Record<string, unknown>);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao estimar tributos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="agentes__form" onSubmit={handleSubmit}>
      <div className="agentes__fields">
        <div className="agentes__field">
          <label className="agentes__label">Valor base (R$)</label>
          <Input
            variant="number"
            value={total}
            min={0}
            step={0.01}
            onChange={e => setTotal(e.target.value)}
          />
        </div>
        <div className="agentes__field">
          <Select
            label="Alíquota"
            options={ALIQUOTA_OPTIONS}
            placeholder="Selecione o regime"
            value={aliquota}
            onChange={e => setAliquota(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="agentes__error">{error}</p>}
      <Button type="submit" variant="primary" disabled={loading} className="agentes__submit">
        {loading ? <Loader2 size={16} className="agentes__spin" /> : null}
        {loading ? "Calculando…" : "Estimar tributos"}
      </Button>
      {loading && <AgentSkeletonCard title="Estimativa de tributos" />}
      {result && <AgentTextCard title="Estimativa de tributos" text={extractText(result)} />}
    </form>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabId = "financeiro" | "split" | "credito" | "tributos";

const TABS: { id: TabId; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: "financeiro",
    label: "Fluxo financeiro",
    icon: <TrendingUp size={20} strokeWidth={1.75} aria-hidden="true" />,
    desc: "Analisa o fluxo financeiro com agentes e IBM watsonx.ai",
  },
  {
    id: "split",
    label: "Split payment",
    icon: <SplitSquareHorizontal size={20} strokeWidth={1.75} aria-hidden="true" />,
    desc: "Valida e simula a divisão de um pagamento entre participantes",
  },
  {
    id: "credito",
    label: "Crédito",
    icon: <CreditCard size={20} strokeWidth={1.75} aria-hidden="true" />,
    desc: "Analisa matematicamente a disponibilidade informada de crédito",
  },
  {
    id: "tributos",
    label: "Tributos",
    icon: <Receipt size={20} strokeWidth={1.75} aria-hidden="true" />,
    desc: "Calcula estimativa demonstrativa com alíquota informada",
  },
];

const TAB_CONTENT: Record<TabId, React.ReactNode> = {
  financeiro: <TabFinanceiro />,
  split: <TabSplit />,
  credito: <TabCredito />,
  tributos: <TabTributos />,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Agentes() {
  const [activeTab, setActiveTab] = useState<TabId>("financeiro");
  const currentTab = TABS.find(t => t.id === activeTab)!;

  return (
    <PageLayout headerVariant="nav">
      <div className="agentes">
        {/* Page header */}
        <div className="agentes__page-header">
          <h1 className="agentes__title">Agentes inteligentes</h1>
          <p className="agentes__subtitle">
            Execute análises financeiras com agentes de IA especializados.
          </p>
        </div>

        {/* Tab selector */}
        <div className="agentes__tabs" role="tablist" aria-label="Agentes">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`agentes-panel-${tab.id}`}
              id={`agentes-tab-${tab.id}`}
              className={`agentes__tab${activeTab === tab.id ? " agentes__tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Active tab panel */}
        <div
          className="agentes__card"
          role="tabpanel"
          id={`agentes-panel-${activeTab}`}
          aria-labelledby={`agentes-tab-${activeTab}`}
        >
          <div className="agentes__card-header">
            <div className="agentes__card-icon">{currentTab.icon}</div>
            <div>
              <h2 className="agentes__card-title">{currentTab.label}</h2>
              <p className="agentes__card-desc">{currentTab.desc}</p>
            </div>
            <ChevronRight size={18} strokeWidth={1.75} className="agentes__card-chevron" aria-hidden="true" />
          </div>
          {TAB_CONTENT[activeTab]}
        </div>
      </div>
    </PageLayout>
  );
}
