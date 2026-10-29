import { useState } from "react";
import { TrendingUp, Calendar, Shield, Building2, Upload } from "lucide-react";
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

// ─── Simulador Page ───────────────────────────────────────────────────────────

export default function Simulador() {
  const [step, setStep] = useState<"form" | "result">("form");
  const [result, setResult] = useState<SimuladorResult | null>(null);
  const [form, setForm] = useState<SimuladorForm>({
    productType:   "",
    saleValue:     "",
    expectedDate:  "",
    paymentMethod: "avista",
    taxRegime:     "",
  });

  function handleSimulate() {
    // Placeholder: calculation will be replaced by backend call
    const numericValue = parseFloat(form.saleValue.replace(/\D/g, "")) || 0;
    const aliquota = 0.1;
    setResult({
      estimatedTax:     numericValue * aliquota,
      aliquota:         aliquota * 100,
      totalSaleValue:   numericValue,
      netReceivedValue: numericValue * (1 - aliquota),
    });
    setStep("result");
  }

  if (step === "result" && result) {
    return <SimuladorResult result={result} onBack={() => setStep("form")} />;
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

// ─── Result sub-page ──────────────────────────────────────────────────────────

function SimuladorResult({
  result,
  onBack,
}: {
  result: SimuladorResult;
  onBack: () => void;
}) {
  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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

            {!chatOpen && (
              <a href="#como-calculamos" className="simulador__how-link">
                Como calculamos?
              </a>
            )}
          </div>

          <div className="simulador__impact-body">
            <div className="simulador__impact-left">
              <p className="simulador__impact-label">
                Valor estimado dos impostos
              </p>

              <p className="simulador__impact-tax">
                {fmt(result.estimatedTax)}
              </p>

              <div className="simulador__impact-meta">
                <p className="simulador__impact-aliquota">
                  Alíquota: {result.aliquota}%
                </p>

                {chatOpen && (
                  <a href="#como-calculamos" className="simulador__how-link">
                    Como calculamos?
                  </a>
                )}
              </div>
            </div>

            <div className="simulador__impact-values">
              <div className="simulador__value-box">
                <span className="simulador__value-label">
                  Valor total vendido
                </span>
                <span className="simulador__value-amount">
                  {fmt(result.totalSaleValue)}
                </span>
              </div>

              <div className="simulador__value-box">
                <span className="simulador__value-label">
                  Valor recebido líquido
                </span>
                <span className="simulador__value-amount simulador__value-amount--highlight">
                  {fmt(result.netReceivedValue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Precision + Connect — 2 colunas no desktop via CSS grid */}
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
