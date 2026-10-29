import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Upload, Landmark, Pencil, X, Check } from "lucide-react";
import { PageLayout } from "../../components/layout/PageLayout";
import { Input } from "../../components/ui/Input";
import { importacoesService } from "../../services/importacoes.service";
import type { ResumoImportacao } from "../../services/importacoes.service";
import { authService, fetchAndStoreMe } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import "./Configuracoes.css";

// ─── Sub-components ────────────────────────────────────────────────────────────

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
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Import state ──
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [resumo, setResumo] = useState<ResumoImportacao | null>(null);
  const [downloadingModel, setDownloadingModel] = useState(false);

  // ── Delete account state ──
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Edit profile state ──
  const [editing, setEditing] = useState(false);
  const [editNome, setEditNome] = useState("");
  const [editDocumento, setEditDocumento] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    // Sync profile from API on mount — ensures nome/email are up to date.
    // documento is preserved from localStorage if the API doesn't return it.
    fetchAndStoreMe()
      .then(() => refresh())
      .catch(() => {});

    importacoesService.obterAtual()
      .then(setResumo)
      .catch(() => { /* sem importação prévia */ });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleOpenEdit() {
    setEditNome(user?.nome ?? "");
    setEditDocumento(user?.documento ?? "");
    setEditEmail(user?.email ?? "");
    setEditError(null);
    setEditing(true);
  }

  function handleCancelEdit() {
    setEditing(false);
    setEditError(null);
  }

  async function handleSaveEdit() {
    setSaving(true);
    setEditError(null);
    try {
      await authService.atualizarMe({
        nome: editNome.trim() || null,
        documento: editDocumento.trim() || null,
        email: editEmail.trim() || null,
      });
      refresh();
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await authService.deletarMe();
      navigate("/cadastro");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Erro ao excluir conta. Tente novamente.");
      setDeleting(false);
    }
  }

  async function handleBaixarModelo() {
    setDownloadingModel(true);
    try {
      await importacoesService.baixarModelo();
    } catch {
      // silently ignore — browser will show download failure
    } finally {
      setDownloadingModel(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError(null);
    setImportSuccess(false);
    try {
      const result = await importacoesService.importar(file);
      setResumo(result);
      setImportSuccess(true);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Erro ao importar planilha.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const lastImport = resumo
    ? new Date(resumo.importado_em).toLocaleDateString("pt-BR")
    : "—";

  return (
    <PageLayout headerVariant="nav">
      <div className="config">

        <h1 className="config__page-title">Configurações</h1>

        {/* ── Perfil ── */}
        <section className="config__section config__section--profile">
          <h2 className="config__section-title config__section-title--name">{user?.nome ?? "—"}</h2>

          {editing ? (
            <div className="config__user-card config__user-card--editing">
              <div className="config__user-edit-form">
                <Input
                  label="Nome:"
                  value={editNome}
                  onChange={e => setEditNome(e.target.value)}
                  autoComplete="name"
                  disabled={saving}
                />
                <Input
                  label="CPF/CNPJ:"
                  value={editDocumento}
                  onChange={e => setEditDocumento(e.target.value)}
                  autoComplete="off"
                  disabled={saving}
                />
                <Input
                  label="Email:"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  autoComplete="email"
                  disabled={saving}
                />
                {editError && (
                  <p className="config__edit-error" role="alert">{editError}</p>
                )}
              </div>
              <div className="config__user-edit-actions">
                <button
                  className="config__user-edit-btn config__user-edit-btn--save"
                  aria-label="Salvar alterações"
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  <Check size={18} strokeWidth={2} />
                </button>
                <button
                  className="config__user-edit-btn config__user-edit-btn--cancel"
                  aria-label="Cancelar edição"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
          ) : (
            <div className="config__user-card">
              <div className="config__user-info">
                <p className="config__user-field">
                  <span className="config__user-label">Email:</span>
                  <span className="config__user-value">{user?.email ?? "—"}</span>
                </p>
                <p className="config__user-field">
                  <span className="config__user-label">CPF/CNPJ:</span>
                  <span className="config__user-value">{user?.documento || "—"}</span>
                </p>
              </div>
              <button
                className="config__user-edit-btn"
                aria-label="Editar dados pessoais"
                onClick={handleOpenEdit}
              >
                <Pencil size={18} strokeWidth={1.75} />
              </button>
            </div>
          )}
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
                  title={downloadingModel ? "Baixando…" : "Baixar modelo de planilha"}
                  description="Saiba como preencher sua planilha de despesas, recebimentos ou Fluxo de caixa."
                  onClick={handleBaixarModelo}
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <ActionCard
                  icon={<Upload size={28} strokeWidth={1.75} />}
                  title={importing ? "Importando…" : "Importar planilha ou arquivo"}
                  description="Envie uma planilha de despesas, recebimentos ou fluxo de caixa."
                  onClick={() => fileInputRef.current?.click()}
                />

                {importError && (
                  <p className="config__import-error" role="alert">{importError}</p>
                )}
                {importSuccess && (
                  <p className="config__import-success" role="status">Planilha importada com sucesso!</p>
                )}

                <p className="config__last-import">Última importação: {lastImport}</p>

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
            <button
              className="config__account-btn config__account-btn--logout"
              onClick={async () => { await authService.logout(); navigate("/login"); }}
            >
              <span className="config__account-btn-title">Sair</span>
              <span className="config__account-btn-subtitle">Encerrar sessão</span>
            </button>

            {confirmDelete ? (
              <div className="config__delete-confirm">
                <p className="config__delete-confirm-text">
                  Tem certeza? Esta ação é <strong>irreversível</strong> e apagará todos os seus dados.
                </p>
                {deleteError && (
                  <p className="config__delete-error" role="alert">{deleteError}</p>
                )}
                <div className="config__delete-confirm-actions">
                  <button
                    className="config__account-btn config__account-btn--delete"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                  >
                    <span className="config__account-btn-title">
                      {deleting ? "Excluindo…" : "Confirmar exclusão"}
                    </span>
                  </button>
                  <button
                    className="config__account-btn config__account-btn--cancel"
                    onClick={() => { setConfirmDelete(false); setDeleteError(null); }}
                    disabled={deleting}
                  >
                    <span className="config__account-btn-title">Cancelar</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="config__account-btn config__account-btn--delete"
                onClick={() => setConfirmDelete(true)}
              >
                <span className="config__account-btn-title">Excluir conta</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
