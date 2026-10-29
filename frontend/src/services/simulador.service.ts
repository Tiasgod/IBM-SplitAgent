import { api } from "./api";

// ─── Request ──────────────────────────────────────────────────────────────────

export interface SimularRequest {
  /** "venda" | "despesa" */
  tipo: string;
  /** Descrição da venda/operação */
  descricao: string;
  /** Data prevista no formato YYYY-MM-DD */
  data: string;
  /** Valor da operação */
  valor: number | string;
  /** Alíquota tributária em percentual (ex: 6, 13.33, 15) */
  aliquota_tributaria_percentual: number | string;
  /** Saldo mínimo desejado (opcional — omitido se não informado) */
  saldo_minimo?: number | string;
}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface ProjecaoPeriodo {
  data: string;
  saldo_previsto: string;
  abaixo_minimo?: boolean;
}

export interface SimularResponse {
  tipo: string;
  descricao: string;
  data_simulada: string;
  valor_simulado: string;
  tributos_estimados_simulacao: string;
  valor_liquido_simulacao: string | null;
  impacto_no_saldo: string;
  saldo_atual_original: string;
  saldo_atual_simulado: string;
  menor_saldo_original: string;
  data_menor_saldo_original: string;
  menor_saldo_simulado: string;
  data_menor_saldo_simulado: string;
  gera_saldo_negativo: boolean;
  fica_abaixo_minimo: boolean;
  situacao_original: string;
  situacao_simulada: string;
  periodos_abaixo_minimo_simulados: ProjecaoPeriodo[];
  projecao_original: Record<string, unknown>;
  projecao_simulada: Record<string, unknown>;
  observacao_tributaria: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const simuladorService = {
  simular(data: SimularRequest): Promise<SimularResponse> {
    return api.request<SimularResponse>("/api/v1/simulador/simular", {
      method: "POST",
      body: data,
    });
  },
};
