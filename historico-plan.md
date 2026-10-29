# Histórico Page — Implementation Plan

## Overview

Create the **Histórico** page (`/historico`) for the SplitAgent frontend. The page does not yet exist — no route, no page directory, no component. The backend is not ready, so all data will be mock constants following the established project pattern.

### Functional requirements
- List decisions newest → oldest
- Each decision stores: date, recommendation presented, user's choice, projected result
- Period filter control (UI-only — no backend filtering yet)
- Empty state when no decisions exist
- Two empty-state variants: mobile (text only) and desktop (text + CTA button "Falar com SplitAgent")

### Out of scope
- Real API integration
- Actual period filtering logic
- Delete / hide / edit actions on decisions

---

## Visual Reference Summary

### Card anatomy (both breakpoints)
```
  12/09/2026                        ← date label, outside card

  ┌──────────────────────────────┐
  │  🟡  Recomendação do Split Payment:  ←  gold circle + bulb icon
  │      Antecipar recebíveis           ←  muted value
  │                                     │
  │  ⚫  Sua decisão                    ←  dark circle + list icon
  │      Antecipação parcial de R$15.000│
  │                                     │
  │  🟢  Resultado projeto              ←  teal circle + refresh/monitor icon
  │      Saldo mínimo sobe para R$18.000│
  └──────────────────────────────┘
```

### Empty state
- **Mobile:** centred bold text "Ainda não há histórico registrado..." — no CTA button
- **Desktop:** centred bold text + teal CTA button "Falar com SplitAgent" with bot/agent icon + chevron-right

### Period filter button
- Has a calendar icon on the left, label "Todos os períodos", chevron-down icon on the right
- Dark filled background (uses `--color-primary` navy) with white text
- Sits just below the subtitle, left-aligned

---

## File Map

```
frontend/src/
  pages/
    Historico/
      index.tsx          ← all types, mock data, sub-components, page export
      Historico.css      ← BEM styles
  routes/index.tsx       ← add /historico route (already wires to AppShell group)
```

---

## Sub-Task 1 — Types and Mock Data

**Status:** [ ] pending

**Intent**
Define the `Decision` interface and populate realistic mock constants, following the exact pattern used in `FluxoDeCaixa` and `VisaoGeral`.

**Expected Outcomes**
- `interface Decision` with fields: `id`, `date`, `recommendation`, `userChoice`, `projectedResult`
- `const DECISIONS: Decision[]` — 3 entries, newest date first (e.g. 12/09/2026, 03/09/2026, 20/08/2026)
- `const DECISIONS_EMPTY: Decision[] = []` — used to develop and test the empty state

**Todo List**
1. Create `frontend/src/pages/Historico/index.tsx`
2. Add `// ─── Types ───` section with `export interface Decision`
3. Add `// ─── Placeholder data (will come from backend) ───` section with `DECISIONS` (3 entries) and `DECISIONS_EMPTY`

**Relevant Context**
- Pattern reference: `frontend/src/pages/FluxoDeCaixa/index.tsx` lines 14–111
- Field labels from mockup: "Recomendação do Split Payment:", "Sua decisão", "Resultado projeto"

---

## Sub-Task 2 — Sub-components

**Status:** [ ] pending

**Intent**
Build the three focused visual components: the decision card, the period filter button, and the empty state. No page assembly yet.

**Expected Outcomes**

**`DecisionCard`**
- Date label rendered above the card border
- Card: white background, rounded corners, shadow
- Three rows, each: circular icon badge (coloured) + bold label + muted value text below
  - Row 1 — gold badge (`--color-tertiary #FFC801`), Lightbulb icon, label "Recomendação do Split Payment:", value = `decision.recommendation`
  - Row 2 — dark badge (`--color-primary #0F263B`), ListChecks icon, label "Sua decisão", value = `decision.userChoice`
  - Row 3 — teal badge (`--color-secondary #0E7573`), TrendingUp icon, label "Resultado projeto", value = `decision.projectedResult`

**`PeriodFilter`**
- Single button: `CalendarDays` icon + "Todos os períodos" text + `ChevronDown` icon
- Background `--color-primary` (dark navy), white text, `--radius-md` rounded corners
- Left-aligned, no full-width stretch

**`EmptyState`**
- Centred layout (column flex)
- Bold text: "Ainda não há histórico registrado..."
- On desktop only: teal CTA button "Falar com SplitAgent" with `Bot` icon left + `ChevronRight` icon right, linking to `/assistente`
- Use `useMediaQuery("(min-width: 768px)")` to conditionally render the CTA

**Todo List**
1. Implement `DecisionCard({ decision: Decision })` in `index.tsx`
2. Implement `PeriodFilter()` in `index.tsx`
3. Implement `EmptyState()` in `index.tsx` — import `useMediaQuery` from `../../hooks/useMediaQuery`

**Relevant Context**
- Icons (lucide-react): `Lightbulb`, `ListChecks`, `TrendingUp`, `CalendarDays`, `ChevronDown`, `Bot`, `ChevronRight`
- `useMediaQuery` hook: `frontend/src/hooks/useMediaQuery.ts`
- `Button` component (for CTA): `frontend/src/components/ui/Button.tsx` — use `variant="primary"` or style inline to match the teal filled design
- Mockup CTA button uses `--color-secondary` teal background (same as `Button variant="primary"` if that maps to teal)

---

## Sub-Task 3 — Page Composition and Route

**Status:** [ ] pending

**Intent**
Assemble sub-components into the final page and register the `/historico` route so the sidebar link becomes functional.

**Expected Outcomes**
- `export default function Historico()` wraps everything in `<ChatShell headerVariant="nav">`
- Renders: page header → `PeriodFilter` → (empty state OR decision list)
- Conditional: `DECISIONS.length === 0` → `<EmptyState />` else map `DECISIONS` → `<DecisionCard />`
- `/historico` route added inside the `AppShell` group in `routes/index.tsx`
- Clicking "Histórico" in the sidebar navigates to the page

**Todo List**
1. Export `default function Historico()` at the bottom of `index.tsx`
2. Add page-header block: `<h1>Histórico</h1>` + subtitle `<p>Acompanhe as recomendações que você aceitou e os resultados projetados</p>`
3. Render `<PeriodFilter />` below the header
4. Render conditional list/empty state
5. In `frontend/src/routes/index.tsx`: add import and `<Route path="/historico" element={<Historico />} />` inside the `AppShell` group (after line 22)

**Relevant Context**
- `ChatShell` import: `../../components/layout/ChatShell`
- Routes file: `frontend/src/routes/index.tsx` — AppShell group closes at line 23
- Sidebar already links to `/historico` (no sidebar changes needed)

---

## Sub-Task 4 — Styles (Historico.css)

**Status:** [ ] pending

**Intent**
Write the CSS module following project BEM conventions and design tokens.

**Expected Outcomes**
- Page layout: single-column, max-width container centred on desktop
- Card: white background, `--shadow-sm`, `--radius-md`, inner padding `--space-4`
- Date label: above card, muted colour, small font size
- Each icon row: flex row, gap between badge and text block; badge is a fixed-size circle with coloured background
- Period filter button: navy background, white text, flex row with gaps, `--radius-md`
- Empty state: full-width flex column centred, bold text, CTA button below on desktop
- Responsive overrides at `(min-width: 768px)` for larger spacing and card max-width

**Todo List**
1. Create `frontend/src/pages/Historico/Historico.css`
2. Add `import "./Historico.css"` at top of `index.tsx`
3. Define blocks: `.historico`, `.historico__page-header`, `.historico__title`, `.historico__subtitle`
4. Define: `.historico__filter-bar`
5. Define: `.historico__list` (list-style none, flex column, gap)
6. Define: `.historico__entry`, `.historico__date`, `.historico__card`
7. Define: `.historico__row`, `.historico__row-badge`, `.historico__row-badge--gold`, `.historico__row-badge--dark`, `.historico__row-badge--teal`, `.historico__row-body`, `.historico__row-label`, `.historico__row-value`
8. Define: `.historico__empty`, `.historico__empty-text`, `.historico__empty-cta`
9. Define: `.historico__filter-btn` (the period filter button)
10. Add `@media (min-width: 768px)` block with desktop spacing overrides

**Relevant Context**
- Token file: `frontend/src/styles/tokens.css`
- BEM reference: `frontend/src/pages/FluxoDeCaixa/FluxoDeCaixa.css`
- Badge colours: gold `#FFC801`, dark `#0F263B`, teal `#0E7573` (all from tokens)
- Badge size: ~40×40px circular (from mockup proportions)
