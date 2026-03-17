# Alteracoes Feitas — FireDash (Bombeiros)

**Data:** 2026-03-17
**Baseline:** Commit `004e5e7` — docs: atualizar README completo e adicionar relatorio de alteracoes
**Escopo:** 6 problemas de uso reportados por usuarios reais + refatoracao de codigo duplicado

---

## Indice

1. [Visao Geral](#1-visao-geral)
2. [Mapa — Filtro de Incidents Ativos](#2-mapa--filtro-de-incidents-ativos)
3. [Mapa — Remocao da Marca D'agua](#3-mapa--remocao-da-marca-dagua)
4. [Mapa — Cores Hex Corrigidas (Tokens fire-*)](#4-mapa--cores-hex-corrigidas-tokens-fire)
5. [Sistema de Notificacoes (Sino Funcional)](#5-sistema-de-notificacoes-sino-funcional)
6. [Status "Arquivado"](#6-status-arquivado)
7. [Responsividade Mobile](#7-responsividade-mobile)
8. [Refatoracao — Utility de Cores Compartilhado](#8-refatoracao--utility-de-cores-compartilhado)
9. [Banco de Dados](#9-banco-de-dados)
10. [Arquivos Modificados (lista completa)](#10-arquivos-modificados-lista-completa)
11. [Migrations Pendentes](#11-migrations-pendentes)
12. [Verificacao](#12-verificacao)

---

## 1. Visao Geral

Usuarios reais testaram o sistema e reportaram **6 problemas de uso**. Todas as correcoes foram implementadas em uma unica sessao:

| # | Problema Reportado | Solucao | Impacto |
|---|-------------------|---------|---------|
| 1 | Mapa nao atualiza quando status muda em Relatorios | Filtro exibe apenas incidents "Em Andamento" e "Pendente" | Mapa agora reflete mudancas em tempo real |
| 2 | Marca d'agua do tile provider visivel no mapa | Attribution removida via prop + CSS | Visual limpo |
| 3 | Sino de notificacao nao funcional (decorativo) | Sistema completo de alertas com backend + painel | Feature operacional |
| 4 | Sem forma de arquivar ocorrencias finalizadas | Novo status "Arquivado" end-to-end | Gestao de lifecycle |
| 5 | Responsividade quebrada em mobile | Correcoes em RelatoriosPage, IncidentModal, Dashboard | Usavel em 320px+ |
| 6 | Cores hex raw no MapaPage (violacao tokens fire-*) | Substituidas por `getComputedStyle()` com CSS vars | Tema light/dark funcional nos markers |

**Resumo quantitativo:**
- 11 arquivos modificados, 5 arquivos novos criados
- ~297 linhas em arquivos novos + ~154 linhas adicionadas em modificados
- ~91 linhas removidas (codigo duplicado eliminado)
- 1 nova tabela no banco (alerts)
- 4 novos endpoints na API
- 2 novos componentes React (NotificationPanel, statusColors utility)
- 1 novo service (alerts.ts)
- 1 migration SQL

---

## 2. Mapa — Filtro de Incidents Ativos

**Problema:** O mapa exibia TODAS as ocorrencias com coordenadas, incluindo finalizadas e canceladas. Quando o usuario mudava o status de um incident em Relatorios, o marker permanecia no mapa.

**Causa raiz:** O `useMemo` em `MapaPage.tsx` filtrava apenas por `latitude != null && longitude != null`, sem considerar o status.

**Correcao:** Filtro adicionado ANTES do `.map()` no useMemo:

```typescript
// ANTES
.filter((inc) => inc.latitude != null && inc.longitude != null)

// DEPOIS
const ACTIVE_STATUSES = ['Em Andamento', 'Pendente'];
.filter((inc) => inc.latitude != null && inc.longitude != null && ACTIVE_STATUSES.includes(inc.status))
```

**Consequencias:**
- Marker desaparece do mapa ao mudar status para "Finalizado", "Cancelada" ou "Arquivado" em Relatorios
- Badge de contagem no side panel reflete apenas incidents ativos
- Mensagem vazia atualizada: "Nenhum incidente ativo com coordenadas"

**Arquivo:** `src/pages/MapaPage.tsx` linhas 61-72

---

## 3. Mapa — Remocao da Marca D'agua

**Problema:** A marca d'agua do tile provider (OpenStreetMap/CARTO) ficava visivel no canto inferior direito do mapa, poluindo a interface.

**Correcao (3 pontos):**

1. **MapContainer:** Adicionado `attributionControl={false}` para nao renderizar o controle
2. **TileLayer:** Removida prop `attribution` (texto de atribuicao)
3. **CSS:** Regra de seguranca `.leaflet-control-attribution { display: none !important; }`

**Antes (index.css):**
```css
/* Dark theme */
.leaflet-control-attribution { background: rgba(15,12,12,0.8) !important; color: #9ca3af !important; }
.leaflet-control-attribution a { color: #9ca3af !important; }

/* Light theme */
html[data-theme="light"] .leaflet-control-attribution { background: rgba(241,241,243,0.9) !important; ... }
html[data-theme="light"] .leaflet-control-attribution a { color: #71717a !important; }
```

**Depois (index.css):**
```css
.leaflet-control-attribution { display: none !important; }
/* Attribution hidden via attributionControl={false} */
```

**Arquivos:** `src/pages/MapaPage.tsx` linhas 123-132, `src/index.css` linhas 73-77 e 108-109

---

## 4. Mapa — Cores Hex Corrigidas (Tokens fire-*)

**Problema:** A funcao `gravityColor()` em `MapaPage.tsx` usava cores hex hardcoded (`#e11d48`, `#f59e0b`, etc.) nos markers do Leaflet. Isso violava a regra de tokens `fire-*` e fazia com que os markers nao respondessem a troca de tema light/dark.

**Correcao:** Nova funcao `getFireColor()` que resolve CSS custom properties em runtime via `getComputedStyle`:

```typescript
// ANTES
function gravityColor(gravidade: string) {
  switch (gravidade) {
    case 'Critica': return '#e11d48';   // hex hardcoded
    case 'Alta':    return '#f59e0b';
    ...
  }
}

// DEPOIS
function getFireColor(varName: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

function gravityColor(gravidade: string) {
  switch (gravidade) {
    case 'Critica': return getFireColor('--color-fire-red', '#e11d48');
    case 'Alta':    return getFireColor('--color-fire-orange', '#f59e0b');
    case 'Media':   return getFireColor('--color-fire-yellow', '#eab308');
    case 'Baixa':   return getFireColor('--color-fire-green', '#10b981');
    default:        return getFireColor('--color-fire-muted', '#9ca3af');
  }
}
```

**Nota:** Fallbacks mantidos para o caso raro de `getComputedStyle` retornar vazio no primeiro render.

**Arquivo:** `src/pages/MapaPage.tsx` linhas 24-31

---

## 5. Sistema de Notificacoes (Sino Funcional)

**Problema:** O icone de sino no Topbar era puramente decorativo — sem handler, sem contagem, sem painel de alertas. Usuarios esperavam funcionalidade real de notificacoes.

**Solucao:** Sistema completo de alertas com 4 camadas:

### 5.1 Backend — Tabela `alerts`

Nova tabela no PostgreSQL:

```sql
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  incident_id VARCHAR(20) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL DEFAULT 'new_incident',
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed_by INTEGER REFERENCES users(id),
  dismissed_at TIMESTAMPTZ
);
```

Indexes: `idx_alerts_status`, `idx_alerts_incident`, `idx_alerts_created`
Constraint: `status IN ('active', 'dismissed')`

**Arquivo:** `api/migrations/003_alerts_and_status.sql`

### 5.2 Backend — 4 Endpoints

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| GET | `/api/alerts` | Listar alertas ativos com JOIN em incidents | Todos os roles |
| GET | `/api/alerts/count` | Contar alertas ativos | Todos os roles |
| PATCH | `/api/alerts/:id/dismiss` | Dispensar alerta individual | admin, operador |
| PATCH | `/api/alerts/dismiss-all` | Dispensar todos os ativos | admin, operador |

Todas as rotas usam:
- Queries parametrizadas (`$1, $2...`)
- Envelope padrao `{ success: true/false, data/error }`
- Error handling com `err: unknown` e narrowing
- authMiddleware + requireRole onde necessario
- Mensagens server-generated (sem XSS)

**Arquivo:** `api/routes/alerts.ts` (94 linhas)

### 5.3 Backend — Auto-criar alerta ao criar incident

No `POST /api/incidents`, apos o INSERT do incident, um alerta e criado automaticamente:

```typescript
try {
  await pool.query(
    `INSERT INTO alerts (incident_id, type, message) VALUES ($1, 'new_incident', $2)`,
    [id, `Nova ocorrencia: ${tipo} em ${bairro} (${gravidade})`]
  );
} catch (alertErr: unknown) {
  console.error('Erro ao criar alerta automatico:', alertErr);
}
```

**Importante:** A criacao do alerta e non-blocking — se falhar, o incident ja foi criado com sucesso.

**Arquivo:** `api/routes/incidents.ts` linhas 125-133

### 5.4 Frontend — Service de alertas

```typescript
export async function fetchAlerts(): Promise<ApiAlert[]>
export async function fetchAlertCount(): Promise<number>
export async function dismissAlert(id: number): Promise<void>
export async function dismissAllAlerts(): Promise<void>
```

Usa `apiFetch` que ja injeta token JWT e faz unwrap automatico do envelope.

**Arquivo:** `src/services/alerts.ts` (30 linhas)

### 5.5 Frontend — NotificationPanel

Novo componente dropdown de notificacoes:

| Feature | Implementacao |
|---------|--------------|
| Lista de alertas | Cada item mostra mensagem, bairro, severidade (dot colorido), tempo relativo |
| Dismiss individual | Botao X em cada alerta (hover reveal) |
| Dismiss all | Botao "Dispensar Todos" no footer |
| Empty state | Icone BellOff + "Nenhuma notificacao pendente" |
| Click outside | Fecha o painel via `useEffect` + event listener |
| Z-index | `z-[80]` (acima dos modais z-[70]) |
| Mobile | `fixed inset-x-0 top-16` (full-width) |
| Desktop | `absolute right-0 top-full w-80` |
| Scroll | `max-h-[60vh] overflow-y-auto` |
| Tokens | `fire-*` exclusivamente, zero cores raw |

**Arquivo:** `src/components/NotificationPanel.tsx` (117 linhas)

### 5.6 Frontend — Topbar atualizado

Sino agora tem:

- **Badge dinamica** com contagem de alertas ativos (oculta quando 0)
- **Format:** Numero direto ate 99, depois "99+"
- **onClick** abre/fecha o NotificationPanel
- **Slot** `notificationPanel` para renderizar o painel como child

**Antes:**
```tsx
<button className="relative p-2 text-fire-muted hover:text-white transition-colors">
  <Bell className="h-5 w-5 md:h-6 md:w-6" />
  <span className="absolute top-2 right-2 w-2 h-2 bg-fire-red rounded-full border-2 border-fire-dark"></span>
</button>
```

**Depois:**
```tsx
<div className="relative">
  <button onClick={onBellClick} className="relative p-2 ...">
    <Bell className="h-5 w-5 md:h-6 md:w-6" />
    {alertCount > 0 && (
      <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-fire-red rounded-full ...">
        <span className="text-[9px] font-black text-white">{alertCount > 99 ? '99+' : alertCount}</span>
      </span>
    )}
  </button>
  {notificationPanel}
</div>
```

**Arquivo:** `src/components/Topbar.tsx`

### 5.7 Frontend — Wiring no App.tsx

Estado e handlers adicionados em `AuthenticatedApp`:

| State | Tipo | Proposito |
|-------|------|-----------|
| `alertsData` | `ApiAlert[]` | Lista de alertas para o painel |
| `alertCount` | `number` | Contagem para badge |
| `notifOpen` | `boolean` | Painel aberto/fechado |

| Handler | Descricao |
|---------|-----------|
| `handleBellClick` | Abre painel e carrega alertas via API |
| `handleDismissAlert(id)` | Dispensa alerta + atualiza state local |
| `handleDismissAll` | Dispensa todos + fecha painel |
| `handleIncidentCreated` | Incrementa `alertCount` (alerta criado no backend) |

`loadData` agora carrega `alertCount` em paralelo com incidents e KPIs.

**Arquivo:** `src/App.tsx`

---

## 6. Status "Arquivado"

**Problema:** Nao havia forma de "limpar" ocorrencias finalizadas da listagem. Elas permaneciam misturadas com incidents ativos, poluindo o dashboard e os relatorios.

**Solucao:** Novo status "Arquivado" implementado end-to-end:

### 6.1 Backend

- `VALID_STATUSES` em `api/utils/validation.ts`: adicionado `'Cancelada'` e `'Arquivado'`
- Migration `003_alerts_and_status.sql`: constraint `check_status` atualizada com os 5 status
- `isValidStatus()` ja deriva do array — sem mudanca adicional necessaria

### 6.2 Frontend — Filtros

| Local | Antes | Depois |
|-------|-------|--------|
| Dashboard (App.tsx) | `['Todos', 'Em Andamento', 'Finalizado', 'Cancelada']` | + `'Arquivado'` |
| RelatoriosPage | `['Todos', 'Em Andamento', 'Finalizado', 'Cancelada']` | + `'Arquivado'` |
| IncidentModal (editar) | `['Em Andamento', 'Finalizado', 'Cancelada']` | + `'Arquivado'` |

### 6.3 Frontend — Botao "Arquivar"

No footer do `IncidentModal`, quando o incident tem status "Finalizado" e o usuario pode editar (admin/operador), aparece um botao dedicado:

```tsx
{canEdit && !editing && !confirmDelete && incident.status === 'Finalizado' && (
  <button onClick={handleArchive} className="... text-fire-muted hover:bg-fire-muted/10 border border-fire-muted/30 ...">
    <Archive className="w-4 h-4" />
    <span>Arquivar</span>
  </button>
)}
```

Ao clicar, chama `onUpdate(id, { status: 'Arquivado' })` e fecha o modal.

### 6.4 Cor do Status "Arquivado"

Em todos os componentes: `'text-fire-muted bg-fire-muted/20'` — visual cinza apagado indicando inatividade.

**Arquivos:** `api/utils/validation.ts`, `src/components/IncidentModal.tsx`, `src/pages/RelatoriosPage.tsx`, `src/App.tsx`

---

## 7. Responsividade Mobile

**Problema:** Varias paginas quebravam ou ficavam inutilizaveis em telas pequenas (320px-768px).

### 7.1 RelatoriosPage

| Propriedade | Antes | Depois |
|-------------|-------|--------|
| Padding | `p-8` | `p-4 md:p-8` |
| Header | `flex items-center justify-between` | `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` |
| Campo de busca | `min-w-[200px]` | `min-w-0 w-full sm:min-w-[200px] sm:w-auto` |
| Botoes de status | `flex gap-2` | `flex gap-2 flex-wrap` |

### 7.2 IncidentModal

| Propriedade | Antes | Depois |
|-------------|-------|--------|
| Grid tipo/bairro | `grid-cols-2` | `grid-cols-1 sm:grid-cols-2` |
| Info section (gravidade/status/data) | `flex space-x-4` | `flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0` |
| Footer | `flex justify-between` | `flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center` |

### 7.3 Dashboard Filter Bar (App.tsx)

| Propriedade | Antes | Depois |
|-------------|-------|--------|
| Botoes de status | `flex gap-1` | `flex gap-1 flex-wrap` |

### 7.4 NotificationPanel

| Propriedade | Mobile | Desktop |
|-------------|--------|---------|
| Posicao | `fixed inset-x-0 top-16 mx-auto` | `absolute right-0 top-full mt-2 w-80` |
| Scroll | `max-h-[60vh] overflow-y-auto` | Idem |

**Arquivos:** `src/pages/RelatoriosPage.tsx`, `src/components/IncidentModal.tsx`, `src/App.tsx`, `src/components/NotificationPanel.tsx`

---

## 8. Refatoracao — Utility de Cores Compartilhado

**Problema:** As funcoes `getStatusColor()` e `getSeverityColor()` estavam duplicadas em 3 arquivos:
- `src/components/IncidentModal.tsx`
- `src/components/IncidentTable.tsx`
- `src/pages/RelatoriosPage.tsx`

Cada copia era ligeiramente diferente (IncidentModal tinha versao com `border-*`, outros nao).

**Solucao:** Novo utility centralizado `src/utils/statusColors.ts` com 3 funcoes:

```typescript
export function getStatusColor(status: string): string
// Retorna: 'text-fire-{cor} bg-fire-{cor}/20'
// Cobre: Em Andamento, Finalizado, Cancelada, Pendente, Arquivado

export function getSeverityColor(gravidade: string): string
// Retorna: 'text-fire-{cor} bg-fire-{cor}/20'
// Cobre: Critica, Alta, Media, Baixa

export function getSeverityColorWithBorder(gravidade: string): string
// Retorna: 'text-fire-{cor} bg-fire-{cor}/20 border-fire-{cor}'
// Usado apenas no IncidentModal header
```

**Mudancas nos consumidores:**
- `IncidentTable.tsx`: removidas funcoes locais, importa de `../utils/statusColors`
- `RelatoriosPage.tsx`: removidas funcoes locais, importa de `../utils/statusColors`
- `IncidentModal.tsx`: removidas funcoes locais, importa `getStatusColor` e `getSeverityColorWithBorder`

**Resultado:** ~35 linhas de codigo duplicado removidas, unica fonte de verdade para cores.

**Arquivo:** `src/utils/statusColors.ts` (30 linhas)

---

## 9. Banco de Dados

### 9.1 Migration 003 — Alerts e Status

Script SQL idempotente com:

**Nova tabela `alerts`:**
- 8 colunas: id, incident_id, type, message, status, created_at, dismissed_by, dismissed_at
- FK para `incidents(id)` com `ON DELETE CASCADE`
- FK para `users(id)` no `dismissed_by`
- 3 indexes para performance
- CHECK constraint no status

**Constraint de status atualizada:**
```sql
ALTER TABLE incidents DROP CONSTRAINT IF EXISTS check_status;
ALTER TABLE incidents ADD CONSTRAINT check_status
  CHECK (status IN ('Em Andamento', 'Finalizado', 'Pendente', 'Cancelada', 'Arquivado'));
```

**Nota:** O `DROP CONSTRAINT IF EXISTS` garante idempotencia — pode ser executado multiplas vezes sem erro.

**Arquivo:** `api/migrations/003_alerts_and_status.sql` (26 linhas)

### 9.2 VALID_STATUSES Atualizado

```typescript
// ANTES
export const VALID_STATUSES = ['Em Andamento', 'Finalizado', 'Pendente'] as const;

// DEPOIS
export const VALID_STATUSES = ['Em Andamento', 'Finalizado', 'Pendente', 'Cancelada', 'Arquivado'] as const;
```

O type `Status` e a funcao `isValidStatus()` derivam automaticamente do array — sem mudanca adicional.

**Arquivo:** `api/utils/validation.ts` linha 2

---

## 10. Arquivos Modificados (lista completa)

### Backend (API)

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `api/utils/validation.ts` | Modificado | + 'Cancelada' e 'Arquivado' em VALID_STATUSES |
| `api/index.ts` | Modificado | + import e registro da rota de alertas |
| `api/routes/incidents.ts` | Modificado | + auto-criar alerta ao criar incident |
| `api/routes/alerts.ts` | **NOVO** | 4 endpoints: listar, contar, dispensar, dispensar todos (94 linhas) |
| `api/migrations/003_alerts_and_status.sql` | **NOVO** | Tabela alerts + constraint status (26 linhas) |

### Frontend — Novos

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `src/components/NotificationPanel.tsx` | **NOVO** | Painel dropdown de notificacoes (117 linhas) |
| `src/services/alerts.ts` | **NOVO** | Service layer para alertas (30 linhas) |
| `src/utils/statusColors.ts` | **NOVO** | Utility compartilhado de cores status/gravidade (30 linhas) |

### Frontend — Modificados

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `src/App.tsx` | Modificado | + alertas state/handlers, NotificationPanel, Topbar props, 'Arquivado' no filtro, flex-wrap |
| `src/components/Topbar.tsx` | Modificado | + alertCount, onBellClick, notificationPanel props; badge dinamica |
| `src/components/IncidentModal.tsx` | Modificado | + 'Arquivado' em STATUS_OPTIONS, botao Arquivar, imports centralizados, responsividade |
| `src/components/IncidentTable.tsx` | Modificado | - funcoes duplicadas locais, + import de statusColors utility |
| `src/pages/MapaPage.tsx` | Modificado | + filtro ativos, - attribution, + getFireColor com CSS vars |
| `src/pages/RelatoriosPage.tsx` | Modificado | - funcoes duplicadas locais, + import statusColors, + 'Arquivado', responsividade |
| `src/index.css` | Modificado | - attribution styles (dark + light), + display:none attribution |

### Totais

| Metrica | Valor |
|---------|-------|
| Arquivos novos | 5 |
| Arquivos modificados | 11 |
| Linhas adicionadas (novos) | ~297 |
| Linhas adicionadas (modificados) | ~154 |
| Linhas removidas | ~91 |
| Novos endpoints API | 4 |
| Nova tabela DB | 1 (alerts) |
| Novos componentes React | 1 (NotificationPanel) |
| Novos services | 1 (alerts.ts) |
| Novos utilities | 1 (statusColors.ts) |

---

## 11. Migrations Pendentes

Antes de fazer deploy dessas alteracoes, executar na VPS:

```bash
# 1. Backup do banco
pg_dump -U bombeiros_app -d bombeiros > backup_pre_migration_20260317.sql

# 2. Aplicar migration 003 (alerts + status constraint)
psql -U bombeiros_app -d bombeiros -f api/migrations/003_alerts_and_status.sql

# 3. Verificar
psql -U bombeiros_app -d bombeiros -c "\d alerts"
psql -U bombeiros_app -d bombeiros -c "SELECT conname FROM pg_constraint WHERE conrelid = 'incidents'::regclass AND conname = 'check_status';"
```

**Nota:** Se ja existirem incidents com status 'Cancelada' no banco, a migration funcionara normalmente (o DROP + ADD da constraint e idempotente).

---

## 12. Verificacao

Todos os checks passaram antes da finalizacao:

```
npm run lint                          → OK (tsc --noEmit frontend)
npx tsc --noEmit -p api/tsconfig.json → OK (tsc --noEmit backend)
npm run build                         → OK (vite build, 8.28s)
console.log audit                     → 0 ocorrencias no frontend
```

### Checklist de Teste Manual

- [ ] Mapa mostra apenas incidents "Em Andamento" e "Pendente"
- [ ] Mudar status em Relatorios faz marker sumir do mapa
- [ ] Attribution/marca d'agua nao visivel no mapa
- [ ] Sino mostra badge com contagem de alertas ativos
- [ ] Clicar no sino abre painel de notificacoes
- [ ] Dispensar alerta remove do painel e decrementa badge
- [ ] Criar incident auto-cria alerta (badge incrementa)
- [ ] "Arquivado" aparece em todos os filtros de status
- [ ] Botao "Arquivar" aparece apenas em incidents "Finalizado"
- [ ] Cores dos markers respeitam tema (light/dark)
- [ ] RelatoriosPage rende OK em 320px
- [ ] IncidentModal rende OK em 320px
- [ ] Dashboard filter bar nao transborda em mobile
- [ ] NotificationPanel: full-width em mobile, w-80 em desktop
- [ ] Sem cores hex raw no MapaPage

### Hierarquia de Z-index (atualizada)

| Camada | Z-Index | Componente |
|--------|---------|------------|
| Bottom nav (mobile) | `z-50` | `<nav>` em App.tsx |
| FAB mobile | `z-[60]` | Botao "Novo Alerta" |
| Modais | `z-[70]` | NovoAlertaModal, IncidentModal |
| NotificationPanel | `z-[80]` | Painel de alertas |
| Leaflet overlays | `z-[1000]` | Map badge overlay |
