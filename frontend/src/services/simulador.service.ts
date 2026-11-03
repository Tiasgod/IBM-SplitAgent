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

export interface DiasProjecao {
  data: string;
  saldo_inicial_dia: string;
  total_entradas_brutas: string;
  tributos_estimados: string;
  total_entradas_liquidas: string;
  total_saidas: string;
  saldo_previsto: string;
  abaixo_minimo: boolean;
}

export interface ProjecaoCompleta {
  saldo_atual: string;
  menor_saldo_previsto: string;
  data_menor_saldo_previsto: string;
  situacao_caixa: string;
  saldo_minimo_configurado: string;
  periodos_abaixo_minimo: ProjecaoPeriodo[];
  dias: DiasProjecao[];
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
  projecao_original: ProjecaoCompleta;
  projecao_simulada: ProjecaoCompleta;
  observacao_tributaria: string;
}

// ─── Histórico ────────────────────────────────────────────────────────────────

export interface SimulacaoParametros {
  tipo: string;
  descricao: string;
  data: string;
  valor: number | string;
  aliquota_tributaria_percentual: number | string;
}

export interface SimulacaoResultado {
  valor_simulado: string | number;
  tributos_estimados_simulacao: string | number;
  valor_liquido_simulacao: string | number | null;
  impacto_no_saldo: string | number;
  situacao_simulada: string;
  gera_saldo_negativo: boolean;
  fica_abaixo_minimo: boolean;
}

export interface SimulacaoHistorico {
  id: number;
  criado_em: string;
  parametros: SimulacaoParametros;
  resultado: SimulacaoResultado;
}

export interface ListaSimulacoesResponse {
  total: number;
  estado_vazio: boolean;
  simulacoes: SimulacaoHistorico[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const simuladorService = {
  simular(data: SimularRequest): Promise<SimularResponse> {
    return api.request<SimularResponse>("/api/v1/simulador/simular", {
      method: "POST",
      body: data,
    });
  },

  listarSimulacoes(): Promise<ListaSimulacoesResponse> {
    return api.request<ListaSimulacoesResponse>("/api/v1/simulador/simulacoes");
  },

  consultarSimulacao(id: number): Promise<SimulacaoHistorico> {
    return api.request<SimulacaoHistorico>(`/api/v1/simulador/simulacoes/${id}`);
  },
};
