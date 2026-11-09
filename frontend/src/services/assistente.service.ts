import { api } from "./api";

export interface ConversaRequest {
  mensagem: string;
  conversa_id?: number;
}

export interface ConversaResponse {
  resposta: string;
  provedor: string;
  conversa_id: number;
}

export interface ConversaResumo {
  conversa_id: number;
  titulo: string;
  criada_em: string;
  atualizada_em: string;
}

export interface MensagemConversa {
  role: "user" | "assistant";
  content: string;
  criada_em: string;
}

export interface ConversaDetalhe {
  conversa_id: number;
  titulo: string;
  mensagens: MensagemConversa[];
}

export const assistenteService = {
  conversar(dados: ConversaRequest): Promise<ConversaResponse> {
    return api.request<ConversaResponse>("/api/v1/assistente/conversar", {
      method: "POST",
      body: dados,
    });
  },

  listarConversas(): Promise<ConversaResumo[]> {
    return api.request<ConversaResumo[]>("/api/v1/assistente/conversas", {
      method: "GET",
    });
  },

  obterConversa(conversaId: number): Promise<ConversaDetalhe> {
    return api.request<ConversaDetalhe>(
      `/api/v1/assistente/conversas/${conversaId}`,
      {
        method: "GET",
      }
    );
  },
};
