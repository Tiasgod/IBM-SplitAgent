import { useState } from "react";
import { PlusCircle, X, Pencil, Trash2 } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import {
  lancamentosService,
  type SaldoInicialItem,
  type MovimentacaoManualItem,
} from "../../services/lancamentos-manuais.service";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabMode = "movimentacao" | "saldo" | "registros";

interface SaldoForm {
  data: string;
  valor: string;
}

interface MovimentacaoForm {
  descricao: string;
  valor: string;
  data: string;
  tipo: string;
  categoria: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function parseValor(s: string): number {
  return parseFloat(s.replace(",", "."));
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function formatDate(iso: string): string {
  const raw = new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });
  return raw.endsWith(".") ? raw.slice(0, -1) : raw;
}

const TIPO_OPTIONS = [
  { value: "entrada", label: "Entrada (recebimento)" },
  { value: "saida", label: "Saída (despesa)" },
];

const EMPTY_SALDO: SaldoForm = { data: todayISO(), valor: "" };
const EMPTY_MOV: MovimentacaoForm = {
  descricao: "",
  valor: "",
  data: "",
  tipo: "",
  categoria: "",
};

// ─── Saldo sub-form ───────────────────────────────────────────────────────────

function SaldoSubForm({
  initial,
  submitLabel,
  submitting,
  onSave,
  onCancel,
}: {
  initial?: SaldoForm;
  submitLabel: string;
  submitting: boolean;
  onSave: (form: SaldoForm) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<SaldoForm>(initial ?? EMPTY_SALDO);
  const [errors, setErrors] = useState<Partial<SaldoForm>>({});

  function validate(): boolean {
    const next: Partial<SaldoForm> = {};
    if (!form.data) next.data = "Informe a data";
    const num = parseValor(form.valor);
    if (!form.valor || isNaN(num) || num < 0)
      next.valor = "Informe um valor válido";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSave(form);
  }

  return (
    <form className="manual-entry__form" onSubmit={handleSubmit} noValidate>
      <div className="manual-entry__fields">
        <Input
          variant="date"
          label="Data de referência"
          value={form.data}
          onChange={(e) => setForm({ ...form, data: e.target.value })}
          error={errors.data}
        />
        <Input
          label="Saldo disponível (R$)"
          placeholder="Ex.: 15000,00"
          value={form.valor}
          onChange={(e) => setForm({ ...form, valor: e.target.value })}
          error={errors.valor}
          inputMode="decimal"
        />
      </div>
      <div className="manual-entry__actions">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

// ─── Movimentação sub-form ────────────────────────────────────────────────────

function MovimentacaoSubForm({
  initial,
  submitLabel,
  submitting,
  onSave,
  onCancel,
}: {
  initial?: MovimentacaoForm;
  submitLabel: string;
  submitting: boolean;
  onSave: (form: MovimentacaoForm) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<MovimentacaoForm>(initial ?? EMPTY_MOV);
  const [errors, setErrors] = useState<Partial<MovimentacaoForm>>({});

  function validate(): boolean {
    const next: Partial<MovimentacaoForm> = {};
    if (!form.descricao.trim()) next.descricao = "Informe uma descrição";
    const num = parseValor(form.valor);
    if (!form.valor || isNaN(num) || num <= 0)
      next.valor = "Informe um valor maior que zero";
    if (!form.data) next.data = "Informe a data";
    if (!form.tipo) next.tipo = "Selecione o tipo";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSave(form);
  }

  return (
    <form className="manual-entry__form" onSubmit={handleSubmit} noValidate>
      <div className="manual-entry__fields">
        <Input
          label="Descrição"
          placeholder="Ex.: Pagamento fornecedor"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          error={errors.descricao}
        />
        <div className="manual-entry__row">
          <Input
            label="Valor (R$)"
            placeholder="Ex.: 3500,00"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            error={errors.valor}
            inputMode="decimal"
          />
          <Input
            variant="date"
            label="Data"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
            error={errors.data}
          />
        </div>
        <div className="manual-entry__row">
          <Select
            label="Tipo"
            options={TIPO_OPTIONS}
            placeholder="Selecione o tipo"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            error={errors.tipo}
          />
          <Input
            label="Categoria (opcional)"
            placeholder="Ex.: vendas, aluguel"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          />
        </div>
      </div>
      <div className="manual-entry__actions">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

// ─── Saldo list ───────────────────────────────────────────────────────────────

function SaldoList({
  items,
  onUpdated,
  onDeleted,
  onSaved,
}: {
  items: SaldoInicialItem[];
  onUpdated: (item: SaldoInicialItem) => void;
  onDeleted: (id: number) => void;
  onSaved?: () => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  async function handleEdit(item: SaldoInicialItem, form: SaldoForm) {
    setSubmitting(true);
    setApiError(null);
    try {
      const updated = await lancamentosService.atualizarSaldo(item.id, {
        data_referencia: form.data,
        saldo: parseValor(form.valor),
      });
      onUpdated(updated);
      onSaved?.();
      setEditingId(null);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Erro ao atualizar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setSubmitting(true);
    setApiError(null);
    try {
      await lancamentosService.excluirSaldo(id);
      onDeleted(id);
      onSaved?.();
      setConfirmDeleteId(null);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Erro ao excluir.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <p className="manual-entry__empty">Nenhum saldo registrado ainda.</p>;
  }

  return (
    <ul className="manual-entry__list">
      {apiError && <p className="manual-entry__error">{apiError}</p>}
      {items.map((item) =>
        editingId === item.id ? (
          <li key={item.id} className="manual-entry__list-item manual-entry__list-item--editing">
            <SaldoSubForm
              initial={{ data: item.data_referencia, valor: String(item.saldo) }}
              submitLabel="Salvar alterações"
              submitting={submitting}
              onSave={(form) => handleEdit(item, form)}
              onCancel={() => setEditingId(null)}
            />
          </li>
        ) : (
          <li key={item.id} className="manual-entry__list-item">
            <div className="manual-entry__list-info">
              <span className="manual-entry__list-label">{formatDate(item.data_referencia)}</span>
              <span className="manual-entry__list-value">{formatBRL(item.saldo)}</span>
            </div>
            <div className="manual-entry__list-actions">
              {confirmDeleteId === item.id ? (
                <>
                  <span className="manual-entry__confirm-label">Excluir?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={submitting}
                  >
                    Não
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={submitting}
                    onClick={() => handleDelete(item.id)}
                  >
                    Sim
                  </Button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="manual-entry__icon-btn"
                    aria-label="Editar saldo"
                    onClick={() => setEditingId(item.id)}
                  >
                    <Pencil size={15} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="manual-entry__icon-btn manual-entry__icon-btn--danger"
                    aria-label="Excluir saldo"
                    onClick={() => setConfirmDeleteId(item.id)}
                  >
                    <Trash2 size={15} strokeWidth={1.75} />
                  </button>
                </>
              )}
            </div>
          </li>
        )
      )}
    </ul>
  );
}

// ─── Movimentação list ────────────────────────────────────────────────────────

function MovimentacaoList({
  items,
  onUpdated,
  onDeleted,
  onSaved,
}: {
  items: MovimentacaoManualItem[];
  onUpdated: (item: MovimentacaoManualItem) => void;
  onDeleted: (id: number) => void;
  onSaved?: () => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  async function handleEdit(item: MovimentacaoManualItem, form: MovimentacaoForm) {
    setSubmitting(true);
    setApiError(null);
    try {
      const updated = await lancamentosService.atualizarMovimentacao(item.id, {
        data: form.data,
        descricao: form.descricao,
        valor: parseValor(form.valor),
        tipo: form.tipo,
        categoria: form.categoria || null,
      });
      onUpdated(updated);
      onSaved?.();
      setEditingId(null);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Erro ao atualizar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setSubmitting(true);
    setApiError(null);
    try {
      await lancamentosService.excluirMovimentacao(id);
      onDeleted(id);
      onSaved?.();
      setConfirmDeleteId(null);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Erro ao excluir.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <p className="manual-entry__empty">Nenhuma movimentação registrada ainda.</p>;
  }

  return (
    <ul className="manual-entry__list">
      {apiError && <p className="manual-entry__error">{apiError}</p>}
      {items.map((item) =>
        editingId === item.id ? (
          <li key={item.id} className="manual-entry__list-item manual-entry__list-item--editing">
            <MovimentacaoSubForm
              initial={{
                descricao: item.descricao,
                valor: String(item.valor),
                data: item.data,
                tipo: item.tipo,
                categoria: item.categoria ?? "",
              }}
              submitLabel="Salvar alterações"
              submitting={submitting}
              onSave={(form) => handleEdit(item, form)}
              onCancel={() => setEditingId(null)}
            />
          </li>
        ) : (
          <li key={item.id} className="manual-entry__list-item">
            <div className="manual-entry__list-info">
              <span className="manual-entry__list-label">
                {item.descricao}
                {item.categoria && (
                  <span className="manual-entry__list-category"> · {item.categoria}</span>
                )}
              </span>
              <div className="manual-entry__list-meta">
                <span className="manual-entry__list-date">{formatDate(item.data)}</span>
                <span
                  className={`manual-entry__list-value ${
                    item.tipo === "entrada"
                      ? "manual-entry__list-value--positive"
                      : "manual-entry__list-value--negative"
                  }`}
                >
                  {item.tipo === "entrada" ? "+ " : "- "}
                  {formatBRL(item.valor)}
                </span>
              </div>
            </div>
            <div className="manual-entry__list-actions">
              {confirmDeleteId === item.id ? (
                <>
                  <span className="manual-entry__confirm-label">Excluir?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={submitting}
                  >
                    Não
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={submitting}
                    onClick={() => handleDelete(item.id)}
                  >
                    Sim
                  </Button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="manual-entry__icon-btn"
                    aria-label="Editar movimentação"
                    onClick={() => setEditingId(item.id)}
                  >
                    <Pencil size={15} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="manual-entry__icon-btn manual-entry__icon-btn--danger"
                    aria-label="Excluir movimentação"
                    onClick={() => setConfirmDeleteId(item.id)}
                  >
                    <Trash2 size={15} strokeWidth={1.75} />
                  </button>
                </>
              )}
            </div>
          </li>
        )
      )}
    </ul>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────

export function ManualEntryCard({ onSaved }: { onSaved?: () => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabMode>("movimentacao");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // List data (fetched when the card opens)
  const [saldos, setSaldos] = useState<SaldoInicialItem[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoManualItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  function resetFeedback() {
    setSuccessMsg(null);
    setApiError(null);
  }

  function handleClose() {
    setOpen(false);
    resetFeedback();
  }

  async function fetchLists() {
    setListLoading(true);
    setListError(null);
    try {
      const [s, m] = await Promise.all([
        lancamentosService.listarSaldos(),
        lancamentosService.listarMovimentacoes(),
      ]);
      setSaldos(s);
      setMovimentacoes(m);
    } catch (e: unknown) {
      setListError(e instanceof Error ? e.message : "Erro ao carregar registros.");
    } finally {
      setListLoading(false);
    }
  }

  function handleToggle() {
    const next = !open;
    setOpen(next);
    resetFeedback();
    if (next) fetchLists();
  }

  async function handleSaveSaldo(form: SaldoForm) {
    setSubmitting(true);
    resetFeedback();
    try {
      const body = { data_referencia: form.data, saldo: parseValor(form.valor) };
      const existing = saldos.find((s) => s.data_referencia === form.data);
      let saved: SaldoInicialItem;
      if (existing) {
        saved = await lancamentosService.atualizarSaldo(existing.id, body);
        setSaldos((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
      } else {
        saved = await lancamentosService.criarSaldo(body);
        setSaldos((prev) => [saved, ...prev]);
      }
      onSaved?.();
      setSuccessMsg(`Saldo de ${formatBRL(saved.saldo)} registrado para ${formatDate(saved.data_referencia)}.`);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Erro ao salvar saldo.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveMovimentacao(form: MovimentacaoForm) {
    setSubmitting(true);
    resetFeedback();
    try {
      const created = await lancamentosService.criarMovimentacao({
        data: form.data,
        descricao: form.descricao,
        valor: parseValor(form.valor),
        tipo: form.tipo,
        categoria: form.categoria || null,
      });
      setMovimentacoes((prev) => [created, ...prev]);
      onSaved?.();
      const label = created.tipo === "entrada" ? "Entrada" : "Saída";
      setSuccessMsg(`${label} de ${formatBRL(created.valor)} adicionada.`);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Erro ao salvar movimentação.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fluxo__card manual-entry">
      {/* Header — sempre visível */}
      <div className="manual-entry__header">
        <div className="manual-entry__header-text">
          <h2 className="manual-entry__title">Lançamentos manuais</h2>
          <p className="manual-entry__subtitle">
            Adicione ou gerencie saldos iniciais e movimentações futuras.
          </p>
        </div>
        <button
          type="button"
          className={`manual-entry__toggle ${open ? "manual-entry__toggle--open" : ""}`}
          aria-expanded={open}
          aria-label={open ? "Fechar painel" : "Abrir painel"}
          onClick={handleToggle}
        >
          {open ? <X size={20} strokeWidth={2} /> : <PlusCircle size={20} strokeWidth={1.75} />}
        </button>
      </div>

      {/* Corpo colapsável */}
      {open && (
        <div className="manual-entry__body">
          {/* Tab switcher */}
          <div className="manual-entry__tabs" role="tablist">
            {(["movimentacao", "saldo", "registros"] as TabMode[]).map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={tab === t}
                className={`manual-entry__tab ${tab === t ? "manual-entry__tab--active" : ""}`}
                onClick={() => { setTab(t); resetFeedback(); }}
              >
                {t === "movimentacao" ? "Movimentação" : t === "saldo" ? "Saldo inicial" : "Registros"}
              </button>
            ))}
          </div>

          {/* Conteúdo da aba ativa */}
          {tab === "saldo" && (
            <>
              {successMsg && <p className="manual-entry__success" role="status">{successMsg}</p>}
              {apiError && <p className="manual-entry__error" role="alert">{apiError}</p>}
              <SaldoSubForm
                submitLabel="Salvar saldo"
                submitting={submitting}
                onSave={handleSaveSaldo}
                onCancel={handleClose}
              />
              {listLoading && <p className="manual-entry__empty">Carregando registros...</p>}
              {listError && <p className="manual-entry__error" role="alert">{listError}</p>}
              {!listLoading && !listError && saldos.length > 0 && (
                <section className="manual-entry__records-section" style={{ marginTop: "1rem" }}>
                  <h3 className="manual-entry__records-title">Saldos cadastrados</h3>
                  <SaldoList
                    items={saldos}
                    onUpdated={(updated) => {
                      setSaldos((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
                      onSaved?.();
                    }}
                    onDeleted={(id) => {
                      setSaldos((prev) => prev.filter((s) => s.id !== id));
                      onSaved?.();
                    }}
                  />
                </section>
              )}
            </>
          )}

          {tab === "movimentacao" && (
            <>
              {successMsg && <p className="manual-entry__success" role="status">{successMsg}</p>}
              {apiError && <p className="manual-entry__error" role="alert">{apiError}</p>}
              <MovimentacaoSubForm
                submitLabel="Adicionar"
                submitting={submitting}
                onSave={handleSaveMovimentacao}
                onCancel={handleClose}
              />
              {listLoading && <p className="manual-entry__empty">Carregando registros...</p>}
              {listError && <p className="manual-entry__error" role="alert">{listError}</p>}
              {!listLoading && !listError && movimentacoes.length > 0 && (
                <section className="manual-entry__records-section" style={{ marginTop: "1rem" }}>
                  <h3 className="manual-entry__records-title">Movimentações cadastradas</h3>
                  <MovimentacaoList
                    items={movimentacoes}
                    onUpdated={(updated) => {
                      setMovimentacoes((prev) =>
                        prev.map((m) => (m.id === updated.id ? updated : m))
                      );
                      onSaved?.();
                    }}
                    onDeleted={(id) => {
                      setMovimentacoes((prev) => prev.filter((m) => m.id !== id));
                      onSaved?.();
                    }}
                  />
                </section>
              )}
            </>
          )}

          {tab === "registros" && (
            <div className="manual-entry__records">
              {listLoading && <p className="manual-entry__empty">Carregando registros...</p>}
              {listError && <p className="manual-entry__error" role="alert">{listError}</p>}
              {!listLoading && !listError && (
                <div className="manual-entry__records-grid">
                  <section className="manual-entry__records-section">
                    <h3 className="manual-entry__records-title">Saldos iniciais</h3>
                    <SaldoList
                      items={saldos}
                      onUpdated={(updated) => {
                        setSaldos((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
                        onSaved?.();
                      }}
                      onDeleted={(id) => {
                        setSaldos((prev) => prev.filter((s) => s.id !== id));
                        onSaved?.();
                      }}
                    />
                  </section>
                  <section className="manual-entry__records-section">
                    <h3 className="manual-entry__records-title">Movimentações</h3>
                    <MovimentacaoList
                      items={movimentacoes}
                      onUpdated={(updated) => {
                        setMovimentacoes((prev) =>
                          prev.map((m) => (m.id === updated.id ? updated : m))
                        );
                        onSaved?.();
                      }}
                      onDeleted={(id) => {
                        setMovimentacoes((prev) => prev.filter((m) => m.id !== id));
                        onSaved?.();
                      }}
                    />
                  </section>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
