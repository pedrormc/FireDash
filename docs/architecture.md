# Arquitetura do Sistema — Bombeiros

## Visão Geral

Sistema de monitoramento e gestão de ocorrências para corpo de bombeiros. Frontend SPA (React + Vite) com backend API REST (Express) e banco PostgreSQL.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express, TypeScript |
| Banco de Dados | PostgreSQL (VPS própria) |
| Autenticação | JWT (login/senha simples) |
| Deploy | Vercel (frontend + API serverless) |
| Mapas | Leaflet + React-Leaflet |
| Gráficos | Recharts |
| Animações | Motion (Framer Motion) |
| Ícones | Lucide React |
| IA | Google GenAI SDK (Gemini) |

## Estrutura de Páginas

```
App.tsx (gerencia navegação via estado Page)
├── LoginPage (auth)
├── Dashboard (inline no App.tsx)
│   ├── KpiCards
│   ├── MapSection
│   ├── ChartsSection
│   ├── SystemStatus
│   ├── IncidentTable
│   └── ZoneStatus
├── RelatoriosPage
├── MapaPage
├── ConfiguracoesPage
└── AdminPage (CRUD de usuários, admin only)
```

## Fluxo de Navegação

Sem router library. O estado `currentPage` em `App.tsx` controla qual página é renderizada. O `Sidebar` dispara `onNavigate` para mudar de página. Acesso às páginas é controlado pelo role do usuário autenticado.

## Backend (API)

```
api/
├── index.ts            # Express app, monta rotas, CORS, health check
├── db.ts               # Pool de conexão PostgreSQL
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
- `users` — autenticação e roles
- `incidents` — ocorrências (PK: string BMB-XXX)
- `kpis` — indicadores estáticos
- `tipos_ocorrencia` — tipos com soft delete

Schema completo em `api/seed.sql`.

## Autenticação e Autorização

1. Login via `POST /api/auth/login` retorna JWT (24h)
2. Token armazenado em `localStorage`
3. Toda requisição envia `Authorization: Bearer <token>`
4. Middleware `auth.ts` valida token e injeta `req.user`
5. Middleware `roles.ts` verifica se o role tem permissão

### Roles

| Role | Acesso |
|---|---|
| `admin` | Tudo + painel admin (CRUD usuários, KPIs, tipos) |
| `operador` | Dashboard, Relatórios, Mapa, Config pessoal, CRUD ocorrências |
| `visualizador` | Somente Dashboard (read-only) |

## Dados

**Estado atual:** Em migração. Mock data em `src/data/mockData.ts` sendo substituído por chamadas à API.

**Fluxo futuro:** `src/services/` → `api/routes/` → PostgreSQL

## Componentes Compartilhados

| Componente | Responsabilidade |
|---|---|
| Sidebar | Navegação lateral, botão novo alerta |
| Topbar | Título dinâmico por página |
| KpiCards | Cards de indicadores |
| MapSection | Mapa interativo com Leaflet |
| ChartsSection | Gráficos com Recharts |
| SystemStatus | Status do sistema |
| IncidentTable | Tabela de ocorrências |
| IncidentModal | Detalhes de ocorrência |
| NovoAlertaModal | Criar novo alerta |
| ZoneStatus | Status por zona |
