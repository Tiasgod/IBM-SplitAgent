import { useState } from "react";
import {
  TrendingUp,
  Calendar,
  Shield,
  Building2,
  Upload,
  AlertCircle,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
} from "recharts";
import { PageLayout } from "../../components/layout/PageLayout";
import { ChatShell } from "../../components/layout/ChatShell";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import "./Simulador.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = "avista" | "parcelado" | "outro";

interface SimuladorForm {
  productType: string;
  saleValue: string;
  expectedDate: string;
  paymentMethod: PaymentMethod;
  taxRegime: string;
}

export interface SimuladorResult {
  estimatedTax: number;
  aliquota: number;
  totalSaleValue: number;
  netReceivedValue: number;
}

export interface CashForecast {
  availableBalance: number;
  lowestForecast: number;
  projectedExpenses: number;
}

export interface ChartPoint {
  label: string;
  balance: number;
  isRisk?: boolean;
}

export interface SimuladorResultData {
  result: SimuladorResult;
  forecast: CashForecast;
  chartData: ChartPoint[];
  agentAnalysis: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODUCT_OPTIONS = [
  { value: "produto", label: "Produto" },
  { value: "servico", label: "Serviço" },
  { value: "misto",   label: "Misto (produto + serviço)" },
];

const TAX_REGIME_OPTIONS = [
  { value: "simples",   label: "Simples Nacional" },
  { value: "presumido", label: "Lucro Presumido" },
  { value: "real",      label: "Lucro Real" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "avista",    label: "À vista" },
  { value: "parcelado", label: "Parcelado" },
  { value: "outro",     label: "Outro" },
];

const PRECISION_FEATURES = [
  { icon: TrendingUp, label: "Projeção do saldo futuro" },
  { icon: Calendar,   label: "Considere contas futuras na projeção" },
  { icon: Shield,     label: "Entender o impacto no caixa" },
];

const CONNECTION_OPTIONS = [
  {
    icon: Building2,
    title: "Conectar Conta Bancária",
    description: "Importe saldo e movimentações de um banco compatível.",
  },
  {
    icon: Upload,
    title: "Importar planilha ou arquivo",
    description: "Envie uma planilha de despesas, recebimentos ou fluxo de caixa.",
  },
];

// ─── Mock data for with-data result ──────────────────────────────────────────

const MOCK_CHART_DATA: ChartPoint[] = [
  { label: "Hoje",   balance: 48000 },
  { label: "Dia 5",  balance: 42000 },
  { label: "Dia 10", balance: 35000, isRisk: true },
  { label: "Dia 15", balance: 28000, isRisk: true },
  { label: "Dia 20", balance: 22000, isRisk: true },
  { label: "Dia 22", balance: 18500 },
  { label: "Dia 25", balance: 30000 },
  { label: "Dia 30", balance: 35000 },
];

const MIN_BALANCE = 20000;

// ─── Shared formatters ────────────────────────────────────────────────────────

const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtBRLShort = (n: number) =>
  n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });

// ─── Simulador Page ───────────────────────────────────────────────────────────

export default function Simulador() {
  const [step, setStep] = useState<"form" | "result-with-data" | "result">("form");
  const [resultData, setResultData] = useState<SimuladorResultData | null>(null);
  const [result, setResult] = useState<SimuladorResult | null>(null);
  const [form, setForm] = useState<SimuladorForm>({
    productType:   "",
    saleValue:     "",
    expectedDate:  "",
    paymentMethod: "avista",
    taxRegime:     "",
  });

  function handleSimulate() {
    const numericValue = parseFloat(form.saleValue.replace(/\D/g, "")) || 0;
    const aliquota = 0.1;
    const baseResult: SimuladorResult = {
      estimatedTax:     numericValue * aliquota,
      aliquota:         aliquota * 100,
      totalSaleValue:   numericValue,
      netReceivedValue: numericValue * (1 - aliquota),
    };

    // Simulate "has financial data" — flip to false to test the no-data result
    const hasFinancialData = true;

    if (hasFinancialData) {
      const tax = fmtBRL(baseResult.estimatedTax);
      const total = fmtBRL(baseResult.totalSaleValue);
      setResultData({
        result: baseResult,
        forecast: {
          availableBalance:  18500,
          lowestForecast:     6200,
          projectedExpenses: 12000,
        },
        chartData: MOCK_CHART_DATA,
        agentAnalysis: `A venda de ${total} tem ${tax} em impostos estimados.\n\nMesmo com a venda, seu caixa pode cair para R$ 6.200,00 nos próximos 30 dias por causa das despesas previstas.\n\n**Recomendação**: confira os pagamentos previstos e avalie parcelar compromissos para preservar seu capital de giro.`,
      });
      setStep("result-with-data");
    } else {
      setResult(baseResult);
      setStep("result");
    }
  }

  if (step === "result-with-data" && resultData) {
    return (
      <SimuladorResultWithData
        data={resultData}
        onBack={() => setStep("form")}
      />
    );
  }

  if (step === "result" && result) {
    return <SimuladorResultNoData result={result} onBack={() => setStep("form")} />;
  }

  return (
    <PageLayout headerVariant="nav">
      <div className="simulador">
        <div className="simulador__page-header">
          <p className="simulador__eyebrow">Teste antes de decidir</p>
          <h1 className="simulador__title">Simulador</h1>
        </div>

        <div className="simulador__card">
          <h2 className="simulador__card-title">Dados da venda</h2>

          <div className="simulador__fields">
            <Select
              label="O que você vai vender?"
              options={PRODUCT_OPTIONS}
              placeholder="Selecione"
              value={form.productType}
              onChange={e => setForm(f => ({ ...f, productType: e.target.value }))}
            />

            <Input
              label="Valor da venda"
              placeholder="R$"
              value={form.saleValue}
              onChange={e => setForm(f => ({ ...f, saleValue: e.target.value }))}
            />

            <Input
              variant="date"
              label="Data prevista"
              value={form.expectedDate}
              onChange={e => setForm(f => ({ ...f, expectedDate: e.target.value }))}
            />

            <fieldset className="simulador__fieldset">
              <legend className="simulador__legend">Como será o pagamento?</legend>
              <div className="simulador__toggle-group">
                {PAYMENT_METHODS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`simulador__toggle${form.paymentMethod === value ? " simulador__toggle--active" : ""}`}
                    onClick={() => setForm(f => ({ ...f, paymentMethod: value }))}
                    aria-pressed={form.paymentMethod === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <Select
              label="Regime tributário da empresa"
              options={TAX_REGIME_OPTIONS}
              placeholder="Selecione"
              value={form.taxRegime}
              onChange={e => setForm(f => ({ ...f, taxRegime: e.target.value }))}
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            className="simulador__submit"
            onClick={handleSimulate}
            disabled={!form.productType || !form.saleValue || !form.taxRegime}
          >
            Simular Impacto
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Shared: Impact card (used in both result variants) ───────────────────────

function ImpactCard({ result }: { result: SimuladorResult }) {
  return (
    <div className="simulador__card simulador__card--impact">
      <div className="simulador__impact-header">
        <h2 className="simulador__impact-title">
          Impacto estimado do Split Payment
        </h2>
        <a href="#como-calculamos" className="simulador__how-link">
          Como calculamos?
        </a>
      </div>

      <div className="simulador__impact-body">
        <div className="simulador__impact-left">
          <p className="simulador__impact-label">Valor estimado dos impostos</p>
          <p className="simulador__impact-tax">{fmtBRL(result.estimatedTax)}</p>
          <div className="simulador__impact-meta">
            <p className="simulador__impact-aliquota">
              Alíquota: {result.aliquota}%
            </p>
          </div>
        </div>

        <div className="simulador__impact-values">
          <div className="simulador__value-box">
            <span className="simulador__value-label">Valor total vendido</span>
            <span className="simulador__value-amount">
              {fmtBRL(result.totalSaleValue)}
            </span>
          </div>
          <div className="simulador__value-box">
            <span className="simulador__value-label">Valor recebido líquido</span>
            <span className="simulador__value-amount simulador__value-amount--highlight">
              {fmtBRL(result.netReceivedValue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── With-data result: left column ───────────────────────────────────────────

function CashForecastCard({
  forecast,
  agentAnalysis,
}: {
  forecast: CashForecast;
  agentAnalysis: string;
}) {
  return (
    <div className="simulador__forecast-card">
      <div className="simulador__forecast-header">
        <h2 className="simulador__forecast-title">Previsão do caixa</h2>
        <p className="simulador__forecast-subtitle">Com base na sua conta conectada</p>
      </div>

      <div className="simulador__forecast-balance">
        <p className="simulador__forecast-balance-label">Saldo disponível</p>
        <p className="simulador__forecast-balance-value">
          {fmtBRL(forecast.availableBalance)}
        </p>
      </div>

      <div className="simulador__forecast-metrics">
        <div className="simulador__forecast-metric">
          <span className="simulador__forecast-metric-label">Menor saldo previsto</span>
          <span className="simulador__forecast-metric-value simulador__forecast-metric-value--alert">
            {fmtBRLShort(forecast.lowestForecast)}
          </span>
          <span className="simulador__forecast-metric-note">Com a venda simulada</span>
        </div>
        <div className="simulador__forecast-metric">
          <span className="simulador__forecast-metric-label">Despesas previstas</span>
          <span className="simulador__forecast-metric-value">
            {fmtBRLShort(forecast.projectedExpenses)}
          </span>
          <span className="simulador__forecast-metric-note">Próximos 30 dias</span>
        </div>
      </div>

      <div className="simulador__forecast-alert">
        <AlertCircle size={16} strokeWidth={2} aria-hidden="true" className="simulador__forecast-alert-icon" />
        <div className="simulador__forecast-alert-text">
          <p className="simulador__forecast-alert-title">Atenção à previsão do caixa</p>
          <p className="simulador__forecast-alert-desc">
            Algumas despesas futuras podem não ter sido identificadas. Por isso,
            os valores são estimativas e o saldo real pode variar.
          </p>
        </div>
      </div>

      <div className="simulador__agent-card">
        <div className="simulador__agent-card-header">
          <Lightbulb size={18} strokeWidth={1.75} aria-hidden="true" />
          <span className="simulador__agent-card-title">Análise do Agente</span>
        </div>
        <div className="simulador__agent-card-body">
          {agentAnalysis.split("\n\n").map((para, i) => {
            if (para.startsWith("**")) {
              const parts = para.split("**");
              return (
                <p key={i} className="simulador__agent-card-para">
                  <strong>{parts[1]}</strong>
                  {parts[2]}
                </p>
              );
            }
            return <p key={i} className="simulador__agent-card-para">{para}</p>;
          })}
        </div>
      </div>
    </div>
  );
}

// ─── With-data result: right column ──────────────────────────────────────────

function CashEvolutionCard({ chartData }: { chartData: ChartPoint[] }) {
  const maxBalance = Math.max(...chartData.map(d => d.balance));
  const riskStart = chartData.find(d => d.isRisk)?.label;
  const riskEnd   = [...chartData].reverse().find(d => d.isRisk)?.label;

  return (
    <div className="simulador__evolution-card">
      <div className="simulador__evolution-header">
        <h2 className="simulador__evolution-title">Como o seu caixa pode evoluir</h2>
        <p className="simulador__evolution-subtitle">Próximos 30 dias</p>
      </div>

      <div className="simulador__chart-box">
        <div className="simulador__chart-inner-header">
          <span className="simulador__chart-label">Projeção de saldo</span>
          <span className="simulador__chart-period"> · próximos 30 dias</span>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 72, left: 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            {riskStart && riskEnd && (
              <ReferenceArea
                x1={riskStart}
                x2={riskEnd}
                fill="rgba(216,103,43,0.12)"
                label={{
                  value: "Período de risco · Dias 10 – 22",
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "#D8672B",
                }}
              />
            )}
            <ReferenceLine
              y={MIN_BALANCE}
              stroke="#D8672B"
              strokeDasharray="5 3"
              label={{
                value: "valor mínimo",
                position: "right",
                fontSize: 10,
                fill: "#D8672B",
              }}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#5B6B7C", fontFamily: "Ubuntu, system-ui, sans-serif" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, maxBalance * 1.2]}
              tickFormatter={v => `${(Number(v) / 1000).toFixed(0)} mil`}
              tick={{ fontSize: 11, fill: "#5B6B7C", fontFamily: "Ubuntu, system-ui, sans-serif" }}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <Tooltip
              formatter={v => [fmtBRL(Number(v)), "Saldo"]}
              cursor={{ stroke: "rgba(0,0,0,0.1)" }}
              contentStyle={{ fontSize: 12, borderRadius: 6 }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#0E7573"
              strokeWidth={2.5}
              dot={{ r: 5, fill: "#0E7573", strokeWidth: 0 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <a href="/fluxo" className="simulador__evolution-detail-link">
          Ver detalhes da previsão
        </a>
      </div>

      <div className="simulador__alternatives">
        <h3 className="simulador__alternatives-title">Alternativas para o seu caixa</h3>
        <div className="simulador__alternatives-list">
          <button className="simulador__alt-card">
            <div className="simulador__alt-card-text">
              <span className="simulador__alt-card-title">Parcelar a compra</span>
              <span className="simulador__alt-card-desc">
                Avalie o efeito das parcelas no fluxo de caixa.
              </span>
            </div>
            <ChevronRight size={20} strokeWidth={2} className="simulador__alt-card-chevron" aria-hidden="true" />
          </button>
          <button className="simulador__alt-card">
            <div className="simulador__alt-card-text">
              <span className="simulador__alt-card-title">Antecipar recebíveis</span>
              <span className="simulador__alt-card-desc">
                Compare o reforço de caixa com o custo da antecipação.
              </span>
            </div>
            <ChevronRight size={20} strokeWidth={2} className="simulador__alt-card-chevron" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Result with financial data ───────────────────────────────────────────────

function SimuladorResultWithData({
  data,
  onBack,
}: {
  data: SimuladorResultData;
  onBack: () => void;
}) {
  return (
    <ChatShell headerVariant="nav" onBack={onBack}>
      <div className="simulador">
        <div className="simulador__page-header">
          <p className="simulador__eyebrow">Simulador de venda</p>
          <h1 className="simulador__title">Resultado</h1>
        </div>

        <ImpactCard result={data.result} />

        <div className="simulador__with-data-layout">
          <CashForecastCard forecast={data.forecast} agentAnalysis={data.agentAnalysis} />
          <CashEvolutionCard chartData={data.chartData} />
        </div>
      </div>
    </ChatShell>
  );
}

// ─── Result without financial data ───────────────────────────────────────────

function SimuladorResultNoData({
  result,
  onBack,
}: {
  result: SimuladorResult;
  onBack: () => void;
}) {
  return (
    <ChatShell headerVariant="nav" onBack={onBack}>
      <div className="simulador">
        <div className="simulador__page-header">
          <p className="simulador__eyebrow">Simulador de venda</p>
          <h1 className="simulador__title">Resultado</h1>
        </div>

        {/* Impact card */}
        <div className="simulador__card simulador__card--impact">
          <div className="simulador__impact-header">
            <h2 className="simulador__impact-title">
              Impacto estimado do Split Payment
            </h2>

            <a href="#como-calculamos" className="simulador__how-link">
              Como calculamos?
            </a>
          </div>

          <div className="simulador__impact-body">
            <div className="simulador__impact-left">
              <p className="simulador__impact-label">
                Valor estimado dos impostos
              </p>

              <p className="simulador__impact-tax">
                {fmtBRL(result.estimatedTax)}
              </p>

              <div className="simulador__impact-meta">
                <p className="simulador__impact-aliquota">
                  Alíquota: {result.aliquota}%
                </p>
              </div>
            </div>

            <div className="simulador__impact-values">
              <div className="simulador__value-box">
                <span className="simulador__value-label">
                  Valor total vendido
                </span>
                <span className="simulador__value-amount">
                  {fmtBRL(result.totalSaleValue)}
                </span>
              </div>

              <div className="simulador__value-box">
                <span className="simulador__value-label">
                  Valor recebido líquido
                </span>
                <span className="simulador__value-amount simulador__value-amount--highlight">
                  {fmtBRL(result.netReceivedValue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Precision + Connect */}
        <div className="simulador__precision-connect">
          <section className="simulador__precision">
            <h2 className="simulador__precision-title">
              Quer uma previsão mais precisa?
            </h2>
            <p className="simulador__precision-desc">
              Conecte seu banco para o agente considerar seu saldo e suas
              movimentações na simulação.
            </p>
            <ul className="simulador__features">
              {PRECISION_FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="simulador__feature-item">
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="simulador__connect">
            <p className="simulador__connect-label">
              Escolha como deseja fornecer seus dados financeiros.
            </p>
            <div className="simulador__connect-options" role="list">
              {CONNECTION_OPTIONS.map(({ icon: Icon, title, description }) => (
                <button key={title} className="simulador__connect-card">
                  <Icon
                    size={28}
                    strokeWidth={1.5}
                    className="simulador__connect-icon"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="simulador__connect-title">{title}</p>
                    <p className="simulador__connect-desc">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ChatShell>
  );
}
