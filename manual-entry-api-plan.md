# Manual Entry API Integration Plan

## Overview

Connect the existing `ManualEntryCard` component (Fluxo de Caixa page) to the live
backend endpoints in the **Lançamentos manuais** section. After saving, the page must
reload its data so the user immediately sees the effect.

### Endpoints covered

| Method | Path | Action |
|--------|------|--------|
| POST | `/api/v1/saldo-inicial` | Criar saldo inicial |
| GET | `/api/v1/saldo-inicial` | Listar saldos (para exibir lista existente) |
| PUT | `/api/v1/saldo-inicial/{saldo_id}` | Atualizar saldo |
| DELETE | `/api/v1/saldo-inicial/{saldo_id}` | Excluir saldo (HTTP 204) |
| POST | `/api/v1/movimentacoes/manuais` | Criar movimentação |
| GET | `/api/v1/movimentacoes/manuais` | Listar movimentações manuais |
| GET | `/api/v1/movimentacoes/manuais/{movimentacao_id}` | Obter movimentação |
| PUT | `/api/v1/movimentacoes/manuais/{movimentacao_id}` | Atualizar movimentação (parcial) |
| DELETE | `/api/v1/movimentacoes/manuais/{movimentacao_id}` | Excluir movimentação (HTTP 204) |

### Request/Response contracts

**Saldo — POST/PUT body:**
```json
{ "data_referencia": "2026-10-30", "saldo": 15000.00 }
```
**Saldo — GET response item:**
```json
{ "id": 1, "data_referencia": "2026-10-30", "saldo": 15000.00 }
```

**Movimentação — POST body:**
```json
{ "data": "2026-11-05", "descricao": "...", "valor": 5000.00, "tipo": "entrada", "categoria": null }
```
**Movimentação — PUT body (todos opcionais):**
```json
{ "descricao": "...", "valor": 2000.00 }
```
**Movimentação — GET response item:**
```json
{ "id": 1, "data": "2026-11-05", "descricao": "...", "valor": 5000.00, "tipo": "entrada", "categoria": "vendas" }
```

### Out of scope

- GET individual `/api/v1/movimentacoes/manuais/{id}` — não há tela de detalhe, apenas listagem
- Paginação e filtros — não existem controles de filtro na UI atual
- Nenhuma mudança de CSS ou layout

---

## Sub-Task 1 — Create `lancamentos-manuais.service.ts`

**Status:** [ ] pending

**Intent**
Create a dedicated service file that owns all raw API interfaces, request/response types,
and CRUD methods for saldo-inicial and movimentacoes/manuais. No page or component files
change in this sub-task.

**Expected Outcomes**
- New file `frontend/src/services/lancamentos-manuais.service.ts`
- Compiles without TypeScript errors
- Exports all types needed by `ManualEntryCard`
- Each service method delegates to `api.request<T>()` following the same pattern as
  `importacoes.service.ts` and `historico.service.ts`

**Todo List**
1. Create `frontend/src/services/lancamentos-manuais.service.ts`
2. Add `import { api } from "./api"` at the top
3. Add `// ─── API types ───` section:
   - `interface SaldoInicialBody { data_referencia: string; saldo: number }` (POST + PUT body)
   - `interface SaldoInicialItem { id: number; data_referencia: string; saldo: number }` (GET response item)
   - `interface MovimentacaoManualBody { data: string; descricao: string; valor: number; tipo: string; categoria?: string | null }` (POST body)
   - `interface MovimentacaoManualUpdate { data?: string | null; descricao?: string | null; valor?: number | null; tipo?: string | null; categoria?: string | null }` (PUT body — all optional)
   - `interface MovimentacaoManualItem { id: number; data: string; descricao: string; valor: number; tipo: string; categoria: string | null }` (GET response item)
4. Export the two item types so `ManualEntryCard` can reference them:
   - `export type { SaldoInicialItem, MovimentacaoManualItem }`
5. Add `// ─── Service ───` section — export `lancamentosService` with methods:
   - `criarSaldo(body: SaldoInicialBody): Promise<SaldoInicialItem>` — POST `/api/v1/saldo-inicial`
   - `listarSaldos(): Promise<SaldoInicialItem[]>` — GET `/api/v1/saldo-inicial`
   - `atualizarSaldo(id: number, body: SaldoInicialBody): Promise<SaldoInicialItem>` — PUT `/api/v1/saldo-inicial/{id}`
   - `excluirSaldo(id: number): Promise<void>` — DELETE `/api/v1/saldo-inicial/{id}` (204 → undefined)
   - `criarMovimentacao(body: MovimentacaoManualBody): Promise<MovimentacaoManualItem>` — POST `/api/v1/movimentacoes/manuais`
   - `listarMovimentacoes(): Promise<MovimentacaoManualItem[]>` — GET `/api/v1/movimentacoes/manuais`
   - `atualizarMovimentacao(id: number, body: MovimentacaoManualUpdate): Promise<MovimentacaoManualItem>` — PUT `/api/v1/movimentacoes/manuais/{id}`
   - `excluirMovimentacao(id: number): Promise<void>` — DELETE `/api/v1/movimentacoes/manuais/{id}` (204 → undefined)

**Relevant Context**
- Pattern reference: `frontend/src/services/importacoes.service.ts`
- HTTP client: `frontend/src/services/api.ts` — `api.request<T>(path, { method, body })` injects auth header automatically; 204 responses already return `undefined as T`
- `valor` must be sent as `number`, not string — parse with `parseFloat(s.replace(",", "."))` in the component before calling the service
- `usuario_id` must NOT be sent — the backend derives it from the Bearer token

---

## Sub-Task 2 — Upgrade `ManualEntryCard` — creation forms wired to API

**Status:** [ ] pending

**Intent**
Replace the `console.log` stubs in `handleSaveSaldo` and `handleSaveMovimentacao` with
real service calls. Add a `loading` state to the submit buttons so the user gets visual
feedback while the request is in flight. Add an `onSaved` callback prop so the parent
page can reload its data after a successful save.

**Expected Outcomes**
- Clicking "Salvar saldo" calls `lancamentosService.criarSaldo(...)` and awaits the response
- Clicking "Adicionar" calls `lancamentosService.criarMovimentacao(...)` and awaits the response
- While the request is in flight the submit button shows its `loading` spinner and is disabled
- On success: success message is shown, card closes after 2.2 s, and `onSaved()` is called so the parent refreshes
- On API error: error message is shown inline (replacing success message area), card stays open
- `ManualEntryCard` gains an optional prop `onSaved?: () => void`
- `MovimentacaoForm` gains an optional `categoria` field (text input, not required) as the API accepts it
- `valor` field string is converted to `number` with `parseFloat(s.replace(",", "."))` before sending

**Todo List**
1. In `ManualEntryCard.tsx`, add `import { lancamentosService } from "../../services/lancamentos-manuais.service"`
2. Add `categoria: string` field to `MovimentacaoForm` interface (defaults to `""`)
3. Add a `categoria` `Input` field to `MovimentacaoSubForm` JSX (optional, no validation error)
4. Add `onSaved?: () => void` prop to `ManualEntryCard` and thread it through
5. Add `submitting: boolean` state to `ManualEntryCard` and pass it to sub-form buttons as `loading` / `disabled`
6. In `handleSaveSaldo`: replace the TODO stub with an `async` function that:
   - Sets `submitting = true`
   - Calls `lancamentosService.criarSaldo({ data_referencia: form.data, saldo: parseFloat(form.valor.replace(",", ".")) })`
   - On success: sets success message, schedules close after 2.2 s, calls `onSaved?.()`
   - On error: sets an error message string into a new `apiError` state (shown in the body instead of form)
   - Always sets `submitting = false`
7. In `handleSaveMovimentacao`: same pattern calling `lancamentosService.criarMovimentacao(...)`
8. Show `apiError` message (if any) in `manual-entry__body` with a `manual-entry__error` CSS class (style defined in Sub-Task 3)

**Relevant Context**
- `Button` component already accepts `loading` and `disabled` props — `loading={submitting}` disables the button and shows spinner
- `ManualEntryCard` is rendered in `frontend/src/pages/FluxoDeCaixa/index.tsx` — the page's `buscarFluxoCaixa()` must be called on `onSaved`; see Sub-Task 4

---

## Sub-Task 3 — Add list + edit + delete views inside `ManualEntryCard`

**Status:** [ ] pending

**Intent**
After the creation forms work, expand `ManualEntryCard` to show the existing saldos and
movimentações manuais. Each item in the list exposes an edit (inline form) and a delete
(with confirmation) action. This gives full CRUD without leaving the Fluxo de Caixa page.

**Expected Outcomes**
- When the card is opened, it fetches and displays existing saldos and movimentações manuais
- Each saldo item shows: data_referencia, saldo, edit button, delete button
- Each movimentação item shows: data, descricao, valor (with tipo color), categoria, edit button, delete button
- Clicking edit opens an inline prefilled form for that item (PUT)
- Clicking delete shows a small confirmation prompt; confirming calls DELETE; item disappears from list
- Loading and error states handled for list fetch, edit save, and delete
- The two tabs ("Movimentação" / "Saldo inicial") become three sections inside the open card:
  - "Nova movimentação" form (existing)
  - "Novo saldo" form (existing)
  - "Registros" list section (new) showing both lists side by side on desktop
- All new CSS classes use the `manual-entry__` BEM prefix and follow the same token variables
- A new CSS class `manual-entry__error` is added: `font-size: var(--font-size-sm); color: var(--color-danger)`

**Todo List**
1. Add `view: "form" | "list"` state to `ManualEntryCard` to toggle between "add new" and "see existing"
2. On open, fetch both lists in parallel: `Promise.all([lancamentosService.listarSaldos(), lancamentosService.listarMovimentacoes()])`
3. Store results in `saldos: SaldoInicialItem[]` and `movimentacoes: MovimentacaoManualItem[]` state
4. Render a `SaldoList` sub-component:
   - Maps `saldos` to list items with data, formatted value, edit + delete buttons
   - Edit: sets `editingSaldo` state; renders a prefilled `SaldoSubForm` with a "Salvar alterações" button calling `lancamentosService.atualizarSaldo`
   - Delete: shows inline confirmation ("Excluir?" + Sim/Não buttons); confirmed calls `lancamentosService.excluirSaldo`; removes item from local state optimistically
5. Render a `MovimentacaoList` sub-component with same pattern for movimentações
6. Add `manual-entry__list`, `manual-entry__list-item`, `manual-entry__list-actions`, `manual-entry__error` CSS classes to `FluxoDeCaixa.css`
7. On successful edit or delete call `onSaved?.()` to trigger page data reload

**Relevant Context**
- Optimistic removal: after `excluirSaldo(id)` resolves, filter item from local `saldos` array — no need to re-fetch the list
- After `atualizarSaldo`: update the item in local `saldos` array in place (replace by id) and close the inline form
- Same optimistic pattern for movimentações
- `FluxoDeCaixa.css` already has `.manual-entry__*` classes — append new ones at the bottom of the MANUAL ENTRY CARD section

---

## Sub-Task 4 — Wire `onSaved` in `FluxoDeCaixa` page

**Status:** [ ] pending

**Intent**
Pass a reload callback from the `FluxoDeCaixa` page into `ManualEntryCard` so that after
any successful save, edit, or delete the page immediately re-fetches its data from the API.

**Expected Outcomes**
- After any write operation in `ManualEntryCard`, `BalanceCard`, `ProjectionCard` and `MovementsCard` reflect the updated data without a full browser refresh
- The reload function is a simple extraction of the existing `useEffect` fetch logic into a named `loadData` function

**Todo List**
1. In `frontend/src/pages/FluxoDeCaixa/index.tsx`, extract the `useEffect` fetch into a named `loadData` function inside the component
2. Call `loadData()` inside `useEffect` on mount
3. Pass `onSaved={loadData}` to `<ManualEntryCard />`
4. No other changes to the page

**Relevant Context**
- `loadData` must set `loading = true` before fetching and `loading = false` in `finally`
- Avoid adding a separate `refreshKey` or `useCallback` — a plain `function loadData()` inside the component body is sufficient
- File: `frontend/src/pages/FluxoDeCaixa/index.tsx` lines 194–205 (current `useEffect`)
