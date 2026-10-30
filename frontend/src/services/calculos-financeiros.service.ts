import { api } from "./api";

// ─── API response types ───────────────────────────────────────────────────────

interface VisaoGeralAPIResponse {
  data_inicio: string;
  data_fim: string;
  aliquota_tributaria_percentual: string;
  total_vendido: string;
  tributos_estimados: string;
  valor_liquido_vendas: string;
  saldo_atual: string;
  saldo_minimo_configurado: string;
  menor_saldo_previsto: string;
  data_menor_saldo_previsto: string;
  situacao_caixa: string;
  periodos_abaixo_minimo: Record<string, unknown>[]; // TODO: map when real payload shape is known
  observacao_tributaria: string;
}

interface FluxoCaixaDia {
  data: string;
  saldo_inicial_dia: string;
  total_entradas_brutas: string;
  tributos_estimados: string;
  total_entradas_liquidas: string;
  total_saidas: string;
  saldo_previsto: string;
  abaixo_minimo: boolean;
}

interface FluxoCaixaAPIResponse {
  data_inicio: string;
  data_fim: string;
  saldo_atual: string;
  saldo_minimo_configurado: string;
  menor_saldo_previsto: string;
  data_menor_saldo_previsto: string;
  situacao_caixa: string;
  periodos_abaixo_minimo: Record<string, unknown>[]; // TODO: map when real payload shape is known
  dias: FluxoCaixaDia[];
}

interface MovimentacaoFinanceiraItem {
  data: string;
  descricao: string;
  valor: string;
  tipo: string;
  origem: string;
}

interface MovimentacoesAPIResponse {
  data_inicio: string;
  data_fim: string;
  total_itens: number;
  total_entradas: string;
  total_saidas: string;
  limite: number;
  offset: number;
  movimentacoes: MovimentacaoFinanceiraItem[];
}

// ─── Front-end types ──────────────────────────────────────────────────────────

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

export interface VisaoGeralPageData {
  summary: FinancialSummary;
  projectionPoints: CashFlowPoint[];
  minimumBalance: number;
  riskPeriods: RiskPeriod[];
  situation: CashSituation;
}

export interface BalanceSummary {
  availableBalance: number;
  lowestForecast: number;
  forecastDays: number;
}

export interface CashChartPoint {
  label: string;
  value: number;
  isNegative?: boolean;
}

export interface CashProjection {
  totalInflows: number;
  totalOutflows: number;
  chartData: CashChartPoint[];
}

export interface Movement {
  id: string;
  title: string;
  description: string;
  date: string;
  amount: number;
}

export interface FluxoCaixaPageData {
  balance: BalanceSummary;
  projection: CashProjection;
  movements: Movement[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseNum(s: string): number {
  return parseFloat(s) || 0;
}

function formatDateShort(iso: string): string {
  const raw = new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });
  return raw.endsWith(".") ? raw.slice(0, -1) : raw;
}

function dayLabel(iso: string, isFirst: boolean): string {
  if (isFirst) return "Hoje";
  return "Dia " + new Date(iso + "T12:00:00").getUTCDate();
}

// ─── Chart helpers ────────────────────────────────────────────────────────────

function samplePoints(dias: FluxoCaixaDia[]): CashChartPoint[] {
  if (dias.length === 0) return [];

  let indices: number[];
  if (dias.length <= 5) {
    indices = dias.map((_, i) => i);
  } else {
    indices = [0, 1, 2, 3, 4].map((i) =>
      Math.round((i * (dias.length - 1)) / 4)
    );
  }

  return indices.map((idx) => {
    const dia = dias[idx];
    return {
      label: dayLabel(dia.data, idx === 0),
      value: parseNum(dia.saldo_previsto),
      isNegative: dia.abaixo_minimo,
    };
  });
}

function deriveRiskPeriods(dias: FluxoCaixaDia[]): RiskPeriod[] {
  if (dias.length === 0) return [];

  // Build the set of sampled indices (same logic as samplePoints)
  let sampledIndices: number[];
  if (dias.length <= 5) {
    sampledIndices = dias.map((_, i) => i);
  } else {
    sampledIndices = [0, 1, 2, 3, 4].map((i) =>
      Math.round((i * (dias.length - 1)) / 4)
    );
  }

  // Find closest sampled index to a given raw index
  function closestSampledIdx(rawIdx: number): number {
    return sampledIndices.reduce((best, si) =>
      Math.abs(si - rawIdx) < Math.abs(best - rawIdx) ? si : best
    );
  }

  // Walk all days and collect contiguous abaixo_minimo spans
  const periods: RiskPeriod[] = [];
  let spanStart: number | null = null;

  for (let i = 0; i <= dias.length; i++) {
    const inSpan = i < dias.length && dias[i].abaixo_minimo;

    if (inSpan && spanStart === null) {
      spanStart = i;
    } else if (!inSpan && spanStart !== null) {
      const startIdx = closestSampledIdx(spanStart);
      const endIdx = closestSampledIdx(i - 1);

      let totalOutflows = 0;
      for (let j = spanStart; j < i; j++) {
        totalOutflows += parseNum(dias[j].total_saidas);
      }

      periods.push({
        startDay: dayLabel(dias[startIdx].data, startIdx === 0),
        endDay: dayLabel(dias[endIdx].data, endIdx === 0),
        totalOutflows,
      });

      spanStart = null;
    }
  }

  return periods;
}

// ─── Mapping functions ────────────────────────────────────────────────────────

function mapVisaoGeral(
  vg: VisaoGeralAPIResponse,
  fc: FluxoCaixaAPIResponse
): VisaoGeralPageData {
  return {
    summary: {
      estimatedNet: parseNum(vg.valor_liquido_vendas),
      totalSold: parseNum(vg.total_vendido),
      estimatedTaxes: parseNum(vg.tributos_estimados),
      netValue: parseNum(vg.valor_liquido_vendas),
      currentBalance: parseNum(vg.saldo_atual),
    },
    projectionPoints: samplePoints(fc.dias).map((p) => ({
      day: p.label,
      value: p.value / 1000,
    })),
    minimumBalance: parseNum(vg.saldo_minimo_configurado) / 1000,
    riskPeriods: deriveRiskPeriods(fc.dias),
    situation: vg.situacao_caixa as CashSituation,
  };
}

function mapFluxoCaixa(
  fc: FluxoCaixaAPIResponse,
  movFinanceiras: MovimentacoesAPIResponse
): FluxoCaixaPageData {
  const movements: Movement[] = movFinanceiras.movimentacoes
    .map((m) => ({
      id: `fin-${m.data}-${m.descricao}`,
      title: m.descricao,
      description: m.tipo === "entrada" ? "Entrada prevista" : "Despesa prevista",
      date: formatDateShort(m.data),
      amount: m.tipo === "entrada" ? parseNum(m.valor) : -parseNum(m.valor),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    balance: {
      availableBalance: parseNum(fc.saldo_atual),
      lowestForecast: parseNum(fc.menor_saldo_previsto),
      forecastDays: fc.dias.length,
    },
    projection: {
      totalInflows: fc.dias.reduce(
        (acc, d) => acc + parseNum(d.total_entradas_liquidas),
        0
      ),
      totalOutflows: fc.dias.reduce(
        (acc, d) => acc + parseNum(d.total_saidas),
        0
      ),
      chartData: samplePoints(fc.dias),
    },
    movements,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const calculosFinanceirosService = {
  async buscarVisaoGeral(): Promise<VisaoGeralPageData> {
    const [vg, fc] = await Promise.all([
      api.request<VisaoGeralAPIResponse>(
        "/api/v1/calculos-financeiros/visao-geral"
      ),
      api.request<FluxoCaixaAPIResponse>(
        "/api/v1/calculos-financeiros/fluxo-caixa"
      ),
    ]);
    return mapVisaoGeral(vg, fc);
  },

  async buscarFluxoCaixa(): Promise<FluxoCaixaPageData> {
    const [fc, movFinanceiras] = await Promise.all([
      api.request<FluxoCaixaAPIResponse>(
        "/api/v1/calculos-financeiros/fluxo-caixa"
      ),
      api.request<MovimentacoesAPIResponse>("/api/v1/movimentacoes"),
    ]);
    return mapFluxoCaixa(fc, movFinanceiras);
  },
};
