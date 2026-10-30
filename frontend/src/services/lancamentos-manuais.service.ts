import { api } from "./api";

// ─── API types ────────────────────────────────────────────────────────────────

interface SaldoInicialBody {
  data_referencia: string;
  saldo: number;
}

export interface SaldoInicialItem {
  id: number;
  data_referencia: string;
  saldo: number;
}

interface MovimentacaoManualBody {
  data: string;
  descricao: string;
  valor: number;
  tipo: string;
  categoria?: string | null;
}

interface MovimentacaoManualUpdate {
  data?: string | null;
  descricao?: string | null;
  valor?: number | null;
  tipo?: string | null;
  categoria?: string | null;
}

export interface MovimentacaoManualItem {
  id: number;
  data: string;
  descricao: string;
  valor: number;
  tipo: string;
  categoria: string | null;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const lancamentosService = {
  // ── Saldo inicial ──────────────────────────────────────────────────────────

  criarSaldo(body: SaldoInicialBody): Promise<SaldoInicialItem> {
    return api.request<SaldoInicialItem>("/api/v1/saldo-inicial", {
      method: "POST",
      body,
    });
  },

  listarSaldos(): Promise<SaldoInicialItem[]> {
    return api.request<SaldoInicialItem[]>("/api/v1/saldo-inicial");
  },

  atualizarSaldo(id: number, body: SaldoInicialBody): Promise<SaldoInicialItem> {
    return api.request<SaldoInicialItem>(`/api/v1/saldo-inicial/${id}`, {
      method: "PUT",
      body,
    });
  },

  excluirSaldo(id: number): Promise<void> {
    return api.request<void>(`/api/v1/saldo-inicial/${id}`, {
      method: "DELETE",
    });
  },

  // ── Movimentações manuais ──────────────────────────────────────────────────

  criarMovimentacao(body: MovimentacaoManualBody): Promise<MovimentacaoManualItem> {
    return api.request<MovimentacaoManualItem>("/api/v1/movimentacoes/manuais", {
      method: "POST",
      body,
    });
  },

  listarMovimentacoes(): Promise<MovimentacaoManualItem[]> {
    return api.request<MovimentacaoManualItem[]>("/api/v1/movimentacoes/manuais");
  },

  atualizarMovimentacao(
    id: number,
    body: MovimentacaoManualUpdate
  ): Promise<MovimentacaoManualItem> {
    return api.request<MovimentacaoManualItem>(
      `/api/v1/movimentacoes/manuais/${id}`,
      { method: "PUT", body }
    );
  },

  excluirMovimentacao(id: number): Promise<void> {
    return api.request<void>(`/api/v1/movimentacoes/manuais/${id}`, {
      method: "DELETE",
    });
  },
};
