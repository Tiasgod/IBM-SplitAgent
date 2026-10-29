import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/layout/Header";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import "./Cadastro.css";

export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: register logic
  }

  return (
    <div className="cadastro-page">
      <Header variant="logo-centered" />

      <main className="cadastro-page__main">
        <div className="cadastro-page__wrapper">

          {/* Hero */}
          <div className="cadastro-page__hero">
            <h1 className="cadastro-page__title">Cadastre-se</h1>
            <p className="cadastro-page__subtitle">
              Cadastre-se para começar a usar o SpitAgent.
            </p>
          </div>

          {/* Form card */}
          <div className="cadastro-page__card">
            <form className="cadastro-page__form" onSubmit={handleSubmit} noValidate>
              <Input
                label="Nome:"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoComplete="name"
              />
              <Input
                label="CNPJ ou CPF:"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                autoComplete="off"
              />
              <Input
                label="Email:"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                label="Senha:"
                variant="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="new-password"
              />

              <Button
                variant="primary"
                size="md"
                type="submit"
                className="cadastro-page__submit-btn"
              >
                Criar Conta
              </Button>
            </form>
          </div>

          {/* Login link */}
          <p className="cadastro-page__login">
            Já tem conta?{" "}
            <button
              type="button"
              className="cadastro-page__login-link"
              onClick={() => navigate("/login")}
            >
              Faça login
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
