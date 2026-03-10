# Arquitetura do Sistema — Bombeiros

## Visão Geral

Sistema de monitoramento e gestão de ocorrências para corpo de bombeiros. Frontend SPA (React + Vite) com backend API REST (Express) e banco PostgreSQL. Deploy completo na Vercel.

**Produção:** [https://firedash-bombeiros.vercel.app](https://firedash-bombeiros.vercel.app)

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express, TypeScript |
| Banco de Dados | PostgreSQL (VPS própria) |
| Autenticação | JWT (login/senha simples) |
| Deploy | Vercel (frontend SPA + API serverless) |
| Mapas | Leaflet + React-Leaflet |
| Gráficos | Recharts |
| Animações | Motion (Framer Motion) |
| Ícones | Lucide React |
| IA | Google GenAI SDK (Gemini) |

## Estrutura de Páginas

```
AuthProvider (contexto de autenticação global)
└── AppShell (verifica token, exibe LoginPage ou AuthenticatedApp)
    ├── LoginPage (formulário de login)
    └── AuthenticatedApp (carrega dados da API)
        ├── Sidebar (navegação + user info + logout)
        ├── Dashboard (inline no App.tsx)
        │   ├── KpiCards (dados da API)
        │   ├── ChartsSection (gráficos com dados filtrados)
        │   ├── ZoneStatus
        │   └── IncidentTable (com delete via API)
        ├── RelatoriosPage (protegida por role)
        ├── MapaPage (protegida por role)
        ├── ConfiguracoesPage (protegida por role)
        └── AdminPage (CRUD de usuários, admin only)
```

## Fluxo de Navegação

Sem router library. O estado `currentPage` em `App.tsx` controla qual página é renderizada. O `Sidebar` dispara `onNavigate` para mudar de página. Acesso às páginas é controlado pelo role do usuário via `ROLE_PAGES` e `ProtectedRoute`.

## Frontend

```
src/
├── components/             # Componentes compartilhados
│   ├── Sidebar.tsx                # Navegação lateral + user info + logout
│   ├── Topbar.tsx                 # Barra superior dinâmica
│   ├── KpiCards.tsx               # Cards de indicadores (recebe via props)
│   ├── MapSection.tsx             # Mapa interativo com Leaflet
│   ├── ChartsSection.tsx          # Gráficos com Recharts (dados da API)
│   ├── SystemStatus.tsx           # Status do sistema
│   ├── IncidentTable.tsx          # Tabela de ocorrências
│   ├── IncidentModal.tsx          # Detalhes de ocorrência
│   ├── NovoAlertaModal.tsx        # Criar novo alerta (POST via API + tipos dinâmicos)
│   ├── ProtectedRoute.tsx         # Wrapper de proteção por role
│   └── ZoneStatus.tsx             # Status por zona
├── pages/
│   ├── LoginPage.tsx              # Tela de login
│   ├── AdminPage.tsx              # Painel admin (CRUD de usuários)
│   ├── RelatoriosPage.tsx         # Relatórios (recebe incidents via props)
│   ├── MapaPage.tsx               # Mapa (recebe incidents via props)
│   └── ConfiguracoesPage.tsx      # Configurações (dados do user logado)
├── contexts/
│   └── AuthContext.tsx            # Context: user, loading, login(), logout()
├── services/
│   ├── api.ts                     # Fetch wrapper com JWT, baseURL, 401 redirect
│   ├── incidents.ts               # fetchIncidents, createIncident, deleteIncident
│   ├── kpis.ts                    # fetchKpis
│   └── users.ts                   # fetchUsers, createUser, updateUser, deactivateUser
├── data/
│   └── mockData.ts                # Interfaces TypeScript (Incident, etc.)
└── App.tsx                        # Orquestrador: carrega dados, filtros, navegação
```

## Backend (API)

```
api/
├── index.ts            # Express app, monta rotas, CORS, health check
├── db.ts               # Pool de conexão PostgreSQL (SSL configurável)
├── seed.sql            # SQL de criação + dados iniciais
├── middleware/
│   ├── auth.ts         # JWT: gera token (24h), valida, extrai user
│   └── roles.ts        # Verifica role do user (admin, operador, visualizador)
└── routes/
    ├── auth.ts         # POST /login, GET /me, POST /logout
    ├── incidents.ts    # CRUD + filtros (periodo, tipo, gravidade, status, search)
    ├── kpis.ts         # GET (todos), PUT (admin)
    ├── tipos.ts        # GET, POST (admin), DELETE soft (admin)
    └── users.ts        # CRUD completo (admin only)
```

## Banco de Dados

4 tabelas:
- `users` — autenticação e roles (admin, operador, visualizador)
- `incidents` — ocorrências (PK: string BMB-XXX, com lat/lng para mapa)
- `kpis` — indicadores estáticos editáveis pelo admin
- `tipos_ocorrencia` — tipos com soft delete

Schema completo em `api/seed.sql`.

## Autenticação e Autorização

1. Usuário acessa o app → `AuthProvider` verifica token no `localStorage`
2. Se não tem token → renderiza `LoginPage`
3. `LoginPage` → `POST /api/auth/login` → recebe `{ token, user }`
4. Salva token no `localStorage`, user no `AuthContext`
5. Renderiza `AuthenticatedApp` (carrega dados da API)
6. Toda requisição à API inclui header `Authorization: Bearer <token>`
7. Se token inválido/expirado → API retorna 401 → `apiFetch` limpa token e recarrega

### Roles

| Role | Acesso |
|---|---|
| `admin` | Tudo + painel admin (CRUD usuários, KPIs, tipos) |
| `operador` | Dashboard, Relatórios, Mapa, Config pessoal, CRUD ocorrências |
| `visualizador` | Somente Dashboard (read-only) |

## Fluxo de Dados

```
App.tsx (loadData)
  ├── fetchIncidents() → GET /api/incidents → PostgreSQL
  └── fetchKpis()      → GET /api/kpis     → PostgreSQL
      ↓
  Estado local (incidents, kpis)
      ↓
  Props para componentes filhos (KpiCards, ChartsSection, IncidentTable, etc.)
```

- Incidents e KPIs são carregados uma vez ao montar `AuthenticatedApp`
- Filtros no Dashboard são aplicados client-side sobre os dados já carregados
- Criação/exclusão de incidents atualiza o estado local imediatamente (optimistic)
- Alerts são derivados dos últimos 3 incidents "Em Andamento" (sem tabela própria)

## Deploy

- **Frontend:** Vercel (SPA estática, `dist/`)
- **Backend:** Vercel Serverless Function (`api/index.ts`)
- **Banco:** PostgreSQL na VPS (`3.237.66.68`)
- **Config:** `vercel.json` com rewrites para `/api/*` → serverless e `/*` → SPA
- **Env vars:** `DATABASE_URL`, `JWT_SECRET`, `DB_SSL`, `CORS_ORIGIN` configuradas na Vercel

## Componentes Compartilhados

| Componente | Responsabilidade |
|---|---|
| Sidebar | Navegação lateral, user info, botão novo alerta, logout |
| Topbar | Título dinâmico por página, toggle de tema |
| KpiCards | Cards de indicadores (recebe kpis via props) |
| MapSection | Mapa interativo com Leaflet |
| ChartsSection | Gráficos com Recharts (recebe incidents via props) |
| SystemStatus | Status do sistema |
| IncidentTable | Tabela de ocorrências com ações |
| IncidentModal | Detalhes de ocorrência |
| NovoAlertaModal | Criar novo alerta via API + tipos dinâmicos |
| ProtectedRoute | Wrapper que verifica role do usuário |
| ZoneStatus | Status por zona |
