import { api } from "./api";

// ─── GET /api/v1/agentes/financeiro/analisar ──────────────────────────────────

export interface AnalisarFinanceiroParams {
  aliquota_tributaria_percentual?: number;
  saldo_minimo?: number;
  horizonte_dias?: number;
  incluir_ia?: boolean;
}

export interface AnalisarFinanceiroResponse {
  [key: string]: unknown;
}

// ─── POST /api/v1/agentes/split-payment/simular ───────────────────────────────

export interface SplitParticipant {
  name: string;
  weight: number;
}

export interface SimularSplitRequest {
  total: number;
  participants: SplitParticipant[];
}

export interface SimularSplitResponse {
  [key: string]: unknown;
}

// ─── POST /api/v1/agentes/credito/analisar ────────────────────────────────────

export interface CreditContext {
  credit_limit: number;
  current_debt: number;
}

export interface AnalisarCreditoRequest {
  total: number;
  credit_context: CreditContext;
}

export interface AnalisarCreditoResponse {
  [key: string]: unknown;
}

// ─── POST /api/v1/agentes/tributos/estimar ────────────────────────────────────

export interface EstimarTributosRequest {
  total: number;
  aliquota_percentual: number;
}

export interface EstimarTributosResponse {
  [key: string]: unknown;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const agentesService = {
  analisarFinanceiro(
    params: AnalisarFinanceiroParams = {}
  ): Promise<AnalisarFinanceiroResponse> {
    const qs = new URLSearchParams();
    if (params.aliquota_tributaria_percentual !== undefined)
      qs.set("aliquota_tributaria_percentual", String(params.aliquota_tributaria_percentual));
    if (params.saldo_minimo !== undefined)
      qs.set("saldo_minimo", String(params.saldo_minimo));
    if (params.horizonte_dias !== undefined)
      qs.set("horizonte_dias", String(params.horizonte_dias));
    if (params.incluir_ia !== undefined)
      qs.set("incluir_ia", String(params.incluir_ia));

    const query = qs.toString();
    return api.request<AnalisarFinanceiroResponse>(
      `/api/v1/agentes/financeiro/analisar${query ? `?${query}` : ""}`
    );
  },

  simularSplit(data: SimularSplitRequest): Promise<SimularSplitResponse> {
    return api.request<SimularSplitResponse>("/api/v1/agentes/split-payment/simular", {
      method: "POST",
      body: data,
    });
  },

  analisarCredito(data: AnalisarCreditoRequest): Promise<AnalisarCreditoResponse> {
    return api.request<AnalisarCreditoResponse>("/api/v1/agentes/credito/analisar", {
      method: "POST",
      body: data,
    });
  },

  estimarTributos(data: EstimarTributosRequest): Promise<EstimarTributosResponse> {
    return api.request<EstimarTributosResponse>("/api/v1/agentes/tributos/estimar", {
      method: "POST",
      body: data,
    });
  },
};
