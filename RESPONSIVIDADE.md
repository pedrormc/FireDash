# PRD — Responsividade Mobile (FireDash)

## Visao Geral

Tornar toda a interface do FireDash completamente funcional e usavel em dispositivos moveis (360px+), tablets (768px+) e desktops (1024px+). A abordagem e **mobile-first**: corrigir o que ja existe e implementar patterns responsivos onde faltam.

**Producao:** https://firedash-bombeiros.vercel.app

---

## Breakpoints

| Token | Min-width | Dispositivos |
|---|---|---|
| (default) | 0px | Celulares (360px - 767px) |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktops |

> Foco principal: **mobile (< 768px)**. Tablets e desktop ja funcionam razoavelmente.

---

## Diagnostico Atual

### O que ja funciona

| Componente | Status | Detalhes |
|---|---|---|
| Layout principal (App.tsx) | OK | Sidebar hidden + bottom nav no mobile |
| Bottom navigation | OK | `md:hidden`, z-50, 4 tabs + FAB |
| FAB (Novo Alerta) | OK | `fixed bottom-20 right-4 z-[60]` |
| LoginPage / RegisterPage | OK | `max-w-sm`, centrado, responsivo |
| KpiCards | OK | `grid-cols-2 md:grid-cols-4` |
| ChartsSection | OK | `grid-cols-1 md:grid-cols-2` |
| MapaPage | OK | `flex-col md:flex-row`, heights adaptados |
| Topbar | OK | Heights, fonts e padding responsivos |
| Modals (container) | OK | `p-4`, `max-w-lg`, scroll vertical |
| ZoneStatus | OK | `grid-cols-2 sm:grid-cols-4 md:grid-cols-8` |

### O que precisa de trabalho

| # | Componente | Problema | Severidade | Arquivo |
|---|---|---|---|---|
| R01 | IncidentTable | Tabela com scroll horizontal — ilegivel no mobile | **ALTA** | `src/components/IncidentTable.tsx` |
| R02 | RelatoriosPage | Tabela com scroll horizontal + padding fixo p-8 | **ALTA** | `src/pages/RelatoriosPage.tsx` |
| R03 | AdminPage (tabela) | Tabela de usuarios com scroll horizontal | **ALTA** | `src/pages/AdminPage.tsx` |
| R04 | ConfiguracoesPage | Grid `grid-cols-2` fixo (nao empilha no mobile) + padding fixo p-8 | **MEDIA** | `src/pages/ConfiguracoesPage.tsx` |
| R05 | AdminPage (header) | Header nao empilha — botao "Novo Usuario" fica inline | **MEDIA** | `src/pages/AdminPage.tsx` |
| R06 | RelatoriosPage (header) | Header nao empilha — botao "Exportar CSV" fica inline | **MEDIA** | `src/pages/RelatoriosPage.tsx` |
| R07 | IncidentTable (busca) | Input de busca `w-56` fixo — pode overflow | **MEDIA** | `src/components/IncidentTable.tsx` |
| R08 | NovoAlertaModal (form) | Grid `grid-cols-2` fixo no form (tipo + gravidade) | **BAIXA** | `src/components/NovoAlertaModal.tsx` |
| R09 | IncidentModal (body) | Grid `grid-cols-2` e `flex space-x-4` fixos | **BAIXA** | `src/components/IncidentModal.tsx` |
| R10 | IncidentModal (footer) | Footer com botoes inline — pode apertar no mobile | **BAIXA** | `src/components/IncidentModal.tsx` |
| R11 | Dashboard (filtros) | Botoes de filtro muito pequenos para toque (`text-[10px]`) | **BAIXA** | `src/App.tsx` |
| R12 | RelatoriosPage (filtros) | Filtros de gravidade/status apertados no mobile | **BAIXA** | `src/pages/RelatoriosPage.tsx` |

---

## Fases de Implementacao

### Fase 1 — Tabelas Responsivas (Maior Impacto)

**Objetivo:** Transformar tabelas em layouts de cards empilhados no mobile, mantendo tabela no desktop.

#### R01: IncidentTable (Dashboard)

**Antes:** `<table>` com `overflow-x-auto` — scroll horizontal no mobile.

**Depois:**
- Mobile (< md): Lista de cards empilhados, cada card mostra os dados do incident em layout vertical
- Desktop (>= md): Tabela original mantida

**Estrutura do card mobile:**
```
+------------------------------------------+
| BMB-0042              Em Andamento [badge]|
| Incendio Residencial                      |
| Asa Norte                                 |
| Critica [badge]         2026-03-12 · 14h  |
+------------------------------------------+
```

- Header do card: ID (bold) + status badge (direita)
- Body: tipo, bairro, gravidade badge + data
- Click no card abre IncidentModal (mesmo comportamento)
- Manter busca e contagem de registros
- Input de busca: `w-full md:w-56` (R07 resolvido junto)

**Arquivos:** `src/components/IncidentTable.tsx`

#### R02: RelatoriosPage (Tabela)

**Mesmo pattern do R01** — cards no mobile, tabela no desktop.

**Card mobile:**
```
+------------------------------------------+
| BMB-0042              Critica [badge]     |
| Incendio Residencial                      |
| Asa Norte            Em Andamento [badge] |
|                              [Ver] botao  |
+------------------------------------------+
```

**Arquivos:** `src/pages/RelatoriosPage.tsx`

#### R03: AdminPage (Tabela de Usuarios)

**Cards no mobile com layout adaptado:**

```
+------------------------------------------+
| Pedro Silva                 admin [badge] |
| pedro@bombeiros.gov.br         Ativo [ok] |
| Cap. Bombeiro                             |
|                    [Editar] [Desativar]   |
+------------------------------------------+
```

- Modo edicao inline no card: campos empilhados
- Botoes de acao no footer do card

**Arquivos:** `src/pages/AdminPage.tsx`

**Criterios de aceite (Fase 1):**
- [ ] Todas as 3 tabelas renderizam cards no mobile (< 768px)
- [ ] Tabelas mantidas no desktop (>= 768px)
- [ ] Cards sao tappable com tamanho minimo de toque (44x44px)
- [ ] Busca e filtros funcionam nos dois modos
- [ ] Scroll vertical suave na lista de cards
- [ ] Nenhuma regressao visual no desktop
- [ ] Build passa sem erros (`npm run build`)

---

### Fase 2 — Grids e Headers Responsivos

**Objetivo:** Corrigir layouts que nao empilham no mobile.

#### R04: ConfiguracoesPage

**Mudancas:**
- Padding: `p-8` → `p-4 md:p-8`
- Grid: `grid-cols-2` → `grid-cols-1 md:grid-cols-2`
- Header: empilhar titulo + botao "Salvar" no mobile
  - `flex items-center justify-between` → `flex flex-col md:flex-row items-start md:items-center gap-4`
  - Botao "Salvar": `w-full md:w-auto` no mobile

**Arquivo:** `src/pages/ConfiguracoesPage.tsx`

#### R05: AdminPage (Header)

**Mudancas:**
- Header: `flex items-center justify-between` → `flex flex-col md:flex-row items-start md:items-center gap-4`
- Botao "Novo Usuario": `w-full md:w-auto` no mobile
- Titulo: `text-xl md:text-2xl`

**Arquivo:** `src/pages/AdminPage.tsx`

#### R06: RelatoriosPage (Header)

**Mudancas:**
- Padding: `p-8` → `p-4 md:p-8`
- Header: empilhar titulo + botao "Exportar CSV"
  - `flex flex-col md:flex-row items-start md:items-center gap-4`
  - Botao: `w-full md:w-auto` no mobile

**Arquivo:** `src/pages/RelatoriosPage.tsx`

**Criterios de aceite (Fase 2):**
- [ ] ConfiguracoesPage: cards empilhados em 1 coluna no mobile
- [ ] Headers empilham verticalmente no mobile com botao full-width
- [ ] Paddings consistentes: `p-4 md:p-8` em todas as paginas
- [ ] Nenhuma regressao no desktop
- [ ] Build passa sem erros

---

### Fase 3 — Modais e Forms Responsivos

**Objetivo:** Adaptar forms e modais para uso confortavel em telas pequenas.

#### R08: NovoAlertaModal (Form Grid)

**Mudancas:**
- Grid tipo + gravidade: `grid-cols-2` → `grid-cols-1 md:grid-cols-2`
- LocationPicker: verificar se ja e responsivo (height adaptado)

**Arquivo:** `src/components/NovoAlertaModal.tsx`

#### R09: IncidentModal (Body Layout)

**Mudancas:**
- Grid tipo/bairro: `grid-cols-2` → `grid-cols-1 md:grid-cols-2`
- Flex gravidade/status/data: `flex space-x-4` → `flex flex-col md:flex-row gap-4` (remove `space-x-4`)
- Cada info box: `flex-1` → `flex-1 min-w-0` (evitar overflow)

**Arquivo:** `src/components/IncidentModal.tsx`

#### R10: IncidentModal (Footer)

**Mudancas:**
- Footer: `flex justify-between items-center` → `flex flex-col-reverse md:flex-row justify-between items-stretch md:items-center gap-2`
- Botoes: padding vertical maior no mobile para toque
- Botao "Fechar": full-width no mobile

**Arquivo:** `src/components/IncidentModal.tsx`

**Criterios de aceite (Fase 3):**
- [ ] NovoAlertaModal: campos empilhados no mobile
- [ ] IncidentModal: info boxes empilhados no mobile
- [ ] Footer de modais usavel com toque (botoes grandes)
- [ ] Scroll vertical dentro do modal quando conteudo excede viewport
- [ ] Build passa sem erros

---

### Fase 4 — Polish e Touch UX

**Objetivo:** Melhorar a experiencia de toque e consistencia geral.

#### R11: Dashboard Filtros

**Mudancas:**
- Botoes de filtro: tamanho minimo de toque (`min-h-[36px] px-3`)
- Label "Periodo/Tipo/etc": mover para cima do grupo no mobile (empilhar vertical)
- `flex items-center space-x-2` → `flex flex-col md:flex-row md:items-center gap-2`

**Arquivo:** `src/App.tsx` (linhas 224-312)

#### R12: RelatoriosPage Filtros

**Mesmo pattern do R11** — empilhar verticalmente no mobile.

**Mudancas:**
- Container de filtros: `flex flex-wrap gap-4` → `flex flex-col md:flex-row flex-wrap gap-4`
- Cada grupo de filtro: empilhado no mobile
- Input de busca: `min-w-[200px]` → `min-w-0 w-full md:min-w-[200px] md:w-auto`

**Arquivo:** `src/pages/RelatoriosPage.tsx`

#### Touch Targets (Global)

- Todos os botoes interativos: minimo `44px` de altura em mobile
- Links/badges clicaveis: area de toque adequada
- Espacamento entre elementos interativos: minimo `8px`

**Criterios de aceite (Fase 4):**
- [ ] Filtros empilhados e usaveis no mobile
- [ ] Touch targets >= 44px em todas as areas interativas
- [ ] Experiencia fluida em tela de 360px de largura
- [ ] Nenhuma regressao no desktop
- [ ] Build final: `npm run lint && npx tsc --noEmit -p api/tsconfig.json && npm run build`

---

## Regras de Implementacao

1. **Mobile-first** — escrever o CSS mobile primeiro, usar `md:` para desktop
2. **Tokens fire-*** — nunca cores raw (hex/rgb)
3. **Sem bibliotecas novas** — apenas Tailwind CSS v4 (ja instalado)
4. **Componentes existentes** — editar arquivos existentes, nao criar novos
5. **Pattern: hidden/block** — usar `hidden md:block` (desktop only) e `md:hidden` (mobile only) para alternar entre card e tabela
6. **Verificacao apos cada fase** — `npm run lint && npm run build`

---

## Hierarquia de Z-Index (referencia)

| Elemento | Z-Index | Notas |
|---|---|---|
| Bottom nav | `z-50` | `md:hidden` |
| FAB | `z-[60]` | `md:hidden` |
| Modais | `z-[70]` | Overlay `fixed inset-0` |
| Map overlay | `z-[1000]` | Badge no mapa |

---

## Progresso

| Fase | Status | Issues |
|---|---|---|
| Fase 1 — Tabelas Responsivas | Pendente | R01, R02, R03, R07 |
| Fase 2 — Grids e Headers | Pendente | R04, R05, R06 |
| Fase 3 — Modais e Forms | Pendente | R08, R09, R10 |
| Fase 4 — Polish e Touch UX | Pendente | R11, R12 |

---

## Arquivos Afetados (resumo)

| Arquivo | Fases | Mudancas |
|---|---|---|
| `src/components/IncidentTable.tsx` | 1 | Card layout mobile + busca responsiva |
| `src/pages/RelatoriosPage.tsx` | 1, 2, 4 | Card layout + header + padding + filtros |
| `src/pages/AdminPage.tsx` | 1, 2 | Card layout + header responsivo |
| `src/pages/ConfiguracoesPage.tsx` | 2 | Grid + header + padding |
| `src/components/NovoAlertaModal.tsx` | 3 | Form grid responsivo |
| `src/components/IncidentModal.tsx` | 3 | Body grid + footer responsivo |
| `src/App.tsx` | 4 | Filtros do dashboard |
