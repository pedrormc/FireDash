# PRD — Responsividade Mobile + Correção Bug Visual do Mapa

**Projeto:** FireDash — Sistema de Monitoramento de Ocorrências
**Data:** 2026-03-15
**Prioridade:** Alta
**Status:** Proposta

---

## 1. Contexto e Problema

O FireDash é utilizado por bombeiros em campo que frequentemente acessam o sistema pelo celular. Atualmente, a experiência mobile apresenta diversos problemas:

1. **Bug visual crítico no Mapa:** Ao abrir o modal de "Novo Alerta" estando na página do Mapa, o mapa Leaflet sobrepõe o modal, tornando-o inutilizável. A causa raiz é que o container Leaflet cria seu próprio stacking context com z-indexes internos altos (panes até z-index 400+), e o mapa não possui isolamento adequado de z-index. O modal usa `z-[70]`, mas o Leaflet internamente pode ultrapassar esse valor.

2. **Responsividade deficiente:** A maioria das páginas e componentes foram projetados para desktop primeiro, com adaptações mobile incompletas ou ausentes.

---

## 2. Objetivos

| # | Objetivo | Métrica de Sucesso |
|---|---|---|
| O1 | Corrigir bug do mapa sobrepondo modal | Modal sempre visível acima do mapa em qualquer resolução |
| O2 | Layout mobile-first funcional em telas 320px–428px | Todas as páginas usáveis sem scroll horizontal |
| O3 | Navegação mobile intuitiva | Bottom tab bar + FAB funcionais com safe-area |
| O4 | Tabelas legíveis no mobile | Cards ou tabelas compactas sem necessidade de scroll horizontal excessivo |
| O5 | Modais responsivos | Formulários e modais de detalhes usáveis em telas pequenas |

---

## 3. Escopo

### 3.1 Dentro do Escopo

- Correção do bug de z-index do mapa vs modal
- Responsividade de todas as páginas existentes
- Adaptação de tabelas para mobile
- Ajuste de padding, grids e tipografia para telas pequenas
- Safe-area para dispositivos com notch
- Ajustes no modal NovoAlerta e IncidentModal para mobile

### 3.2 Fora do Escopo

- PWA / offline mode
- Notificações push nativas
- Redesign completo da UI
- Novas funcionalidades

---

## 4. Inventário de Problemas

### 4.1 Bug Crítico — Mapa Sobrepõe Modal (P0)

**Arquivo:** `src/pages/MapaPage.tsx`, `src/components/NovoAlertaModal.tsx`, `src/index.css`

**Problema:**
O container do mapa Leaflet (`MapContainer`) cria internamente panes com z-indexes altos (`.leaflet-pane` até z-index 400, `.leaflet-top` / `.leaflet-bottom` até 1000). Quando o `NovoAlertaModal` abre com `z-[70]`, os elementos internos do Leaflet podem ficar acima do overlay do modal.

Além disso, o `LocationPicker` dentro do modal de novo alerta cria **outro** `MapContainer` Leaflet, que pode gerar conflitos adicionais de z-index entre as duas instâncias de mapa.

**Solução proposta:**
1. Isolar o z-index do container do mapa com `isolation: isolate` ou `z-index: 0` + `position: relative` no wrapper do mapa
2. Elevar o z-index do modal e overlay para `z-[9999]` para garantir sobreposição
3. Adicionar no CSS: `.leaflet-container { z-index: auto !important; }` para o mapa da página (não o do modal)

---

### 4.2 Problemas de Responsividade por Componente

#### A) Layout Global (`App.tsx`) — Prioridade P1

| Problema | Linha | Correção |
|---|---|---|
| Bottom nav não considera safe-area | 357 | Adicionar `pb-safe` / `env(safe-area-inset-bottom)` |
| FAB posição fixa sem considerar safe-area | 376 | Ajustar `bottom` para `bottom-[calc(5rem+env(safe-area-inset-bottom))]` |
| Padding do content area fixo | 216 | `pb-20` para dar espaço ao bottom nav + safe area |

#### B) MapaPage (`src/pages/MapaPage.tsx`) — Prioridade P0

| Problema | Linha | Correção |
|---|---|---|
| Mapa muito pequeno no mobile (300px) | 122 | `min-h-[50vh]` no mobile para mapa mais utilizável |
| Lista lateral com max-h fixo (300px) | 190 | Remover `max-h-[300px]`, usar `max-h-[40vh]` no mobile |
| Badge overlay muito largo (w-64 = 256px) | 162 | `w-48 md:w-64` para caber em telas menores |
| Título e padding fixos | 112 | Já tem `p-4 md:p-8` — OK |

#### C) RelatoriosPage (`src/pages/RelatoriosPage.tsx`) — Prioridade P1

| Problema | Linha | Correção |
|---|---|---|
| Padding fixo `p-8` sem variante mobile | 53 | `p-4 md:p-8` |
| Header não empilha no mobile | 54 | `flex-col md:flex-row gap-4` |
| Filtros não empilham adequadamente | 66 | `flex-col md:flex-row` com filtros empilhados |
| Input com `min-w-[200px]` grande demais | 67 | `min-w-0 w-full md:min-w-[200px] md:flex-1` |
| Tabela com padding excessivo (`px-6 py-4`) | 127-132 | `px-3 py-2 md:px-6 md:py-4` |
| Tabela sem vista alternativa mobile | 123 | Considerar ocultar colunas menos importantes no mobile |

#### D) ConfiguracoesPage (`src/pages/ConfiguracoesPage.tsx`) — Prioridade P1

| Problema | Linha | Correção |
|---|---|---|
| Padding fixo `p-8` | 44 | `p-4 md:p-8` |
| Grid fixo `grid-cols-2` | 61 | `grid-cols-1 md:grid-cols-2` |
| Header não empilha | 45-59 | `flex-col md:flex-row gap-4` |

#### E) NovoAlertaModal (`src/components/NovoAlertaModal.tsx`) — Prioridade P0

| Problema | Linha | Correção |
|---|---|---|
| z-index insuficiente (`z-[70]`) | 93 | `z-[9999]` |
| Form grid fixo `grid-cols-2` | 123 | `grid-cols-1 md:grid-cols-2` |
| Header padding fixo `p-6` | 95 | `p-4 md:p-6` |
| Form padding fixo `p-6` | 122 | `p-4 md:p-6` |
| Título muito grande no mobile | 101 | `text-lg md:text-xl` |

#### F) IncidentModal (`src/components/IncidentModal.tsx`) — Prioridade P1

| Problema | Linha | Correção |
|---|---|---|
| z-index insuficiente (`z-[70]`) | 79 | `z-[9999]` |
| Grid fixo `grid-cols-2` para Tipo/Bairro | 102 | `grid-cols-1 md:grid-cols-2` |
| Flex horizontal fixo para Gravidade/Status/Data | 119 | `flex-col md:flex-row` |
| Header/body/footer padding fixo | 82, 101, 195 | Variantes `p-4 md:p-6` |
| Footer botões não empilham | 195-243 | `flex-col-reverse md:flex-row` no mobile |

#### G) IncidentTable (`src/components/IncidentTable.tsx`) — Prioridade P2

| Problema | Linha | Correção |
|---|---|---|
| Search input largura fixa `w-56` | 114 | `w-full md:w-56` |
| Tabela com colunas demais para mobile | 120-175 | Ocultar colunas "Bairro" e "Data" no mobile com `hidden md:table-cell` |
| Padding das células grande | 147+ | `px-3 py-2.5 md:px-5 md:py-3.5` |

#### H) SystemStatus (`src/components/SystemStatus.tsx`) — Prioridade P2

| Problema | Linha | Correção |
|---|---|---|
| Grid fixo `grid-cols-3` | 5 | `grid-cols-1 md:grid-cols-3` |
| Textos grandes demais | 10,17 | `text-2xl md:text-3xl` |

#### I) LocationPicker (`src/components/LocationPicker.tsx`) — Prioridade P2

| Problema | Linha | Correção |
|---|---|---|
| Altura fixa do mapa (200px) | 57 | `height: 160px` no mobile, `200px` no desktop via classe Tailwind |

#### J) MapSection (`src/components/MapSection.tsx`) — Prioridade P2

| Problema | Correção |
|---|---|
| Badge overlay `w-72` (288px) | `w-48 md:w-72` |

#### K) Sidebar (`src/components/Sidebar.tsx`) — Prioridade P3

O sidebar já está `hidden md:block` com bottom tab bar no mobile — comportamento aceitável. Sem ação necessária.

---

## 5. Plano de Implementação

### Fase 1 — Bug Fix do Mapa (P0) — ~1h

**Objetivo:** Resolver o bug onde o mapa sobrepõe o modal de novo alerta.

**Tarefas:**

1. **Isolar z-index do mapa Leaflet**
   - Arquivo: `src/pages/MapaPage.tsx`
   - No wrapper do mapa (linha 122), adicionar classe `relative z-0 isolate` (CSS `isolation: isolate`) para criar um novo stacking context que contenha os z-indexes internos do Leaflet

2. **Elevar z-index dos modais**
   - Arquivo: `src/components/NovoAlertaModal.tsx` (linha 93)
   - Arquivo: `src/components/IncidentModal.tsx` (linha 79)
   - Mudar `z-[70]` para `z-[9999]`

3. **CSS global para Leaflet**
   - Arquivo: `src/index.css`
   - Adicionar regra para conter z-index do mapa principal

4. **Testar:** Abrir modal de novo alerta na página do mapa — modal deve ficar 100% acima do mapa

### Fase 2 — Modais Responsivos (P0) — ~1h

**Objetivo:** Todos os modais usáveis em telas 320px+.

**Tarefas:**

1. **NovoAlertaModal** — Grid responsivo, padding adaptativo, titulo menor
2. **IncidentModal** — Grid responsivo, flex empilhado, footer adaptativo
3. **LocationPicker** — Altura adaptativa do mini-mapa

### Fase 3 — Layout de Páginas (P1) — ~2h

**Objetivo:** Todas as páginas com padding e layout responsivo.

**Tarefas:**

1. **RelatoriosPage** — Padding, header, filtros, tabela compacta
2. **ConfiguracoesPage** — Padding, grid 1-col mobile, header empilhado
3. **App.tsx** — Safe-area no bottom nav, ajuste do content padding e FAB

### Fase 4 — Tabelas e Componentes (P2) — ~1.5h

**Objetivo:** Tabelas legíveis e componentes adaptados.

**Tarefas:**

1. **IncidentTable** — Search full-width, colunas ocultas, padding menor
2. **RelatoriosPage tabela** — Mesmas adaptações
3. **SystemStatus** — Grid responsivo
4. **MapaPage** — Badge overlay menor, lista lateral com altura adequada

### Fase 5 — Polish e Safe Area (P3) — ~30min

**Objetivo:** Refinamentos finais.

**Tarefas:**

1. Safe-area-inset para bottom nav e FAB
2. Viewport meta tag com `viewport-fit=cover`
3. Teste visual em resoluções: 320px, 375px, 390px, 428px, 768px

---

## 6. Especificações Técnicas

### 6.1 Breakpoints (Tailwind v4)

| Prefixo | Largura | Uso |
|---|---|---|
| (default) | < 768px | Mobile (layout primário) |
| `md:` | >= 768px | Tablet / Desktop |
| `lg:` | >= 1024px | Desktop amplo |

### 6.2 Z-Index Scale

| Camada | Z-Index | Uso |
|---|---|---|
| Mapa Leaflet (contido) | `z-0` + `isolate` | Isola z-indexes internos |
| Bottom tab bar | `z-50` | Navegação mobile |
| FAB | `z-[60]` | Botão flutuante |
| Modais | `z-[9999]` | Sempre acima de tudo |

### 6.3 Safe Area

```css
/* Bottom nav */
padding-bottom: env(safe-area-inset-bottom);
```

```html
<!-- viewport meta -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

### 6.4 Padrão de Responsividade

```tsx
// Grid: mobile 1 col, desktop 2 col
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

// Padding: menor no mobile
<div className="p-4 md:p-8">

// Flex: empilha no mobile, row no desktop
<div className="flex flex-col md:flex-row gap-4">

// Tabela: ocultar colunas
<td className="hidden md:table-cell">

// Texto: escalar
<h2 className="text-xl md:text-2xl">
```

---

## 7. Critérios de Aceitação

### 7.1 Bug do Mapa (P0)
- [ ] Abrir "Novo Alerta" na página do Mapa — modal aparece acima do mapa
- [ ] O mapa dentro do LocationPicker (no modal) funciona normalmente
- [ ] Popups do mapa principal continuam funcionando ao fechar o modal
- [ ] Funciona tanto no tema dark quanto no light

### 7.2 Responsividade Geral
- [ ] Dashboard usável em 320px sem scroll horizontal
- [ ] Relatórios: filtros empilham, tabela compacta, botão exportar acessível
- [ ] Configurações: cards empilham em 1 coluna no mobile
- [ ] Mapa: mapa ocupa pelo menos 50vh, lista lateral scrollável
- [ ] Modais: formulários usáveis sem overflow horizontal

### 7.3 Navegação Mobile
- [ ] Bottom tab bar visível e funcional
- [ ] FAB "Novo Alerta" não sobrepõe o bottom tab bar
- [ ] Safe-area respeitada em dispositivos com notch
- [ ] Transição entre páginas fluida

### 7.4 Quality Gates
- [ ] `npm run lint` passa
- [ ] `npx tsc --noEmit -p api/tsconfig.json` passa
- [ ] `npm run build` sucesso
- [ ] Zero `console.log` em código commitado
- [ ] Tokens `fire-*` usados (sem cores raw novas)

---

## 8. Arquivos Afetados

| Arquivo | Tipo de Mudança |
|---|---|
| `src/pages/MapaPage.tsx` | Bug fix z-index + responsividade |
| `src/pages/RelatoriosPage.tsx` | Responsividade |
| `src/pages/ConfiguracoesPage.tsx` | Responsividade |
| `src/components/NovoAlertaModal.tsx` | Bug fix z-index + responsividade |
| `src/components/IncidentModal.tsx` | Bug fix z-index + responsividade |
| `src/components/IncidentTable.tsx` | Responsividade |
| `src/components/SystemStatus.tsx` | Responsividade |
| `src/components/LocationPicker.tsx` | Responsividade |
| `src/App.tsx` | Safe-area + padding |
| `src/index.css` | z-index isolation Leaflet |
| `index.html` | viewport-fit=cover |

---

## 9. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Leaflet z-index isolation quebra popups | Baixa | Alto | Testar popups após mudança |
| LocationPicker conflita com mapa principal | Média | Médio | Isolar apenas o mapa da página, não o do modal |
| Tabelas ocultar colunas remove info útil | Baixa | Baixo | Colunas acessíveis via scroll horizontal como fallback |
| Safe-area CSS não suportada em browsers antigos | Baixa | Baixo | Fallback com padding fixo |

---

## 10. Testes Recomendados

### Manual (obrigatório)
1. Abrir Chrome DevTools → Device Toolbar
2. Testar em: iPhone SE (375px), iPhone 14 (390px), Pixel 7 (412px), iPad Mini (768px)
3. Para cada resolução:
   - Dashboard: KPIs, filtros, tabela, gráficos
   - Relatórios: filtros, tabela, botão exportar
   - Mapa: mapa interativo, lista lateral, abrir modal
   - Configurações: cards de settings
   - Admin: tabela de usuários
4. Testar o bug: Mapa → FAB → Modal deve aparecer sobre o mapa

### Automatizado (futuro)
- Testes E2E com Playwright em viewport mobile (375x667)
- Snapshot tests dos componentes em viewport mobile
