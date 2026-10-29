import { api } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  identificador: string; // email ou CPF/CNPJ
  senha: string;
}

export interface CadastroRequest {
  nome: string;
  documento: string; // CPF ou CNPJ
  email: string;
  senha: string;
}

export interface GoogleLoginRequest {
  credential: string; // JWT credential from Google Identity Services
}

export interface AtualizarUsuarioRequest {
  nome?: string | null;
  documento?: string | null;
  email?: string | null;
}

// UsuarioResponse from GET /api/v1/acesso/me — id is integer in the API
export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
}

// SessionUser stored in localStorage — includes documento fetched via GET /me
export interface SessionUser {
  id: number;
  nome: string;
  email: string;
  documento?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  usuario: UsuarioResponse;
}

// ─── Session storage ──────────────────────────────────────────────────────────

const TOKEN_KEY = "splitagent_token";
const USER_KEY  = "splitagent_user";

export const sessionStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getUser(): SessionUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as SessionUser; } catch { return null; }
  },
  save(res: TokenResponse): void {
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.usuario));
  },
  saveUser(user: SessionUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Fetches GET /api/v1/acesso/me, merges the result into localStorage,
 * and returns the merged SessionUser.
 *
 * NOTE: The API's UsuarioResponse does not include `documento`. Any
 * `documento` already stored in localStorage is preserved via the spread.
 * The only way to populate `documento` is via cadastro (stored from the
 * request payload) or after a successful PUT /me update.
 */
export async function fetchAndStoreMe(): Promise<SessionUser> {
  const res = await api.request<UsuarioResponse>("/api/v1/acesso/me");
  const current = sessionStorage.getUser();
  // Preserve existing documento — the API never returns it in GET /me
  const merged: SessionUser = { ...current, ...res };
  sessionStorage.saveUser(merged);
  return merged;
}

export const authService = {
  async login(data: LoginRequest): Promise<TokenResponse> {
    const res = await api.request<TokenResponse>("/api/v1/acesso/login", {
      method: "POST",
      body: data,
      public: true,
    });
    sessionStorage.save(res);
    // Fetch full profile to populate documento
    await fetchAndStoreMe().catch(() => {});
    return res;
  },

  async cadastro(data: CadastroRequest): Promise<TokenResponse> {
    const res = await api.request<TokenResponse>("/api/v1/acesso/cadastro", {
      method: "POST",
      body: data,
      public: true,
    });
    sessionStorage.save(res);
    // Persist documento from the registration payload since the API doesn't
    // return it in TokenResponse.usuario
    const current = sessionStorage.getUser();
    if (current) {
      sessionStorage.saveUser({ ...current, documento: data.documento });
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await api.request("/api/v1/acesso/logout", { method: "POST" });
    } finally {
      sessionStorage.clear();
    }
  },

  async deletarMe(): Promise<void> {
    await api.request("/api/v1/acesso/me", { method: "DELETE" });
    sessionStorage.clear();
  },

  async googleLogin(data: GoogleLoginRequest): Promise<TokenResponse> {
    const res = await api.request<TokenResponse>("/api/v1/acesso/google", {
      method: "POST",
      body: data,
      public: true,
    });
    sessionStorage.save(res);
    await fetchAndStoreMe().catch(() => {});
    return res;
  },

  async atualizarMe(data: AtualizarUsuarioRequest): Promise<SessionUser> {
    await api.request<UsuarioResponse>("/api/v1/acesso/me", {
      method: "PUT",
      body: data,
    });
    // Optimistically patch localStorage with the values we sent, so that
    // fetchAndStoreMe's merge preserves them (GET /me doesn't return documento).
    const current = sessionStorage.getUser();
    if (current) {
      const patched: SessionUser = {
        ...current,
        ...(data.nome != null     ? { nome: data.nome }           : {}),
        ...(data.email != null    ? { email: data.email }         : {}),
        ...(data.documento != null ? { documento: data.documento } : {}),
      };
      sessionStorage.saveUser(patched);
    }
    // Re-fetch to sync any server-side changes (e.g. normalisation)
    return fetchAndStoreMe();
  },
};
