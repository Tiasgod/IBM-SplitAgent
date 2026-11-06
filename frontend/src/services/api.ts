const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!BASE_URL) {
  console.error(
    "[api] VITE_API_BASE_URL não está definida. " +
    "Adicione a variável de ambiente no painel da Vercel e faça um novo deploy."
  );
}

const TOKEN_KEY = "splitagent_token";

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Redirects to /login and clears the stored token on 401. */
function handleUnauthorized(): never {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = "/login";
  throw new Error("Sessão expirada. Faça login novamente.");
}

// ─── Friendly fallback messages per HTTP status ───────────────────────────────

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "Requisição inválida. Verifique os dados informados.",
  401: "Sessão expirada. Faça login novamente.",
  403: "Você não tem permissão para realizar esta ação.",
  404: "Recurso não encontrado.",
  408: "O servidor demorou demais para responder. Tente novamente.",
  409: "Conflito: esta operação não pode ser concluída com os dados atuais.",
  422: "Os dados enviados são inválidos. Verifique o formulário.",
  429: "Muitas requisições em pouco tempo. Aguarde um momento e tente novamente.",
  500: "Erro interno do servidor. Tente novamente em breve.",
  502: "Serviço indisponível no momento. Tente novamente em breve.",
  503: "Serviço temporariamente fora do ar. Tente novamente em breve.",
  504: "O servidor não respondeu a tempo. Verifique sua conexão e tente novamente.",
};

/**
 * Extracts a human-readable message from an API error response.
 * Priority:
 *   1. Body message from known API shapes (FastAPI detail / SplitAgent mensagem)
 *   2. Friendly fallback for the HTTP status code
 *   3. Generic fallback with the status code
 */
async function parseApiError(res: Response): Promise<string> {
  const fallback =
    HTTP_STATUS_MESSAGES[res.status] ?? `Erro inesperado (código ${res.status}). Tente novamente.`;

  try {
    const err = await res.json();

    // FastAPI 422 shape: { detail: [{ msg, loc, ... }] }
    if (Array.isArray(err?.detail) && err.detail.length > 0) {
      const msg = err.detail
        .map((d: { msg?: string }) => d.msg ?? JSON.stringify(d))
        .join("; ");
      return msg || fallback;
    }

    // FastAPI 4xx shape: { detail: "mensagem" }
    if (typeof err?.detail === "string" && err.detail.trim()) {
      return err.detail;
    }

    // SplitAgent API shape: { mensagem: "...", erros: [...] }
    const bodyMsg: string | undefined =
      err?.mensagem ?? err?.message ?? err?.error;
    if (typeof bodyMsg === "string" && bodyMsg.trim()) {
      return bodyMsg;
    }
  } catch {
    // body is not JSON (e.g. HTML error page from Railway/nginx)
  }

  return fallback;
}

// ─────────────────────────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** When true, the response is returned as a Blob (e.g. file downloads). */
  blob?: boolean;
  /** When true, skip attaching the Authorization header (used for auth endpoints). */
  public?: boolean;
  /** When true, a 401 response throws normally instead of redirecting to /login. */
  skipRedirectOn401?: boolean;
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, blob = false } = options;

  const authHeaders: Record<string, string> = {};
  if (!options.public) {
    const token = getToken();
    if (token) authHeaders["Authorization"] = `Bearer ${token}`;
  }

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, init);

  if (res.status === 401 && !options.public && !options.skipRedirectOn401) {
    handleUnauthorized();
  }

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  if (blob) return res.blob() as Promise<T>;
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function requestForm<T>(path: string, formData: FormData): Promise<T> {
  const authHeaders: Record<string, string> = {};
  const token = getToken();
  if (token) authHeaders["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders,
    body: formData,
    // Do NOT set Content-Type — browser sets multipart/form-data with boundary
  });

  if (res.status === 401) {
    handleUnauthorized();
  }

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<T>;
}

export const api = { request, requestForm };
