# Arquitetura do Sistema — Bombeiros

## Visao Geral

Sistema de monitoramento e gestao de ocorrencias para corpo de bombeiros. Frontend SPA (React + Vite) com backend API REST (Express) e banco PostgreSQL. Deploy completo na Vercel.

**Producao:** [https://firedash-bombeiros.vercel.app](https://firedash-bombeiros.vercel.app)

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express, TypeScript |
| Banco de Dados | PostgreSQL (VPS propria) |
| Autenticacao | JWT + bcrypt (3 roles) |
| Deploy | Vercel (frontend SPA + API serverless) |
| Mapas | Leaflet + React-Leaflet |
| Graficos | Recharts |
| Animacoes | Motion (Framer Motion) |
| Icones | Lucide React |
| IA | Google GenAI SDK (Gemini) |

## Estrutura de Paginas

```
AuthProvider (contexto de autenticacao global)
└── AppShell (verifica token, exibe LoginPage ou AuthenticatedApp)
    ├── LoginPage (formulario de login)
    ├── RegisterPage (cadastro, admin only)
    └── AuthenticatedApp (carrega dados da API)
        ├── Sidebar (navegacao + user info + logout)
        ├── Topbar (titulo, tema, nome/cargo, avatar, badge notificacoes)
        │   └── NotificationPanel (alerts com dismiss individual/todos)
        ├── Dashboard (inline no App.tsx)
        │   ├── KpiCards (dados da API)
        │   ├── ChartsSection (graficos com dados filtrados)
        │   ├── ZoneStatus
        │   └── IncidentTable (com update/delete via API)
        ├── RelatoriosPage (protegida por role)
        ├── MapaPage (protegida por role, isolate stacking context)
        ├── ConfiguracoesPage (protegida por role)
        ├── AdminPage (CRUD de usuarios, admin only)
        ├── NovoAlertaModal (com LocationPicker)
        └── FAB mobile (Novo Alerta, admin/operador)
```

## Fluxo de Navegacao

Sem router library. O estado `currentPage` em `App.tsx` controla qual pagina e renderizada. O `Sidebar` dispara `onNavigate` para mudar de pagina. Acesso as paginas e controlado pelo role do usuario via `ROLE_PAGES` e `ProtectedRoute`.

## Frontend

```
src/
├── components/             # Componentes compartilhados
│   ├── Sidebar.tsx                # Navegacao lateral + user info + logout
│   ├── Topbar.tsx                 # Barra superior: titulo, tema, nome/cargo, avatar, notificacoes
│   ├── KpiCards.tsx               # Cards de indicadores (recebe via props)
│   ├── MapSection.tsx             # Mapa interativo com Leaflet (componente legado)
│   ├── ChartsSection.tsx          # Graficos com Recharts (dados da API)
│   ├── SystemStatus.tsx           # Status do sistema
│   ├── LocationPicker.tsx         # Mini-mapa react-leaflet para selecao de coordenadas
│   ├── IncidentTable.tsx          # Tabela de ocorrencias (com update e delete via API)
│   ├── IncidentModal.tsx          # Detalhes + edicao de status (admin/operador)
│   ├── NovoAlertaModal.tsx        # Criar novo alerta (POST + LocationPicker + tipos dinamicos)
│   ├── NotificationPanel.tsx      # Painel de notificacoes (alerts API, dismiss individual/todos)
│   ├── ProtectedRoute.tsx         # Wrapper de protecao por role
│   └── ZoneStatus.tsx             # Status por zona
├── pages/
│   ├── LoginPage.tsx              # Tela de login
│   ├── RegisterPage.tsx           # Cadastro de usuarios (admin only)
│   ├── AdminPage.tsx              # Painel admin (CRUD de usuarios)
│   ├── RelatoriosPage.tsx         # Relatorios (recebe incidents via props)
│   ├── MapaPage.tsx               # Mapa (isolate stacking context, side panel)
│   └── ConfiguracoesPage.tsx      # Configuracoes (dados do user logado)
├── contexts/
│   └── AuthContext.tsx            # Context: user, loading, login(), register(), logout()
├── services/
│   ├── api.ts                     # Fetch wrapper com JWT, baseURL, 401 redirect, unwrap envelope
│   ├── incidents.ts               # fetchIncidents, createIncident, updateIncident, deleteIncident
│   ├── kpis.ts                    # fetchKpis
│   ├── users.ts                   # fetchUsers, createUser, updateUser, deactivateUser
│   └── alerts.ts                  # fetchAlerts, fetchAlertCount, dismissAlert, dismissAllAlerts
├── utils/
│   └── statusColors.ts            # getStatusColor, getSeverityColor, getSeverityColorWithBorder
├── data/
│   └── mockData.ts                # Interfaces TypeScript (Incident, etc.)
└── App.tsx                        # Orquestrador: carrega dados, filtros, navegacao, alerts
```

## Backend (API)

```
api/
├── index.ts            # Express app, monta rotas, helmet, rate-limit, CORS, health check
├── db.ts               # Pool de conexao PostgreSQL (SSL configuravel, max 20, timeouts)
├── seed.sql            # SQL de criacao + dados iniciais
├── middleware/
│   ├── auth.ts         # JWT: gera token (24h), valida, extrai user, bcrypt compare
│   └── roles.ts        # Verifica role do user (admin, operador, visualizador)
├── routes/
│   ├── auth.ts         # POST /login (bcrypt), POST /register (admin only), GET /me, POST /logout
│   ├── incidents.ts    # CRUD + filtros (periodo, tipo, gravidade, status, search) + paginacao
│   ├── kpis.ts         # GET (todos), PUT (admin)
│   ├── tipos.ts        # GET, POST (admin), DELETE soft (admin)
│   ├── users.ts        # CRUD completo (admin only, bcrypt hash)
│   └── alerts.ts       # GET alerts, GET count, PATCH dismiss, PATCH dismiss-all
├── utils/
│   └── validation.ts   # Validadores centralizados (email, enums, length, ID)
└── migrations/
    ├── 001_hash_passwords.ts       # Migrar senhas texto plano para bcrypt
    ├── 002_schema_constraints.sql  # CHECK constraints + indexes
    └── 003_alerts_and_status.sql   # Tabela alerts + constraint 5 status
```

## Banco de Dados

5 tabelas:
- `users` — autenticacao e roles (admin, operador, visualizador)
- `incidents` — ocorrencias (PK: string BMB-XXX, com lat/lng para mapa)
- `kpis` — indicadores estaticos editaveis pelo admin
- `tipos_ocorrencia` — tipos com soft delete
- `alerts` — notificacoes vinculadas a incidents (active/dismissed)

Schema base em `api/seed.sql`. Tabela alerts em `api/migrations/003_alerts_and_status.sql`.

### Status de Ocorrencias

5 status validos (CHECK constraint): `Em Andamento`, `Finalizado`, `Pendente`, `Cancelada`, `Arquivado`

### Tabela Alerts

- Vinculada a incidents via `incident_id` (FK com CASCADE)
- Status: `active` ou `dismissed` (CHECK constraint)
- `dismissed_by`: referencia ao user que dispensou
- Indexes: `status`, `incident_id`, `created_at DESC`

## Autenticacao e Autorizacao

1. Usuario acessa o app → `AuthProvider` verifica token no `localStorage`
2. Se nao tem token → renderiza `LoginPage`
3. `LoginPage` → `POST /api/auth/login` → recebe `{ token, user }`
4. Salva token no `localStorage`, user no `AuthContext`
5. Renderiza `AuthenticatedApp` (carrega dados da API)
6. Toda requisicao a API inclui header `Authorization: Bearer <token>`
7. Se token invalido/expirado → API retorna 401 → `apiFetch` limpa token e recarrega

### Roles

| Role | Acesso |
|---|---|
| `admin` | Tudo + painel admin (CRUD usuarios, KPIs, tipos) |
| `operador` | Dashboard, Relatorios, Mapa, Config pessoal, CRUD ocorrencias |
| `visualizador` | Somente Dashboard (read-only) |

## Fluxo de Dados

```
App.tsx (loadData)
  ├── fetchIncidents() → GET /api/incidents → PostgreSQL
  ├── fetchKpis()      → GET /api/kpis     → PostgreSQL
  └── fetchAlertCount() → GET /api/alerts/count → PostgreSQL
      ↓
  Estado local (incidents, kpis, alertCount)
      ↓
  Props para componentes filhos (KpiCards, ChartsSection, IncidentTable, etc.)
```

- Incidents, KPIs e alert count sao carregados ao montar `AuthenticatedApp`
- Filtros no Dashboard sao aplicados client-side sobre os dados ja carregados
- Criacao/exclusao/atualizacao de incidents atualiza o estado local imediatamente (optimistic)
- Alerts sao carregados sob demanda ao clicar no sino (fetchAlerts)
- Status suportados: `Em Andamento`, `Finalizado`, `Pendente`, `Cancelada`, `Arquivado`
- Mapa filtra apenas incidents ativos (`Em Andamento` + `Pendente`)

## Design Tokens (Tailwind CSS v4)

Tokens customizados definidos em `src/index.css`:

| Token | Valor | Uso |
|---|---|---|
| `fire-dark` | `#0f0c0c` | Background principal |
| `fire-card` | `#1a1616` | Background de cards |
| `fire-red` | `#e11d48` | Acoes primarias, critico, cancelada |
| `fire-orange` | `#f59e0b` | Gravidade alta |
| `fire-green` | `#10b981` | Sucesso, finalizado, gravidade baixa |
| `fire-yellow` | `#eab308` | Gravidade media |
| `fire-blue` | `#3b82f6` | Status "Em Andamento", informativo |
| `fire-sidebar` | `#141111` | Background do sidebar |
| `fire-muted` | `#9ca3af` | Texto secundario |

## Z-Index Hierarchy

| Camada | Z-Index | Componente |
|---|---|---|
| Bottom nav (mobile) | `z-50` | `nav` em App.tsx |
| FAB (mobile) | `z-[60]` | Botao "Novo Alerta" |
| Modais | `z-[70]` | NovoAlertaModal, IncidentModal |
| NotificationPanel | `z-[80]` | Painel de notificacoes no Topbar |
| Map overlay badge | `z-[1000]` | Badge dentro do MapContainer (isolado) |

> O wrapper do mapa em `MapaPage.tsx` usa CSS `isolation: isolate` para criar stacking context isolado. Isso impede que z-indexes internos do Leaflet (tiles ~200, markers ~600, popups ~700) vazem e sobreponham modais e outros elementos da UI.

## Deploy

- **Frontend:** Vercel (SPA estatica, `dist/`)
- **Backend:** Vercel Serverless Function (`api/index.ts`)
- **Banco:** PostgreSQL na VPS
- **Config:** `vercel.json` com rewrites para `/api/*` → serverless e `/*` → SPA
- **Env vars:** `DATABASE_URL`, `JWT_SECRET`, `DB_SSL`, `CORS_ORIGIN` configuradas na Vercel (Production + Preview + Development)

## Componentes Compartilhados

| Componente | Responsabilidade |
|---|---|
| Sidebar | Navegacao lateral, user info, botao novo alerta, logout |
| Topbar | Titulo dinamico, toggle de tema, nome/cargo real do usuario, avatar iniciais, badge notificacoes |
| NotificationPanel | Lista de alertas ativos, dismiss individual/todos, click outside para fechar |
| KpiCards | Cards de indicadores (recebe kpis via props) |
| MapSection | Mapa interativo com Leaflet (componente legado) |
| ChartsSection | Graficos com Recharts (recebe incidents via props) |
| SystemStatus | Status do sistema |
| LocationPicker | Mini-mapa react-leaflet para selecao de coordenadas (lat/lng) |
| IncidentTable | Tabela de ocorrencias com update/delete via API |
| IncidentModal | Detalhes + edicao de status (admin/operador) |
| NovoAlertaModal | Criar novo alerta via API + LocationPicker + tipos dinamicos |
| ProtectedRoute | Wrapper que verifica role do usuario |
| ZoneStatus | Status por zona |
