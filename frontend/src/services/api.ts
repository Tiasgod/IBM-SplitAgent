const BASE_URL = "https://ibm-splitagent-back-end-production.up.railway.app";

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

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** When true, the response is returned as a Blob (e.g. file downloads). */
  blob?: boolean;
  /** When true, skip attaching the Authorization header (used for auth endpoints). */
  public?: boolean;
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

  if (res.status === 401 && !options.public) {
    handleUnauthorized();
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      // FastAPI 422 shape: { detail: [{ msg, loc, ... }] }
      if (Array.isArray(err?.detail)) {
        message = err.detail.map((d: { msg?: string }) => d.msg ?? JSON.stringify(d)).join("; ");
      } else {
        // SplitAgent API shape: { mensagem: "...", erros: [...] }
        message = err?.mensagem ?? err?.message ?? err?.error ?? message;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
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
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (Array.isArray(err?.detail)) {
        message = err.detail.map((d: { msg?: string }) => d.msg ?? JSON.stringify(d)).join("; ");
      } else {
        message = err?.mensagem ?? err?.message ?? err?.error ?? message;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export const api = { request, requestForm };
