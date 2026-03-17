# CLAUDE.md — Bombeiros (FireDash)

Sistema de monitoramento e gestao de ocorrencias para corpo de bombeiros.

## Comandos

```bash
# Frontend
npm run dev      # Dev server em http://localhost:3000
npm run build    # Build de producao
npm run lint     # Type-check (tsc --noEmit)
npm run preview  # Preview do build

# Backend (API)
npm run api:dev   # API com hot reload em http://localhost:3001
npm run api:start # API sem hot reload

# Verificacao (rodar antes de commit)
npm run lint && npx tsc --noEmit -p api/tsconfig.json && npm run build
```

## Ambiente

Copiar `.env.example` para `.env.local` e definir:
- `DATABASE_URL` — conexao PostgreSQL (VPS)
- `DB_SSL` — `true` para VPS remota
- `JWT_SECRET` — chave para tokens JWT
- `CORS_ORIGIN` — origem permitida para CORS
- `GEMINI_API_KEY` — chave da API Gemini (relatorios IA)

## Workflow de Desenvolvimento

> Integrado com ECC (Everything Claude Code). Regras globais em `~/.claude/rules/`.

### Para Novas Features

1. **Planejar** — `/everything-claude-code:plan` ou agent **planner**
2. **TDD** — Escrever teste primeiro, implementar, refatorar
3. **Implementar** — Seguir regras em `.claude/rules/coding.md`
4. **Review** — `/review` (automatico apos codigo escrito)
5. **Verificar** — `/verify` (tsc + build + security check)
6. **Deploy** — `/deploy` (checklist pre-deploy)

### Para Bug Fixes

1. **Reproduzir** — Confirmar o bug
2. **Teste** — Escrever teste que falha demonstrando o bug
3. **Fix** — Implementar correcao minimal
4. **Verificar** — `/verify`

### Para Refactoring

1. **Analisar** — `/refactor` (workflow guiado)
2. **Planejar** — Agent **planner** para refactors complexos
3. **Executar** — Mudancas incrementais com verificacao
4. **Cleanup** — Agent **refactor-cleaner** para dead code

## Comandos do Projeto

| Comando | Descricao |
|---|---|
| `/review` | Code review com checklist completo (tokens, tipos, seguranca, performance) |
| `/refactor` | Workflow de refatoracao segura com agents |
| `/deploy` | Checklist pre-deploy para Vercel (build, security, config) |
| `/verify` | Loop de verificacao (tsc + build + tests + security + smoke test) |
| `/security-review` | Auditoria de seguranca completa (SQL injection, auth, XSS, input) |
| `/db-migration` | Workflow para mudancas de schema (plan, SQL, TS, test, deploy) |
| `/db-check` | Verificar consistencia schema/tipos/rotas/services |

## Comandos ECC (Globais)

| Comando | Descricao |
|---|---|
| `/everything-claude-code:plan` | Plano de implementacao estruturado |
| `/everything-claude-code:tdd` | Workflow TDD (RED/GREEN/IMPROVE) |
| `/everything-claude-code:e2e` | Testes E2E com Playwright |
| `/everything-claude-code:security-review` | Security review profundo |
| `/everything-claude-code:verification-loop` | Verificacao completa |

## Agents Disponiveis

| Agent | Quando Usar |
|---|---|
| **planner** | Features complexas, refactoring multi-arquivo |
| **architect** | Decisoes arquiteturais, trade-offs |
| **tdd-guide** | Novas features (automatico), bug fixes |
| **code-reviewer** | Apos escrever/modificar codigo (automatico) |
| **security-reviewer** | Antes de commits, mudancas em auth/API |
| **build-error-resolver** | Quando build falha |
| **e2e-runner** | Testes Playwright de fluxos criticos |
| **refactor-cleaner** | Remocao de dead code |
| **database-reviewer** | Review de queries e schema |

## Principios de Codigo (Resumo)

- **Imutabilidade** — Nunca mutar estado, sempre spread
- **Tokens fire-*** — Nunca cores raw (hex/rgb)
- **unknown > any** — Tipar errors como `unknown`, fazer narrowing
- **Queries parametrizadas** — `$1, $2...`, nunca string concat
- **Envelope de resposta** — `{ success, data/error }` em toda API
- **Validacao de input** — Validar tudo no backend antes de processar
- **Error handling** — try/catch em todo async, mensagens PT-BR no frontend
- **isolate em mapas** — Wrapper do Leaflet usa `isolate` para conter z-indexes internos

## Referencias Rapidas

| O que | Onde |
|---|---|
| PRD e progresso | `PRD.md` |
| PRD Security Hardening | `docs/PRD-SECURITY-HARDENING.md` |
| Proximos passos | `NEXT_STEPS.md` |
| Regras de codigo | `.claude/rules/coding.md` |
| Regras de teste | `.claude/rules/testing.md` |
| Skills do projeto | `.claude/skills/*/SKILL.md` |
| Output styles | `.claude/output-styles/` |
| Arquitetura completa | `docs/architecture.md` |
| Decisoes (ADRs) | `docs/decisions/` |
| SQL de seed | `api/seed.sql` |
| Validacao utils | `api/utils/validation.ts` |
| Status colors utils | `src/utils/statusColors.ts` |
| Migrations | `api/migrations/` |

## ECC (Everything Claude Code) — Plugin Global

Plugin `everything-claude-code` instalado globalmente em `~/.claude/`. Fornece:
- **Rules globais:** `~/.claude/rules/common/` (9 arquivos) + `~/.claude/rules/typescript/` (5 arquivos)
- **Hooks automaticos:** TypeScript check, console.log warnings, quality gates
- **65+ skills:** coding-standards, verification-loop, search-first, security-review, postgres-patterns, etc.
- **14+ agents:** planner, architect, tdd-guide, code-reviewer, security-reviewer, build-error-resolver, etc.

As rules/skills **deste projeto** (`.claude/`) complementam o ECC com regras especificas do Bombeiros (tokens fire-*, deploy Vercel, schema PostgreSQL, roles).

## Seguranca Implementada

| Camada | Mecanismo | Detalhes |
|---|---|---|
| Senhas | bcrypt (cost 12) | Hash no write, compare no login |
| JWT | Env var obrigatoria | Sem fallback, erro fatal se ausente |
| Rate Limit | express-rate-limit | Global: 100 req/15min, Auth: 10 req/15min |
| Headers | helmet | X-Content-Type-Options, X-Frame-Options, HSTS |
| CORS | Origem obrigatoria | Sem wildcard, erro fatal em producao se ausente |
| Body | Limite 10kb | express.json({ limit: '10kb' }) |
| Queries | Colunas explicitas | Zero SELECT *, zero RETURNING * |
| Input | Validacao centralizada | `api/utils/validation.ts` (enums, email, length) |
| Erros | err: unknown | Narrowing em todos os catch blocks |
| Respostas | Envelope padrao | `{ success: true/false, data/error }` |
| Registro | Protegido | /register requer admin autenticado |
| Anti-enum | Resposta unica | 401 para todos os casos de login falho |
| Paginacao | GET /incidents | LIMIT/OFFSET com meta (total, page, pages) |
| Pool | Configurado | max: 20, idle: 30s, connect: 5s |
| Seed | Sem credenciais | Senha removida do seed.sql |

## Divida Tecnica Conhecida

| Prioridade | Item | Status |
|---|---|---|
| P0 | Senhas em texto plano (migrar para bcrypt) | Resolvido |
| P0 | JWT em localStorage (migrar para httpOnly cookies) | Pendente |
| P1 | Sem rate limiting nas rotas de auth | Resolvido |
| P1 | Sem testes automatizados (Vitest + Testing Library) | Pendente |
| P2 | `SELECT *` em queries da API | Resolvido |
| P2 | Sem paginacao na listagem de incidents | Resolvido |
| P2 | Sem CSRF protection (depende de httpOnly cookies) | Pendente |

## Migrations

```bash
# 1. Hash senhas existentes no banco
npx tsx api/migrations/001_hash_passwords.ts

# 2. Adicionar constraints e indexes
psql $DATABASE_URL -f api/migrations/002_schema_constraints.sql

# 3. Criar tabela alerts + atualizar constraint de status (5 status)
psql $DATABASE_URL -f api/migrations/003_alerts_and_status.sql
```

## Arquitetura (resumo)

- **Frontend:** SPA React 19 + TypeScript + Vite (sem router library)
- **Backend:** Node.js + Express (API REST), deploy na Vercel
- **Banco:** PostgreSQL (VPS propria)
- **Auth:** JWT (bcrypt + rate limit) + 3 roles (admin, operador, visualizador)
- **Seguranca:** helmet, rate-limit, CORS enforced, body limit, validacao centralizada
- Navegacao via estado `Page` em `App.tsx`
- Tailwind CSS v4 — usar tokens `fire-*` (nunca cores raw)
- Dados vem da API REST (PostgreSQL) via `src/services/` — mock data mantido apenas como referencia de tipos
- Backend carrega env de `.env.local` na raiz (path relativo ao CWD, nao ao arquivo)
- **Producao:** https://firedash-bombeiros.vercel.app

## Estrutura

```
src/                    # Frontend (React SPA)
├── components/         # Componentes compartilhados
│   ├── Sidebar.tsx              # Navegacao lateral + user info + logout
│   ├── Topbar.tsx               # Titulo, tema, nome/cargo, avatar, badge notificacoes
│   ├── KpiCards.tsx             # Cards de indicadores (dados da API)
│   ├── ChartsSection.tsx        # Graficos analiticos (Recharts)
│   ├── IncidentTable.tsx        # Tabela de ocorrencias (ordenacao, busca, update/delete)
│   ├── IncidentModal.tsx        # Detalhes + edicao de status (admin/operador)
│   ├── NovoAlertaModal.tsx      # Criar alerta (POST + LocationPicker + tipos dinamicos)
│   ├── LocationPicker.tsx       # Mini-mapa para selecao de coordenadas (react-leaflet)
│   ├── NotificationPanel.tsx    # Painel de notificacoes (alerts da API, dismiss individual/todos)
│   ├── ProtectedRoute.tsx       # Wrapper de protecao por role
│   ├── ZoneStatus.tsx           # Status por zona geografica
│   ├── MapSection.tsx           # Mapa interativo (componente legado, usado no dashboard)
│   └── SystemStatus.tsx         # Status do sistema
├── pages/
│   ├── LoginPage.tsx            # Tela de login
│   ├── RegisterPage.tsx         # Cadastro de usuarios (somente admin)
│   ├── AdminPage.tsx            # Painel admin (CRUD de usuarios)
│   ├── RelatoriosPage.tsx       # Historico com filtros, busca e edicao
│   ├── MapaPage.tsx             # Mapa georreferenciado (Leaflet, isolate stacking context)
│   └── ConfiguracoesPage.tsx    # Preferencias e dados do usuario
├── contexts/
│   └── AuthContext.tsx          # Estado global de autenticacao (user, login, register, logout)
├── services/
│   ├── api.ts                   # Fetch wrapper com JWT, baseURL e unwrap de envelope
│   ├── incidents.ts             # fetchIncidents, createIncident, updateIncident, deleteIncident
│   ├── kpis.ts                  # fetchKpis
│   ├── users.ts                 # fetchUsers, createUser, updateUser, deactivateUser
│   └── alerts.ts                # fetchAlerts, fetchAlertCount, dismissAlert, dismissAllAlerts
├── utils/
│   └── statusColors.ts          # getStatusColor, getSeverityColor centralizados
├── data/
│   └── mockData.ts              # Interfaces TypeScript (Incident, etc.)
├── index.css                    # Tokens fire-* e estilos globais (dark/light theme, Leaflet)
└── App.tsx                      # Orquestrador: auth, dados, filtros, navegacao, alerts, FAB mobile

api/                    # Backend (Express API)
├── index.ts            # Entry point — Express app, helmet, rate-limit, CORS
├── db.ts               # Pool PostgreSQL (max: 20, timeouts configurados)
├── seed.sql            # SQL de criacao de tabelas + dados iniciais (sem credenciais)
├── middleware/
│   ├── auth.ts         # Middleware JWT (bcrypt compare, sem fallback secret)
│   └── roles.ts        # Middleware de roles (admin, operador, visualizador)
├── routes/
│   ├── auth.ts         # POST /login (bcrypt), POST /register (admin only), GET /me
│   ├── incidents.ts    # CRUD ocorrencias + filtros + paginacao
│   ├── kpis.ts         # GET/PUT KPIs
│   ├── tipos.ts        # CRUD tipos de ocorrencia
│   ├── users.ts        # CRUD usuarios (admin only, bcrypt)
│   └── alerts.ts       # GET alerts, GET count, PATCH dismiss, PATCH dismiss-all
├── utils/
│   └── validation.ts   # Helpers de validacao (email, enums, length, ID format)
├── migrations/
│   ├── 001_hash_passwords.ts          # Migration: hashear senhas existentes
│   ├── 002_schema_constraints.sql     # Constraints + indexes
│   └── 003_alerts_and_status.sql      # Tabela alerts + constraint 5 status

.claude/                # Contexto para IA
├── rules/              # Regras operacionais (coding.md, testing.md)
├── skills/             # Workflows reutilizaveis (7 skills)
├── output-styles/      # Estilos de resposta (architect, learning, production)
├── settings.local.json # Permissoes e seguranca

docs/                   # Documentacao do projeto
├── architecture.md
├── decisions/          # ADRs
├── PRD-SECURITY-HARDENING.md  # Auditoria de seguranca (23 vulnerabilidades)
```

## Banco de Dados

5 tabelas: `users`, `incidents`, `kpis`, `tipos_ocorrencia`, `alerts`. Schema completo em `api/seed.sql` (tabelas base) e `api/migrations/003_alerts_and_status.sql` (tabela alerts).

### Status de Ocorrencias

5 status validos: `Em Andamento`, `Finalizado`, `Pendente`, `Cancelada`, `Arquivado`

### Tabela Alerts

- Auto-criado ao criar incident (trigger ou via API)
- `status`: `active` ou `dismissed`
- `dismissed_by`: referencia ao user que dispensou
- Indexes em `status`, `incident_id`, `created_at`

## Z-Index Hierarchy

| Camada | Z-Index | Componente |
|---|---|---|
| Bottom nav (mobile) | `z-50` | `nav` em App.tsx |
| FAB (mobile) | `z-[60]` | Botao "Novo Alerta" |
| Modais | `z-[70]` | NovoAlertaModal, IncidentModal |
| NotificationPanel | `z-[80]` | Painel de notificacoes no Topbar |
| Map overlay badge | `z-[1000]` | Badge dentro do MapContainer (isolado) |

> O wrapper do mapa usa `isolate` para criar stacking context isolado, impedindo que z-indexes internos do Leaflet (200-700+) vazem e sobreponham modais.

## Roles e Acesso

| Role | Acesso |
|---|---|
| `admin` | Tudo + painel admin (CRUD usuarios) |
| `operador` | Dashboard, Relatorios, Mapa, Config, CRUD ocorrencias |
| `visualizador` | Somente Dashboard (read-only) |
