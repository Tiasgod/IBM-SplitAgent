import { api } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SaldoInicialOut {
  data_referencia: string;
  saldo: string;
}

/** Response from POST /api/v1/importacoes */
export interface ImportacaoCriadaResponse {
  importacao_id: number;
  nome_arquivo: string;
  importado_em: string;
  saldo_inicial: SaldoInicialOut | null;
  total_vendas: number;
  total_recebiveis: number;
  total_despesas: number;
  substituiu_dados_anteriores: boolean;
}

/** Response from GET /api/v1/importacoes/atual */
export interface ResumoImportacao {
  importacao_id: number;
  nome_arquivo: string;
  importado_em: string;
  saldo_inicial: SaldoInicialOut | null;
  total_vendas: number;
  total_recebiveis: number;
  total_despesas: number;
}

/** Union used where either shape can appear */
export type ImportacaoResumo = ImportacaoCriadaResponse | ResumoImportacao;

// ─── Service ──────────────────────────────────────────────────────────────────

export const importacoesService = {
  /**
   * Baixa a planilha modelo (.xlsx) e dispara o download no browser.
   */
  async baixarModelo(): Promise<void> {
    const blob = await api.request<Blob>("/api/v1/importacoes/modelo", {
      blob: true,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-splitagent.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Envia a planilha preenchida para importação.
   * The API field name is "arquivo" (Body_enviar_planilha_api_v1_importacoes_post).
   */
  importar(file: File): Promise<ImportacaoCriadaResponse> {
    const formData = new FormData();
    formData.append("arquivo", file);
    return api.requestForm<ImportacaoCriadaResponse>("/api/v1/importacoes", formData);
  },

  /**
   * Retorna o resumo da planilha importada atualmente.
   */
  obterAtual(): Promise<ResumoImportacao> {
    return api.request<ResumoImportacao>("/api/v1/importacoes/atual");
  },
};
