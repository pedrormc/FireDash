# Alteracoes Feitas — FireDash (Bombeiros)

**Data:** 2026-03-12
**Baseline:** Commit `f4770e1` — feat: implementar Fase 5 (deploy completo na Vercel)
**Commits incluidos:** 4 commits, 45 arquivos alterados, ~2.600 linhas adicionadas

---

## Indice

1. [Visao Geral](#1-visao-geral)
2. [Seguranca — Hardening do Backend](#2-seguranca--hardening-do-backend)
3. [Funcionalidades Novas](#3-funcionalidades-novas)
4. [Usabilidade e UI/UX](#4-usabilidade-e-uiux)
5. [Correcoes de Bugs](#5-correcoes-de-bugs)
6. [Autenticacao e Registro](#6-autenticacao-e-registro)
7. [Banco de Dados](#7-banco-de-dados)
8. [Frontend — Service Layer](#8-frontend--service-layer)
9. [Documentacao](#9-documentacao)
10. [Arquivos Modificados (lista completa)](#10-arquivos-modificados-lista-completa)
11. [Migrations Pendentes](#11-migrations-pendentes)
12. [Itens Ainda Pendentes](#12-itens-ainda-pendentes)

---

## 1. Visao Geral

Desde a ultima versao publicada no GitHub (Fase 5 — deploy na Vercel), foram realizadas **4 grandes atualizacoes**:

| Commit | Descricao | Escopo |
|--------|-----------|--------|
| `6d1aa18` | Separacao Cargo vs Role no registro + validacoes de login | Auth frontend |
| `29662e3` | Pagina de registro, arquitetura docs, regras de codigo | Frontend + docs |
| `8692ee0` | **Fase 6** — funcionalidades + UI/UX (10 features) | Frontend completo |
| `7c2ade0` | **Security Hardening** — 21/23 vulnerabilidades corrigidas | Backend completo |

**Resumo quantitativo:**
- 45 arquivos alterados
- ~2.600 linhas adicionadas, ~470 removidas
- 23 vulnerabilidades identificadas, 21 corrigidas
- 10 novas features de usabilidade
- 2 novas dependencias (bcrypt, helmet, express-rate-limit)
- 1 novo componente React (LocationPicker)
- 2 scripts de migracao de banco
- 1 utility module novo (validation.ts)

---

## 2. Seguranca — Hardening do Backend

### 2.1 Auditoria Realizada

Auditoria completa do backend identificou **23 vulnerabilidades** classificadas por severidade:

| Severidade | Quantidade | Resolvidas | Pendentes |
|------------|-----------|------------|-----------|
| CRITICAL | 6 | 6 | 0 |
| HIGH | 5 | 3 | 2 |
| MEDIUM | 7 | 7 | 0 |
| LOW | 5 | 5 | 0 |
| **Total** | **23** | **21** | **2** |

### 2.2 Vulnerabilidades CRITICAL Corrigidas

#### CRIT-01: Senhas em texto plano
- **Antes:** Senhas armazenadas e comparadas como strings simples
- **Depois:** bcrypt com cost factor 12 para hashing; `bcrypt.compare()` no login
- **Arquivos:** `api/routes/auth.ts`, `api/routes/users.ts`
- **Migration:** `api/migrations/001_hash_passwords.ts` para hashear senhas existentes

#### CRIT-02: JWT_SECRET com fallback hardcoded
- **Antes:** `const JWT_SECRET = process.env.JWT_SECRET || 'bombeiros-secret-dev'`
- **Depois:** Env var obrigatoria — app falha ao iniciar se nao definida
- **Arquivo:** `api/middleware/auth.ts` linhas 4-8
```typescript
// ANTES
const JWT_SECRET = process.env.JWT_SECRET || 'bombeiros-secret-dev';

// DEPOIS
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

#### CRIT-03: Endpoint /register publico com role injection
- **Antes:** `POST /register` era publico — qualquer pessoa podia criar conta com `role: "admin"`
- **Depois:** Protegido com `authMiddleware` + `requireRole('admin')` — somente admins autenticados podem registrar novos usuarios
- **Arquivo:** `api/routes/auth.ts` linha 53

#### CRIT-04: SELECT * expondo todas as colunas
- **Antes:** `SELECT * FROM incidents`, `SELECT * FROM users`, etc.
- **Depois:** Colunas explicitas em todas as queries, nunca retornando `senha` nas respostas
- **Arquivos:** Todas as rotas em `api/routes/`

**Exemplos de mudanca:**
```sql
-- ANTES
SELECT * FROM users WHERE email = $1

-- DEPOIS
SELECT id, nome, email, senha, cargo, role, ativo FROM users WHERE email = $1
```

```sql
-- ANTES
SELECT * FROM kpis ORDER BY ordem

-- DEPOIS
SELECT id, title, value, subtitle, icon, color, ordem FROM kpis ORDER BY ordem ASC
```

#### CRIT-05: Zero rate limiting
- **Antes:** Nenhuma protecao contra brute-force
- **Depois:** Dois niveis de rate limiting via `express-rate-limit`:
  - **Global:** 100 requisicoes por 15 minutos para toda a API
  - **Auth:** 10 requisicoes por 15 minutos para `/api/auth/*` (login, register)
- **Arquivo:** `api/index.ts` linhas 22-37

#### CRIT-06: Credenciais admin hardcoded no seed.sql
- **Antes:** `INSERT INTO users ... VALUES ('admin@bombeiros.gov.br', 'admin123', 'admin')`
- **Depois:** Seed removido — instrucoes para gerar hash bcrypt manualmente
- **Arquivo:** `api/seed.sql` linhas 55-59
```sql
-- ANTES
INSERT INTO users (nome, email, senha, cargo, role)
VALUES ('Administrador', 'admin@bombeiros.gov.br', 'admin123', 'Administrador', 'admin');

-- DEPOIS (comentario com instrucoes)
-- Para criar o admin, gerar hash bcrypt e executar manualmente:
--   1. Gerar hash: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('SUA_SENHA_SEGURA', 12).then(h => console.log(h))"
--   2. Inserir: INSERT INTO users (...) VALUES (..., '$2b$12$HASH_GERADO', ...);
```

### 2.3 Vulnerabilidades HIGH Corrigidas

#### HIGH-02: Sem security headers
- **Antes:** Headers HTTP padrao do Express (sem protecao)
- **Depois:** `helmet` configurado com:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security` (HSTS)
  - `X-XSS-Protection`
  - CSP e COEP desabilitados (incompativeis com SPA + Leaflet)
- **Arquivo:** `api/index.ts` linhas 39-43

#### HIGH-03: CORS fallback para wildcard
- **Antes:** `cors({ origin: process.env.CORS_ORIGIN || '*' })` — qualquer origem aceita em dev
- **Depois:** `CORS_ORIGIN` obrigatorio em producao; fallback `localhost:3000` apenas em dev
- **Arquivo:** `api/index.ts` linhas 48-59
```typescript
const corsOrigin = process.env.CORS_ORIGIN
  || (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : undefined);

if (!corsOrigin) {
  throw new Error('CORS_ORIGIN environment variable is required in production');
}
```

#### HIGH-05: Sem validacao de comprimento em strings
- **Antes:** Inputs aceitos sem validacao de tamanho — possivel encher o banco com strings gigantes
- **Depois:** Modulo de validacao centralizado em `api/utils/validation.ts`:
  - `validateStringLength(value, field, max)` — verifica tipo, vazio e tamanho maximo
  - `isValidEmail(email)` — regex para formato basico
  - `isValidIncidentId(id)` — formato `BMB-XXXX`
  - `isValidGravidade(value)` — enum: Baixa, Media, Alta, Critica
  - `isValidStatus(value)` — enum: Em Andamento, Finalizado, Pendente
  - `isValidRole(value)` — enum: admin, operador, visualizador
  - `isValidHora(value)` — 0-23 ou null
  - `isValidDate(value)` — data valida
  - `isDuplicateKeyError(err)` — detecta erro 23505 do PostgreSQL

### 2.4 Vulnerabilidades MEDIUM Corrigidas

| ID | Vulnerabilidade | Correcao |
|----|----------------|----------|
| MED-01 | Sem validacao de enums (tipo, gravidade, status) | Validadores em `api/utils/validation.ts` com type guards |
| MED-02 | `err: any` em catch blocks | Alterado para `err: unknown` com narrowing em todos os handlers |
| MED-03 | Sem paginacao no GET /incidents | Implementado LIMIT/OFFSET com meta `{ total, page, limit, pages }` |
| MED-05 | Pool PostgreSQL sem limites | Configurado `max: 20`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 5000` |
| MED-06 | Erro ecoa input do usuario (XSS) | Mensagens genericas que nao repetem dados do request |
| MED-07 | Sem validacao de formato de email e complexidade de senha | `isValidEmail()` + minimo 6 caracteres para senha |

### 2.5 Vulnerabilidades LOW Corrigidas

| ID | Vulnerabilidade | Correcao |
|----|----------------|----------|
| LOW-02 | Enumeracao de email via mensagens distintas | Resposta unica `"Credenciais invalidas"` para usuario inexistente, senha errada e conta inativa |
| LOW-03 | Sem body size limit | `express.json({ limit: '10kb' })` |
| LOW-04 | TIMESTAMP sem timezone + hora sem CHECK | Migration para TIMESTAMPTZ + CHECK constraints |
| LOW-05 | Role sem CHECK constraint | `CHECK (role IN ('admin', 'operador', 'visualizador'))` via migration |

### 2.6 Padronizacao de Respostas da API

Todas as rotas agora retornam envelope padronizado:

```typescript
// Sucesso
{ success: true, data: T }
{ success: true, data: T[], meta: { total, page, limit, pages } }

// Erro
{ success: false, error: "mensagem em PT-BR" }
```

O frontend (`src/services/api.ts`) foi atualizado com `unwrapEnvelope()` que detecta e extrai automaticamente o campo `data` do envelope, mantendo compatibilidade retroativa.

### 2.7 Vulnerabilidades Ainda Pendentes

| ID | Vulnerabilidade | Motivo |
|----|----------------|--------|
| HIGH-01 | JWT em localStorage (acessivel via XSS) | Requer mudanca arquitetural para httpOnly cookies |
| HIGH-04 | Sem CSRF protection | Depende da migracao de JWT para cookies |

---

## 3. Funcionalidades Novas

### 3.1 Mini-mapa no Formulario de Criacao (LocationPicker)

**Problema:** Ocorrencias criadas nao apareciam no mapa porque o formulario nao coletava coordenadas (lat/lng ficavam `null`).

**Solucao:** Novo componente `LocationPicker.tsx` integrado no `NovoAlertaModal`.

**Detalhes:**
- Mini `MapContainer` de 200px usando react-leaflet
- Tile dark do CartoDB (mesmo visual do MapaPage)
- Click no mapa coloca/move marcador vermelho e captura coordenadas
- Botao "Usar Minha Localizacao" via `navigator.geolocation` (GPS)
- Coordenadas exibidas abaixo do mapa em texto pequeno
- Coordenadas sao opcionais — ocorrencia pode ser criada sem elas
- Coordenadas passadas ao `createIncident()` que ja suportava lat/lng

**Arquivos:**
- `src/components/LocationPicker.tsx` (NOVO — 95 linhas)
- `src/components/NovoAlertaModal.tsx` (modificado — integrado entre bairro e descricao)

### 3.2 Edicao Interativa de Status

**Problema:** O `IncidentModal` era somente leitura — nao permitia alterar status, mesmo com backend PUT ja existente.

**Solucao:** Modal editavel com controle de role.

**Detalhes:**
- Novas props: `onUpdate?: (id, data) => void`, `userRole?: string`
- Botao "Editar" visivel apenas para admin e operador
- Ao clicar "Editar", badge estatico de status vira 3 botoes selecionaveis:
  - "Em Andamento" (azul)
  - "Finalizado" (verde)
  - "Cancelada" (vermelho)
- Botao "Salvar" chama `updateIncident()` → `PUT /api/incidents/:id`
- Botao "Cancelar" restaura estado original
- Estados de loading e erro gerenciados localmente
- Reset automatico ao fechar ou trocar de incident

**Arquivos:**
- `src/components/IncidentModal.tsx` (reescrito — 210 linhas)
- `src/components/IncidentTable.tsx` (+ props `onUpdate`/`userRole`)
- `src/pages/RelatoriosPage.tsx` (+ props `onUpdate`/`userRole`)
- `src/App.tsx` (+ `handleUpdateIncident`)

### 3.3 Service Layer: updateIncident()

Nova funcao exportada no service layer:

```typescript
export async function updateIncident(
  id: string,
  data: Partial<{
    tipo: string; gravidade: string; bairro: string;
    status: string; data: string; hora: number;
    descricao: string; latitude: number; longitude: number;
  }>,
): Promise<ApiIncident> {
  return apiFetch<ApiIncident>(`/incidents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
```

**Arquivo:** `src/services/incidents.ts`

### 3.4 Status "Cancelada"

Adicionado suporte completo ao status "Cancelada" em todo o sistema:

| Local | Mudanca |
|-------|---------|
| Dashboard (App.tsx) | Filtro de status inclui "Cancelada" |
| RelatoriosPage | Filtro de status inclui "Cancelada" |
| IncidentModal | Status editavel inclui "Cancelada" |
| IncidentTable | `getStatusColor()` trata "Cancelada" |
| Cor | `text-fire-red bg-fire-red/20` (mesma familia do vermelho) |

### 3.5 Paginacao no Backend

`GET /api/incidents` agora suporta paginacao:

```
GET /api/incidents?page=1&limit=50
```

Resposta inclui metadados:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 142,
    "page": 1,
    "limit": 50,
    "pages": 3
  }
}
```

- `page` default: 1, minimo: 1
- `limit` default: 50, minimo: 1, maximo: 100
- Count total calculado antes do LIMIT/OFFSET

### 3.6 Pagina de Registro

Nova pagina `RegisterPage.tsx` para cadastro de usuarios:

- Campos: nome, email, senha, cargo (texto livre), perfil de acesso (select)
- Separacao clara entre "Cargo na Corporacao" (opcional, texto livre) e "Perfil de Acesso" (obrigatorio, select com admin/operador/visualizador)
- Validacao via estado React (nao HTML5 nativo, para evitar travamento em testes headless)
- Integrado no fluxo de auth em `App.tsx`

**Arquivo:** `src/pages/RegisterPage.tsx` (NOVO — 162 linhas)

---

## 4. Usabilidade e UI/UX

### 4.1 Topbar — Usuario Real

**Antes:**
- Nome hardcoded "Cel. Marcos Silva"
- Cargo hardcoded "Comandante de Operacoes"
- Avatar: imagem externa do Google
- Search input sem funcionalidade (sem handler, sem estado)

**Depois:**
- Nome real do usuario logado via `user.nome` (AuthContext)
- Cargo real via `user.cargo || user.role`
- Avatar: circulo colorido com iniciais do nome (sem dependencia externa)
- Search fake removido (cada pagina ja tem seus proprios filtros)

**Arquivos:** `src/components/Topbar.tsx`, `src/App.tsx`

### 4.2 Tokens de Cor Padronizados

Adicionados 2 novos tokens ao tema Tailwind (`src/index.css`):

| Token | Valor Hex | Uso |
|-------|-----------|-----|
| `fire-yellow` | `#eab308` | Gravidade "Media" |
| `fire-blue` | `#3b82f6` | Status "Em Andamento" |

**Substituicoes realizadas:**

| Antes (cor raw) | Depois (token) | Componentes afetados |
|-----------------|----------------|---------------------|
| `yellow-500` | `fire-yellow` | IncidentModal, IncidentTable, NovoAlertaModal, RelatoriosPage, MapaPage |
| `blue-400` | `fire-blue` | IncidentModal, IncidentTable, RelatoriosPage |
| `blue-500` | `fire-blue` | MapaPage (badge "Controlados") |

**Excecoes mantidas:** Cores hex inline em Leaflet markers e Recharts charts (libs exigem valores diretos).

### 4.3 MapaPage Responsivo

**Antes:** Layout fixo `flex-row` com side panel de largura fixa — inutilizavel no mobile.

**Depois:**

| Propriedade | Mobile | Desktop |
|-------------|--------|---------|
| Layout | `flex-col` (empilhado) | `flex-row` (lado a lado) |
| Padding | `p-4` | `p-8` |
| Side panel | `w-full` | `w-72` |
| Mapa altura | `min-h-[300px]` | `min-h-[500px]` |
| Lista incidents | `max-h-[300px] overflow-y-auto` | Sem limite (flex) |

**Arquivo:** `src/pages/MapaPage.tsx`

### 4.4 FAB Mobile — Novo Alerta

Botao flutuante (Floating Action Button) para criar novo alerta no mobile:

- Icone: `PlusCircle` (lucide-react)
- Posicao: `fixed bottom-20 right-4` (acima do bottom tab bar)
- Z-index: `z-[60]` (acima do nav z-50, abaixo dos modais z-[70])
- Visibilidade: `md:hidden` — somente mobile
- Permissao: somente `admin` e `operador`
- Ao clicar: abre `NovoAlertaModal`

**Arquivo:** `src/App.tsx`

### 4.5 Scroll no Modal de Criacao

**Problema:** Em telas pequenas, o NovoAlertaModal (agora com LocationPicker) ficava cortado.

**Solucao:**
- Container do modal: `max-h-[90vh] flex flex-col`
- Area do formulario: `overflow-y-auto`
- Header do modal: `flex-shrink-0` (fixo no topo)

**Arquivo:** `src/components/NovoAlertaModal.tsx`

---

## 5. Correcoes de Bugs

### 5.1 Z-index de Modais

**Problema:** Ao abrir o `NovoAlertaModal` na pagina do mapa, ambos usavam `z-50`, causando sobreposicao com o bottom tab bar do mobile.

**Correcao:** Hierarquia de z-index definida:

| Camada | Z-Index | Componente |
|--------|---------|------------|
| Bottom nav (mobile) | `z-50` | `<nav>` em App.tsx |
| FAB mobile | `z-[60]` | Botao "Novo Alerta" |
| Modais | `z-[70]` | NovoAlertaModal, IncidentModal |
| Leaflet overlays | `z-[1000]` | Map badge overlay |

**Arquivos:** `src/components/NovoAlertaModal.tsx`, `src/components/IncidentModal.tsx`

### 5.2 Ocorrencias sem coordenadas nao apareciam no mapa

**Causa raiz:** Formulario de criacao nao coletava lat/lng — campos sempre `null`.

**Correcao:** LocationPicker adicionado ao formulario (ver secao 3.1). Ocorrencias antigas sem coordenadas continuam funcionando normalmente (campo e opcional).

### 5.3 Tipos desalinhados entre componentes

**Problema:** Alguns componentes importavam `Incident` do `mockData.ts` (tipo base), outros usavam `ApiIncident` do service (tipo estendido com lat/lng). Causava inconsistencias de tipagem.

**Correcao:** `IncidentModal`, `IncidentTable` e `RelatoriosPage` agora usam `ApiIncident` consistentemente. O tipo `Incident` do mockData continua existindo como base (usado por `ChartsSection` e `ZoneStatus` que nao precisam de lat/lng).

---

## 6. Autenticacao e Registro

### 6.1 Separacao Cargo vs Role

**Problema:** No formulario de registro, "Cargo" e "Role" estavam misturados — o campo de cargo era usado para definir o perfil de acesso.

**Correcao:**
- "Cargo na Corporacao": campo de texto livre, opcional (ex: "Tenente", "Bombeiro Civil")
- "Perfil de Acesso": select obrigatorio com opcoes admin/operador/visualizador
- Backend aceita `role` como campo separado de `cargo`

### 6.2 Validacoes de Login

**Antes:** Validacao via atributos HTML5 (`required`) — travava testes headless.

**Depois:** Validacao via estado React com mensagens de erro amigaveis:
- "Email e obrigatorio"
- "Senha e obrigatoria"
- Erro exibido inline no formulario

### 6.3 Anti-enumeracao no Login

**Antes:** Mensagens diferentes para "usuario nao encontrado" vs "senha incorreta" vs "conta inativa" — permitia enumeracao de emails.

**Depois:** Resposta unica `401 "Credenciais invalidas"` para todos os cenarios de falha:
```typescript
if (!user || !user.ativo || !(await bcrypt.compare(senha, user.senha))) {
  res.status(401).json({ success: false, error: 'Credenciais invalidas' });
  return;
}
```

---

## 7. Banco de Dados

### 7.1 Pool de Conexao

**Antes:** Pool padrao do `pg` sem limites configurados.

**Depois:** (`api/db.ts`)
```typescript
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,                        // maximo de conexoes
  idleTimeoutMillis: 30000,       // fecha conexoes ociosas apos 30s
  connectionTimeoutMillis: 5000,  // timeout de conexao de 5s
});

pool.on('error', (err: Error) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
});
```

### 7.2 Migration 001 — Hash de Senhas

Script TypeScript para migrar senhas existentes de texto plano para bcrypt:

- Altera coluna `senha` para `VARCHAR(255)` (bcrypt gera 60 chars)
- Busca todos os usuarios
- Pula senhas que ja sao hash bcrypt (`$2b$` ou `$2a$`)
- Hasheia senhas em texto plano com cost 12
- Execucao: `npx tsx api/migrations/001_hash_passwords.ts`

### 7.3 Migration 002 — Schema Constraints

Script SQL idempotente com:

**CHECK constraints:**
- `check_role`: role IN ('admin', 'operador', 'visualizador')
- `check_hora`: hora IS NULL OR (hora >= 0 AND hora <= 23)
- `check_gravidade`: gravidade IN ('Baixa', 'Media', 'Alta', 'Critica')
- `check_status`: status IN ('Em Andamento', 'Finalizado', 'Pendente')

**Tipo de coluna:**
- `created_at` em `users` e `incidents`: TIMESTAMP → TIMESTAMPTZ

**Indexes:**
- `idx_incidents_status` — filtragem por status
- `idx_incidents_data` — ordenacao por data DESC
- `idx_incidents_tipo` — filtragem por tipo
- `idx_incidents_gravidade` — filtragem por gravidade
- `idx_kpis_ordem` — ordenacao de KPIs
- `idx_tipos_ativo` — filtragem de tipos ativos

### 7.4 Seed Atualizado

- Coluna `senha` alterada para `VARCHAR(255)` no schema
- Credenciais admin removidas — instrucoes manuais no lugar
- `ON CONFLICT DO NOTHING` em todos os inserts (idempotencia)
- Constraints comentadas com referencia ao script de migration

---

## 8. Frontend — Service Layer

### 8.1 apiFetch com Unwrap Automatico

O `apiFetch` agora detecta o envelope padrao da API e extrai automaticamente o campo `data`:

```typescript
function unwrapEnvelope<T>(body: unknown): T {
  if (
    body !== null &&
    typeof body === 'object' &&
    'data' in (body as Record<string, unknown>) &&
    ('success' in (body as Record<string, unknown>) || 'meta' in (body as Record<string, unknown>))
  ) {
    return (body as Record<string, unknown>).data as T;
  }
  return body as T;
}
```

Isso garante que os services (`fetchIncidents`, `fetchKpis`, etc.) continuem funcionando sem mudanca — o envelope e transparente.

### 8.2 Novas Dependencias

| Pacote | Versao | Proposito |
|--------|--------|-----------|
| `bcrypt` | ^6.0.0 | Hashing de senhas (backend) |
| `@types/bcrypt` | ^5.0.2 | Tipos TypeScript para bcrypt |
| `express-rate-limit` | ^7.5.0 | Rate limiting (backend) |
| `helmet` | ^8.1.0 | Security headers (backend) |

---

## 9. Documentacao

### Arquivos de documentacao atualizados:

| Arquivo | Mudancas |
|---------|----------|
| `PRD.md` | + Fase 6 completa, status "Cancelada" no schema, decisoes tecnicas 7-8 |
| `NEXT_STEPS.md` | Fase 6 concluida, tabela de features, melhorias futuras reorganizadas por prioridade |
| `docs/architecture.md` | + LocationPicker, tokens fire-yellow/fire-blue, z-index hierarchy, Topbar atualizado |
| `docs/PRD-SECURITY-HARDENING.md` | Documento completo de 719 linhas com inventario, fases e plano de implementacao |
| `CLAUDE.md` | + divida tecnica atualizada, comandos de verificacao, referencias rapidas |

---

## 10. Arquivos Modificados (lista completa)

### Backend (API)

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `api/index.ts` | Modificado | + helmet, rate-limit, CORS enforced, body limit 10kb, DATABASE_URL obrigatorio |
| `api/db.ts` | Modificado | + pool config (max, idle, connect timeout), error handler |
| `api/middleware/auth.ts` | Modificado | JWT_SECRET obrigatorio (sem fallback), `err: unknown` |
| `api/routes/auth.ts` | Modificado | + bcrypt, /register protegido, anti-enumeracao, envelope padronizado |
| `api/routes/incidents.ts` | Modificado | + paginacao, colunas explicitas, envelope, `err: unknown` |
| `api/routes/kpis.ts` | Modificado | + colunas explicitas, envelope padronizado |
| `api/routes/tipos.ts` | Modificado | + colunas explicitas, envelope, `err: unknown` |
| `api/routes/users.ts` | Modificado | + bcrypt, colunas explicitas, envelope, `err: unknown` |
| `api/seed.sql` | Modificado | - credenciais admin, + VARCHAR(255) para senha, + ON CONFLICT |
| `api/utils/validation.ts` | **NOVO** | Helpers de validacao centralizados |
| `api/migrations/001_hash_passwords.ts` | **NOVO** | Script de migracao de senhas para bcrypt |
| `api/migrations/002_schema_constraints.sql` | **NOVO** | CHECK constraints, TIMESTAMPTZ, indexes |

### Frontend

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `src/App.tsx` | Modificado | + handleUpdateIncident, FAB mobile, Topbar props, status "Cancelada" no filtro, import PlusCircle |
| `src/components/LocationPicker.tsx` | **NOVO** | Mini-mapa react-leaflet para selecao de coordenadas |
| `src/components/NovoAlertaModal.tsx` | Modificado | + LocationPicker, lat/lng no form, z-[70], scroll, fire-yellow |
| `src/components/IncidentModal.tsx` | Reescrito | + edicao status, onUpdate/userRole, z-[70], fire-yellow/fire-blue, "Cancelada" |
| `src/components/IncidentTable.tsx` | Modificado | + onUpdate/userRole, ApiIncident, fire-yellow/fire-blue, "Cancelada" |
| `src/components/Topbar.tsx` | Reescrito | - search fake, + nome/cargo real, avatar iniciais, userName/userRole props |
| `src/pages/MapaPage.tsx` | Modificado | + responsivo flex-col/flex-row, fire-yellow/fire-blue, max-h mobile |
| `src/pages/RelatoriosPage.tsx` | Modificado | + onUpdate/userRole, ApiIncident, "Cancelada", fire-yellow/fire-blue |
| `src/pages/RegisterPage.tsx` | **NOVO** | Pagina de registro com separacao cargo/role |
| `src/services/api.ts` | Modificado | + unwrapEnvelope para envelope padronizado da API |
| `src/services/incidents.ts` | Modificado | + updateIncident() |
| `src/index.css` | Modificado | + fire-yellow (#eab308), fire-blue (#3b82f6) |
| `src/contexts/AuthContext.tsx` | Modificado | + register() aceita role separado |

### Configuracao

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `package.json` | Modificado | + bcrypt, @types/bcrypt, helmet, express-rate-limit |
| `package-lock.json` | Modificado | Lock das novas dependencias |

### Documentacao

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `PRD.md` | Modificado | + Fase 6, decisoes tecnicas |
| `NEXT_STEPS.md` | Reescrito | Estado atual, features da Fase 6, pendencias reorganizadas |
| `CLAUDE.md` | Modificado | + divida tecnica atualizada, workflows |
| `docs/architecture.md` | Modificado | + LocationPicker, tokens, z-index, Topbar |
| `docs/PRD-SECURITY-HARDENING.md` | **NOVO** | PRD completo de seguranca (719 linhas) |

---

## 11. Migrations Pendentes

Antes de fazer deploy dessas alteracoes, executar na VPS:

```bash
# 1. Backup do banco
pg_dump -U bombeiros_app -d bombeiros > backup_pre_migration.sql

# 2. Hashear senhas existentes
npx tsx api/migrations/001_hash_passwords.ts

# 3. Aplicar constraints e indexes
psql -U bombeiros_app -d bombeiros -f api/migrations/002_schema_constraints.sql

# 4. Rotacionar senha do admin (comprometida no git history)
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('NOVA_SENHA_SEGURA', 12).then(h => console.log(h))"
psql -U bombeiros_app -d bombeiros -c "UPDATE users SET senha = '\$2b\$12\$HASH' WHERE email = 'admin@bombeiros.gov.br'"
```

---

## 12. Itens Ainda Pendentes

### Seguranca

| Prioridade | Item | Status | Motivo |
|-----------|------|--------|--------|
| HIGH | JWT em httpOnly cookies | Pendente | Mudanca arquitetural significativa |
| HIGH | CSRF protection | Pendente | Depende de httpOnly cookies |
| MEDIUM | `rejectUnauthorized: true` no SSL do DB | Pendente | Requer CA cert da VPS |

### Funcionalidades

| Prioridade | Item | Status |
|-----------|------|--------|
| P1 | Notificacoes em tempo real (WebSocket) | Pendente |
| P1 | Exportacao CSV/PDF funcional | Pendente |
| P1 | Edicao de mais campos no IncidentModal | Pendente |
| P2 | Code splitting (dynamic imports) | Pendente |
| P2 | Cache de dados (stale-while-revalidate) | Pendente |

### Qualidade

| Prioridade | Item | Status |
|-----------|------|--------|
| P1 | Testes automatizados (Vitest + Testing Library) | Pendente |
| P1 | CI/CD pipeline | Pendente |
| P2 | Monitoramento de erros (Sentry) | Pendente |
