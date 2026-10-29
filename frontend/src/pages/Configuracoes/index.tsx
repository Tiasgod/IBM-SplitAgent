import { Download, Upload, Landmark, Pencil } from "lucide-react";
import { PageLayout } from "../../components/layout/PageLayout";
import "./Configuracoes.css";

// ─── Mock data ─────────────────────────────────────────────────────────────────

const USER = {
  name: "Fulana",
  email: "fulana@gmail.com",
  cpfCnpj: "111.111.111.11111-11",
};

const LAST_IMPORT = "26/10/2026 21:05";

// ─── Sub-components ────────────────────────────────────────────────────────────

function UserCard() {
  return (
    <div className="config__user-card">
      <div className="config__user-info">
        <p className="config__user-field">
          <span className="config__user-label">Email:</span>
          <span className="config__user-value">{USER.email}</span>
        </p>
        <p className="config__user-field">
          <span className="config__user-label">CPF/CNPJ:</span>
          <span className="config__user-value">{USER.cpfCnpj}</span>
        </p>
      </div>
      <button className="config__user-edit-btn" aria-label="Editar dados pessoais">
        <Pencil size={18} strokeWidth={1.75} />
      </button>
    </div>
  );
}

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

function ActionCard({ icon, title, description, onClick }: ActionCardProps) {
  return (
    <button className="config__action-card" onClick={onClick}>
      <span className="config__action-icon" aria-hidden="true">{icon}</span>
      <div className="config__action-text">
        <span className="config__action-title">{title}</span>
        <span className="config__action-description">{description}</span>
      </div>
    </button>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Configuracoes() {
  return (
    <PageLayout headerVariant="nav">
      <div className="config">

        <h1 className="config__page-title">Configurações</h1>

        {/* ── Perfil ── */}
        <section className="config__section config__section--profile">
          <h2 className="config__section-title config__section-title--name">{USER.name}</h2>
          <UserCard />
        </section>

        {/* ── Layout principal: coluna esquerda + coluna direita ── */}
        <div className="config__layout">

          {/* Coluna esquerda */}
          <div className="config__col-left">

            {/* Dados Financeiros */}
            <section className="config__section">
              <h2 className="config__section-title">Dados Financeiros</h2>

              <div className="config__action-list">
                <ActionCard
                  icon={<Download size={28} strokeWidth={1.75} />}
                  title="Baixar modelo de planilha"
                  description="Saiba como preencher sua planilha de despesas, recebimentos ou Fluxo de caixa."
                />

                <ActionCard
                  icon={<Upload size={28} strokeWidth={1.75} />}
                  title="Importar planilha ou arquivo"
                  description="Envie uma planilha de despesas, recebimentos ou fluxo de caixa."
                />

                <p className="config__last-import">Última importação: {LAST_IMPORT}</p>

                <ActionCard
                  icon={<Landmark size={28} strokeWidth={1.75} />}
                  title="Conectar Conta Bancária"
                  description="Importe saldo e movimentações de um banco compatível."
                />
              </div>
            </section>

            {/* LGPD e Privacidade */}
            <section className="config__section">
              <h2 className="config__section-title">LGPD e Privacidade</h2>
              <ul className="config__lgpd-list">
                <li><a href="#termos" className="config__lgpd-link">Termos de Uso</a></li>
                <li><a href="#privacidade" className="config__lgpd-link">Política de Privacidade</a></li>
                <li><a href="#dados" className="config__lgpd-link">Como seus dados são tratados</a></li>
              </ul>
            </section>

          </div>

          {/* Coluna direita — ações de conta */}
          <div className="config__col-right">
            <button className="config__account-btn config__account-btn--logout">
              <span className="config__account-btn-title">Sair</span>
              <span className="config__account-btn-subtitle">Encerrar sessão</span>
            </button>

            <button className="config__account-btn config__account-btn--delete">
              <span className="config__account-btn-title">Excluir conta</span>
            </button>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
