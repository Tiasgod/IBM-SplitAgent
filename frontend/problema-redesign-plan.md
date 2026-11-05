# Plano: Redesign da Seção "Problema" — Landing Page

## Visão Geral

Substituir o conteúdo atual da seção `#problema` (diagrama de fluxo com steps + result cards) por um novo layout de **duas colunas**:

- **Esquerda:** Empilhamento vertical de 3 cards de recorte de matéria jornalística, com animação `float` suave e inclinações leves, referenciando fontes reais (EY, UOL Economia, Exame)
- **Direita:** Bloco de texto explicativo sobre o Split Payment — o que é, como impacta o caixa e uma conclusão — com título âncora e destaque visual

O título e subtítulo da seção (`A forma como sua empresa recebe pode mudar.` / `Você sabe quanto...`) são mantidos centralizados no topo.

---

## Sub-Tarefa 1 — Remover o conteúdo atual da seção Problema

**Intent:** Limpar o JSX e CSS do diagrama de fluxo (steps + result cards) para dar lugar ao novo layout.

**Expected Outcomes:**
- Seção `#problema` renderiza apenas título + subtítulo + espaço vazio
- Nenhum CSS morto do diagrama antigo permanece

**Todo List:**
1. Em [`index.tsx`](frontend/src/pages/LandingPage/index.tsx): remover `<div className="lp-problem__steps">` e `<div className="lp-problem__result">` e todo o JSX interno (ícones `ShoppingCart`, `SplitSquareHorizontal`, `Building2`, `Landmark`, seta SVG)
2. Remover os imports lucide que eram exclusivos dessas partes: `ShoppingCart`, `SplitSquareHorizontal`, `Building2`, `Landmark`
3. Em [`LandingPage.css`](frontend/src/pages/LandingPage/LandingPage.css): remover todos os blocos CSS do diagrama antigo: `.lp-problem__steps`, `.lp-problem__step`, `.lp-problem__step-icon`, `.lp-problem__step-num`, `.lp-problem__step-desc`, `.lp-problem__arrow`, `.lp-problem__result`, `.lp-problem__result-card`, `.lp-problem__result-card--company`, `.lp-problem__result-card--tax`, `.lp-problem__result-icon`, `.lp-problem__result-label`, `.lp-problem__result-value`, `.lp-problem__result-desc`

**Relevant Context:**
- JSX: `frontend/src/pages/LandingPage/index.tsx` linhas ~199–255
- CSS: `frontend/src/pages/LandingPage/LandingPage.css` linhas ~294–412

**Status:** [ ] pending

---

## Sub-Tarefa 2 — Novo layout duas colunas na seção Problema

**Intent:** Criar a estrutura JSX do novo layout: coluna esquerda (cards de matéria) + coluna direita (explicação do Split Payment).

**Expected Outcomes:**
- Seção renderiza duas colunas lado a lado no desktop, empilhadas no mobile
- Coluna esquerda: 3 cards de matéria com logo do veículo, título da manchete, subtítulo breve
- Coluna direita: título "O que é Split Payment?", 3 parágrafos explicativos, frase de conclusão destacada

**Conteúdo dos cards de matéria (fonte real):**

| # | Veículo | Logo/símbolo | Manchete | Subtítulo |
|---|---------|-------------|----------|-----------|
| 1 | EY | `ey` em texto bold amarelo | "Reforma tributária: Split payment vai alterar gestão de caixa das empresas" | "O modelo vai mudar a lógica da geração de caixa, que não poderá mais se financiar com dinheiro do governo" |
| 2 | UOL Economia | `uol` em vermelho/laranja | "Nova regra na cobrança de impostos, split payment ameaça asfixiar empresas" | "13/08/2026 · Wanderley Preite Sobrinho" |
| 3 | Exame | `exame.` em vermelho bold | "Split payment da reforma tributária força empresas a rever caixa e contratos desde já" | "Com mudança, IBS e CBS passarão a ser separados no momento do pagamento" |

**Conteúdo do bloco explicativo (direita):**

> **O que muda com o Split Payment?**
>
> O Split Payment vai mudar a forma como as empresas lidam com seus impostos. O valor dos tributos (IBS e CBS) será descontado automaticamente no momento do pagamento — antes de o dinheiro chegar ao caixa da empresa.
>
> Isso pode reduzir o capital disponível para o giro do negócio e exigir uma reorganização financeira significativa. O impacto será diferente para cada empresa, dependendo do seu porte e modelo de negócio.
>
> Por outro lado, a mudança também promete mais transparência e segurança na arrecadação.
>
> ⚡ **Entender esse impacto no seu negócio, antes que ele aconteça, é o que o SplitAgent faz.**

**Todo List:**
1. Adicionar em `index.tsx` a estrutura `<div className="lp-problem__layout">` com `<div className="lp-problem__news">` (esquerda) e `<div className="lp-problem__explainer">` (direita)
2. Criar os 3 news cards como `<article className="lp-problem__news-card">` com elementos: `.lp-problem__news-source` (logo textual do veículo), `.lp-problem__news-title`, `.lp-problem__news-desc`
3. Criar o bloco explicativo com `.lp-problem__explainer-title`, `.lp-problem__explainer-body` (parágrafos), `.lp-problem__explainer-cta` (frase de conclusão destacada)

**Relevant Context:**
- `frontend/src/pages/LandingPage/index.tsx` — seção `#problema`
- Background da seção: `var(--lp-dark-mid)` = `#0d1e35`

**Status:** [ ] pending

---

## Sub-Tarefa 3 — CSS: layout, cards e animação float

**Intent:** Estilizar o novo layout com duas colunas responsivas, cards com visual de recorte de jornal e animação float.

**Expected Outcomes:**
- Desktop: colunas lado a lado (esquerda ~45%, direita ~55%)
- Mobile: empilhadas, cards primeiro, explicação depois
- Cards têm leve inclinação alternada (`rotate`), fundo semi-transparente claro, borda sutil, sombra suave
- Animação `@keyframes float-card` com `translateY` suave (3–5px), velocidade ~4–6s, delays diferentes por card
- Logo do veículo estilizada (EY=amarelo, UOL=laranja, Exame=vermelho)
- Bloco direito: texto claro, parágrafo de conclusão com borda esquerda teal ou cor de destaque

**Todo List:**
1. Adicionar `@keyframes float-card` no CSS (translação Y suave, sem rotação na animação — rotação é fixa por card)
2. Adicionar `.lp-problem__layout` (flex row no desktop, column no mobile)
3. Adicionar `.lp-problem__news` (coluna esquerda, `display: flex; flex-direction: column; gap`)
4. Adicionar `.lp-problem__news-card` (background semi-transparente branco, border-radius, padding, box-shadow, `animation: float-card`)
5. Adicionar modificadores de rotação e delay: `.lp-problem__news-card:nth-child(1)` (rotate -2deg, delay 0s), `:nth-child(2)` (rotate 1.5deg, delay 1.5s), `:nth-child(3)` (rotate -1deg, delay 3s)
6. Adicionar `.lp-problem__news-source` (logo textual estilizada por veículo), `.lp-problem__news-title`, `.lp-problem__news-desc`
7. Adicionar `.lp-problem__explainer` (coluna direita, flex column, gap)
8. Adicionar `.lp-problem__explainer-title`, `.lp-problem__explainer-body p`, `.lp-problem__explainer-cta`

**Relevant Context:**
- CSS file: `frontend/src/pages/LandingPage/LandingPage.css`
- Tokens disponíveis: `var(--lp-teal)`, `var(--lp-teal-dim)`, `var(--lp-text)`, `var(--lp-text-muted)`, `var(--lp-white)`, `var(--font-family)`, `var(--font-size-xs/sm/md/lg)`

**Status:** [ ] pending

---

## Notas de Implementação

- Os cards de notícia **não são links clicáveis** por ora (apenas visuais) — mas mantêm `href` comentado para uso futuro
- A animação float deve ser **leve e lenta** (não distrativa) — `ease-in-out infinite alternate`
- No mobile os cards ficam **sem rotação** para não quebrar o layout
- O título e subtítulo existentes da seção (`.lp-problem__title` e `.lp-problem__subtitle`) são mantidos acima do novo layout
