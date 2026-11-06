import { api } from "./api";

export interface MensagemHistorico {
  role: "user" | "assistant";
  content: string;
}

export interface ConversaRequest {
  mensagem: string;
  historico?: MensagemHistorico[];
}

export interface ConversaResponse {
  resposta: string;
  provedor: string;
}

export const assistenteService = {
  conversar(dados: ConversaRequest): Promise<ConversaResponse> {
    return api.request<ConversaResponse>("/api/v1/assistente/conversar", {
      method: "POST",
      body: dados,
    });
  },
};
