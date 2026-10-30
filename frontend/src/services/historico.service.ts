import { api } from "./api";

// ─── API response types ───────────────────────────────────────────────────────

interface DecisaoAPI {
  id: number;
  data_decisao: string;
  recomendacao: string;
  escolha_usuario: string;
  resultado_projetado: Record<string, unknown>;
}

interface ListarDecisoesResponse {
  total: number;
  estado_vazio: boolean;
  decisoes: DecisaoAPI[];
}

// ─── Front-end type ───────────────────────────────────────────────────────────

export interface Decision {
  id: string;
  date: string;
  recommendation: string;
  userChoice: string;
  projectedResult: string;
}

export interface ListarDecisoesResult {
  decisions: Decision[];
  isEmpty: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}

function formatResultado(obj: Record<string, unknown>): string {
  const entries = Object.entries(obj);
  if (entries.length === 0) return "—";
  return entries
    .map(([key, value]) => `${key}: ${value}`)
    .join(" | ");
}

function mapDecisao(d: DecisaoAPI): Decision {
  return {
    id: d.id.toString(),
    date: formatDate(d.data_decisao),
    recommendation: d.recomendacao,
    userChoice: d.escolha_usuario,
    projectedResult: formatResultado(d.resultado_projetado),
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const historicoService = {
  async listar(): Promise<ListarDecisoesResult> {
    const res = await api.request<ListarDecisoesResponse>(
      "/api/v1/simulador/decisoes"
    );
    return {
      decisions: res.decisoes.map(mapDecisao),
      isEmpty: res.estado_vazio,
    };
  },
};
