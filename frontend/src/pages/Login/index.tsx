import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/layout/Header";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: auth logic
  }

  return (
    <div className="login-page">
      {/* Header with centered logo */}
      <Header variant="logo-centered" />

      {/* Main content */}
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
              {/* Finance chart illustration composed with SVG */}
              <svg
                width="100"
                height="88"
                viewBox="0 0 100 88"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="login-page__svg-illustration"
              >
                {/* Card background */}
                <rect x="4" y="8" width="78" height="64" rx="8" fill="#E8EEF4" />
                {/* Arrow */}
                <path d="M58 18 L74 10 M74 10 L74 18 M74 10 L66 10" stroke="#0E7573" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Bars */}
                <rect x="16" y="44" width="10" height="20" rx="2" fill="#CBD5E0" />
                <rect x="30" y="36" width="10" height="28" rx="2" fill="#0E7573" opacity="0.6" />
                <rect x="44" y="24" width="10" height="40" rx="2" fill="#0E7573" />
                {/* Coin */}
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

              <Button variant="primary" size="md" type="submit" className="login-page__submit-btn">
                Entrar
              </Button>

              {/* Divider */}
              <div className="login-page__divider">
                <span className="login-page__divider-line" />
                <span className="login-page__divider-text">ou continue com</span>
                <span className="login-page__divider-line" />
              </div>

              {/* Google sign in */}
              <button type="button" className="login-page__google-btn">
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M17.64 9.2045c0-.638-.0573-1.252-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.3441 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71C3.7841 10.17 3.6818 9.5945 3.6818 9c0-.5945.1023-1.17.2822-1.71V4.9582H.9574C.3477 6.173 0 7.5482 0 9c0 1.4518.3477 2.827.9574 4.0418L3.964 10.71z" fill="#FBBC05"/>
                  <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5813C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
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
