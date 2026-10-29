import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/layout/Header";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { GoogleSignInButton } from "../../components/ui/GoogleSignInButton";
import { authService } from "../../services/auth.service";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.login({ identificador: email, senha });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <Header variant="logo-centered" />

      <main className="login-page__main">
        <div className="login-page__wrapper">

          {/* Hero row: title + illustration */}
          <div className="login-page__hero">
            <div className="login-page__hero-text">
              <h1 className="login-page__title">Entrar</h1>
              <p className="login-page__subtitle">
                Acesse sua conta para acompanhar sua operação.
              </p>
            </div>
            <div className="login-page__illustration" aria-hidden="true">
              <svg
                width="100"
                height="88"
                viewBox="0 0 100 88"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="login-page__svg-illustration"
              >
                <rect x="4" y="8" width="78" height="64" rx="8" fill="#E8EEF4" />
                <path d="M58 18 L74 10 M74 10 L74 18 M74 10 L66 10" stroke="#0E7573" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="16" y="44" width="10" height="20" rx="2" fill="#CBD5E0" />
                <rect x="30" y="36" width="10" height="28" rx="2" fill="#0E7573" opacity="0.6" />
                <rect x="44" y="24" width="10" height="40" rx="2" fill="#0E7573" />
                <circle cx="76" cy="66" r="18" fill="#FFC801" />
                <text x="76" y="71" textAnchor="middle" fill="#0F263B" fontSize="11" fontWeight="700" fontFamily="Ubuntu, sans-serif">R$</text>
              </svg>
            </div>
          </div>

          {/* Form card */}
          <div className="login-page__card">
            <form className="login-page__form" onSubmit={handleSubmit} noValidate>
              <Input
                label="Email ou CPF:"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
              <Input
                label="Senha:"
                variant="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
              />

              <div className="login-page__forgot">
                <a href="#" className="login-page__forgot-link">Esqueci minha senha</a>
              </div>

              {error && (
                <p className="login-page__error" role="alert">{error}</p>
              )}

              <Button variant="primary" size="md" type="submit" className="login-page__submit-btn" disabled={loading}>
                {loading ? "Entrando…" : "Entrar"}
              </Button>

              {/* Divider */}
              <div className="login-page__divider">
                <span className="login-page__divider-line" />
                <span className="login-page__divider-text">ou continue com</span>
                <span className="login-page__divider-line" />
              </div>

              <GoogleSignInButton onError={setError} />
            </form>
          </div>

          {/* Register link */}
          <p className="login-page__register">
            Não tem conta?{" "}
            <button
              type="button"
              className="login-page__register-link"
              onClick={() => navigate("/cadastro")}
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
