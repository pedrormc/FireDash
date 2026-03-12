<div align="center">

# FireDash — Sistema de Monitoramento de Ocorrencias

**Painel de comando em tempo real para gestao de ocorrencias do Corpo de Bombeiros**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)

**Producao:** [https://firedash-bombeiros.vercel.app](https://firedash-bombeiros.vercel.app)

</div>

---

## Sobre o Projeto

Sistema web completo para monitoramento e gestao de ocorrencias do corpo de bombeiros, com dashboard interativo, mapa georreferenciado, graficos analiticos, geracao de relatorios com IA (Gemini), API REST com hardening de seguranca e autenticacao com 3 niveis de acesso.

### Funcionalidades

- **Dashboard** — KPIs em tempo real, tabela de ocorrencias com ordenacao/busca, graficos de tendencias, status por zona e alertas ativos
- **Mapa Interativo** — Visualizacao georreferenciada de ocorrencias com Leaflet, marcadores animados por gravidade, side panel com lista de focos e controle de camadas
- **Novo Alerta** — Cadastro de ocorrencias com mini-mapa para selecao de coordenadas (click ou geolocalizacao GPS) e tipos dinamicos da API
- **Edicao de Status** — Alteracao de status diretamente no modal de detalhes (admin/operador) com salvamento via API
- **Relatorios** — Historico filtrado com busca, filtros de gravidade/status e geracao de relatorios com IA (Gemini)
- **Painel Admin** — CRUD completo de usuarios com controle de roles e ativacao/desativacao
- **Configuracoes** — Tema claro/escuro, dados do usuario logado
- **API REST** — CRUD completo com paginacao, rate limiting, security headers e envelope padronizado
- **Autenticacao** — JWT com bcrypt, 3 roles (admin, operador, visualizador), registro protegido por admin
- **Responsivo** — Layout adaptativo para mobile com bottom tab bar e FAB para criar alertas

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Vite 6 |
| Backend/API | Node.js + Express + TypeScript |
| Banco de Dados | PostgreSQL (VPS) |
| Autenticacao | JWT + bcrypt (3 roles) |
| Estilizacao | Tailwind CSS v4 (tema customizado `fire-*`) |
| Mapas | Leaflet + React-Leaflet |
| Graficos | Recharts |
| Animacoes | Motion (Framer Motion) |
| Icones | Lucide React |
| IA | Google GenAI SDK (Gemini) |
| Seguranca | helmet + express-rate-limit + bcrypt |
| Deploy | Vercel (SPA + Serverless Functions) |

---

## Estrutura do Projeto

```
src/                        # Frontend (React SPA)
├── components/
│   ├── Sidebar.tsx                # Navegacao lateral + user info + logout
│   ├── Topbar.tsx                 # Titulo, tema, nome/cargo do usuario, avatar com iniciais
│   ├── KpiCards.tsx               # Cards de indicadores (dados da API)
│   ├── LocationPicker.tsx         # Mini-mapa para selecao de coordenadas (react-leaflet)
│   ├── ChartsSection.tsx          # Graficos analiticos (Recharts)
│   ├── IncidentTable.tsx          # Tabela de ocorrencias (ordenacao, busca, update/delete)
│   ├── IncidentModal.tsx          # Detalhes + edicao de status (admin/operador)
│   ├── NovoAlertaModal.tsx        # Criar alerta (POST + LocationPicker + tipos dinamicos)
│   ├── ProtectedRoute.tsx         # Wrapper de protecao por role
│   └── ZoneStatus.tsx             # Status por zona geografica
├── pages/
│   ├── LoginPage.tsx              # Tela de login
│   ├── RegisterPage.tsx           # Cadastro de usuarios (somente admin)
│   ├── AdminPage.tsx              # Painel admin (CRUD de usuarios)
│   ├── RelatoriosPage.tsx         # Historico com filtros e edicao
│   ├── MapaPage.tsx               # Mapa georreferenciado (responsivo)
│   └── ConfiguracoesPage.tsx      # Preferencias e dados do usuario
├── contexts/
│   └── AuthContext.tsx            # Estado global de autenticacao (user, login, register, logout)
├── services/
│   ├── api.ts                     # Fetch wrapper com JWT, baseURL e unwrap de envelope
│   ├── incidents.ts               # fetchIncidents, createIncident, updateIncident, deleteIncident
│   ├── kpis.ts                    # fetchKpis
│   └── users.ts                   # fetchUsers, createUser, updateUser, deactivateUser
├── data/
│   └── mockData.ts                # Interfaces TypeScript (Incident, etc.)
├── index.css                      # Tokens fire-* e estilos globais (dark/light theme)
└── App.tsx                        # Orquestrador: auth, dados, filtros, navegacao, FAB mobile

api/                        # Backend (Express API REST)
├── index.ts                # Express app + helmet + rate-limit + CORS + rotas
├── db.ts                   # Pool PostgreSQL (SSL, max 20 conn, timeouts)
├── seed.sql                # Schema + dados iniciais (sem credenciais hardcoded)
├── middleware/
│   ├── auth.ts             # JWT (gera/valida tokens, JWT_SECRET obrigatorio)
│   └── roles.ts            # Middleware de roles (admin, operador, visualizador)
├── routes/
│   ├── auth.ts             # Login (bcrypt compare), register (admin only), /me, logout
│   ├── incidents.ts        # CRUD + filtros + paginacao
│   ├── kpis.ts             # GET/PUT KPIs
│   ├── tipos.ts            # CRUD tipos de ocorrencia
│   └── users.ts            # CRUD usuarios (admin only, bcrypt hash)
├── utils/
│   └── validation.ts       # Validadores centralizados (email, enums, length, ID)
└── migrations/
    ├── 001_hash_passwords.ts          # Migrar senhas texto plano para bcrypt
    └── 002_schema_constraints.sql     # CHECK constraints + indexes

docs/                       # Documentacao
├── architecture.md         # Arquitetura detalhada do sistema
├── decisions/              # ADRs (Architecture Decision Records)
└── PRD-SECURITY-HARDENING.md  # Auditoria de seguranca (23 vulnerabilidades)
```

---

## Como Rodar

### Pre-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- PostgreSQL (local ou VPS remota)
- Chave de API do [Google Gemini](https://ai.google.dev/) (opcional, para relatorios com IA)

### 1. Instalacao

```bash
git clone https://github.com/pedrormc/FireDash.git
cd FireDash
npm install
```

### 2. Configurar banco de dados

```bash
# Criar tabelas e dados iniciais
psql -U <usuario> -d bombeiros -f api/seed.sql

# Criar usuario admin (gerar hash bcrypt primeiro)
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('SUA_SENHA', 12).then(h => console.log(h))"

# Inserir admin no banco com o hash gerado
psql -U <usuario> -d bombeiros -c "INSERT INTO users (nome, email, senha, cargo, role) \
  VALUES ('Administrador', 'admin@bombeiros.gov.br', '\$2b\$12\$SEU_HASH', 'Administrador', 'admin')"
```

### 3. Configurar variaveis de ambiente

```bash
cp .env.example .env.local
```

Editar `.env.local`:

```env
# Banco de dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@host:5432/bombeiros"
DB_SSL="false"                    # "true" para VPS remota

# JWT (OBRIGATORIO — app falha sem essa variavel)
JWT_SECRET="sua-chave-secreta-forte"

# Servidor
PORT="3001"
CORS_ORIGIN="http://localhost:3000"  # OBRIGATORIO em producao

# Frontend (opcional em dev)
VITE_API_URL="http://localhost:3001/api"

# IA (opcional)
GEMINI_API_KEY="sua-chave-gemini"
```

> **Nota:** Se a senha do banco contiver caracteres especiais (`!`, `@`, `#`), eles devem ser URL-encoded na `DATABASE_URL`. Exemplo: `!` = `%21`, `@` = `%40`, `#` = `%23`.

### 4. Iniciar o projeto

```bash
# Terminal 1 — Backend
npm run api:dev     # http://localhost:3001

# Terminal 2 — Frontend
npm run dev         # http://localhost:3000
```

### 5. Verificar funcionamento

```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bombeiros.gov.br","senha":"SUA_SENHA"}'
```

### Todos os comandos

```bash
# Frontend
npm run dev        # Dev server
npm run build      # Build de producao
npm run preview    # Preview do build
npm run lint       # Type-check (tsc --noEmit)

# Backend
npm run api:dev    # API com hot reload
npm run api:start  # API sem hot reload

# Verificacao (rodar antes de commit)
npm run lint && npx tsc --noEmit -p api/tsconfig.json && npm run build
```

---

## API REST

Todas as rotas (exceto login e health) requerem header `Authorization: Bearer <token>`.

Respostas seguem envelope padronizado:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "mensagem" }
```

### Auth

| Metodo | Rota | Descricao | Acesso |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login (email + senha com bcrypt) | Publico |
| `POST` | `/api/auth/register` | Registrar usuario | Admin autenticado |
| `GET` | `/api/auth/me` | Dados do usuario logado | Autenticado |
| `POST` | `/api/auth/logout` | Logout | Autenticado |

### Ocorrencias

| Metodo | Rota | Descricao | Acesso |
|---|---|---|---|
| `GET` | `/api/incidents` | Listar (filtros + paginacao) | Autenticado |
| `GET` | `/api/incidents/:id` | Detalhes | Autenticado |
| `POST` | `/api/incidents` | Criar | Operador, Admin |
| `PUT` | `/api/incidents/:id` | Atualizar | Operador, Admin |
| `DELETE` | `/api/incidents/:id` | Remover | Operador, Admin |

**Filtros:** `?periodo=hoje|semana|mes` `?tipo=...` `?gravidade=...` `?status=...` `?search=...`

**Paginacao:** `?page=1&limit=50` — resposta inclui `meta: { total, page, limit, pages }`

### KPIs, Tipos e Usuarios

| Metodo | Rota | Descricao | Acesso |
|---|---|---|---|
| `GET` | `/api/kpis` | Listar KPIs | Autenticado |
| `PUT` | `/api/kpis/:id` | Atualizar KPI | Admin |
| `GET` | `/api/tipos` | Listar tipos ativos | Autenticado |
| `POST` | `/api/tipos` | Criar tipo | Admin |
| `DELETE` | `/api/tipos/:id` | Desativar tipo | Admin |
| `GET` | `/api/users` | Listar usuarios | Admin |
| `POST` | `/api/users` | Criar usuario | Admin |
| `PUT` | `/api/users/:id` | Editar usuario | Admin |
| `DELETE` | `/api/users/:id` | Desativar usuario | Admin |

---

## Autenticacao e Roles

JWT com bcrypt (cost 12) e 3 niveis de acesso:

| Role | Acesso |
|---|---|
| `admin` | Tudo + painel admin (CRUD usuarios, KPIs, tipos) |
| `operador` | Dashboard, Relatorios, Mapa, Configuracoes, CRUD ocorrencias |
| `visualizador` | Somente Dashboard (read-only) |

---

## Seguranca

| Medida | Implementacao |
|--------|--------------|
| Senhas | bcrypt (cost 12) — nunca texto plano |
| JWT | Secret obrigatorio via env var, token 24h |
| Rate limiting | Global: 100 req/15min, Auth: 10 req/15min |
| Headers | helmet (X-Content-Type-Options, X-Frame-Options, HSTS) |
| CORS | Origem obrigatoria em producao (sem wildcard) |
| Body limit | 10kb maximo |
| Queries | Parametrizadas ($1, $2...) — sem concatenacao |
| Colunas | SELECT explicito — nunca SELECT * |
| Erros | Mensagens genericas (sem ecoar input do usuario) |
| Anti-enumeracao | Resposta unica para todos os erros de login |
| Registro | Protegido — somente admin autenticado cria usuarios |
| Seed | Sem credenciais hardcoded no repositorio |
| Validacao | Modulo centralizado (email, enums, length, ID) |
| Banco | Pool configurado (max 20, idle 30s, connect timeout 5s) |

**Auditoria completa:** 23 vulnerabilidades identificadas, 21 corrigidas. Detalhes em `docs/PRD-SECURITY-HARDENING.md`.

---

## Arquitetura

SPA (Single Page Application) sem router library. Navegacao via estado `Page` no `App.tsx`.

```
AuthProvider (contexto global)
└── AppShell (verifica token)
    ├── LoginPage / RegisterPage
    └── AuthenticatedApp (carrega dados da API)
        ├── Sidebar (navegacao + user info + logout)
        ├── Topbar (titulo, tema, nome/cargo real, avatar)
        ├── Dashboard
        │   ├── KpiCards, ChartsSection, ZoneStatus
        │   └── IncidentTable (com update/delete)
        ├── RelatoriosPage (filtros + edicao de status)
        ├── MapaPage (mapa + side panel, responsivo)
        ├── ConfiguracoesPage
        ├── AdminPage (CRUD usuarios, admin only)
        ├── NovoAlertaModal (com LocationPicker)
        └── FAB mobile (Novo Alerta, admin/operador)
```

### Banco de Dados

4 tabelas: `users`, `incidents`, `kpis`, `tipos_ocorrencia`.

- Schema completo em `api/seed.sql`
- CHECK constraints para role, gravidade, status, hora
- Indexes para queries frequentes (status, data, tipo, gravidade)
- TIMESTAMPTZ para timestamps

### Design Tokens

Tema customizado Tailwind CSS v4 com tokens `fire-*`:

| Token | Cor | Uso |
|-------|-----|-----|
| `fire-dark` | #0f0c0c | Background principal |
| `fire-card` | #1a1616 | Cards |
| `fire-red` | #e11d48 | Acoes primarias, critico |
| `fire-orange` | #f59e0b | Gravidade alta |
| `fire-green` | #10b981 | Sucesso, finalizado |
| `fire-yellow` | #eab308 | Gravidade media |
| `fire-blue` | #3b82f6 | Em andamento |
| `fire-sidebar` | #141111 | Sidebar |
| `fire-muted` | #9ca3af | Texto secundario |

Suporta tema claro (`data-theme="light"`) com overrides automaticos.

---

## Roadmap

- [x] Frontend SPA com dashboard, mapa, graficos e relatorios
- [x] Backend API REST (Express + TypeScript)
- [x] Banco PostgreSQL com schema e seeds
- [x] Autenticacao JWT com 3 roles
- [x] CRUD completo (ocorrencias, KPIs, tipos, usuarios)
- [x] Deploy na Vercel (frontend + serverless)
- [x] Security hardening (bcrypt, helmet, rate-limit, validacao)
- [x] Mini-mapa para selecao de coordenadas
- [x] Edicao interativa de status
- [x] Responsividade mobile completa
- [x] Tokens de cor padronizados
- [ ] JWT em httpOnly cookies
- [ ] Testes automatizados (Vitest + Playwright)
- [ ] Notificacoes em tempo real (WebSocket)
- [ ] CI/CD pipeline

---

## Licenca

Este projeto e de uso privado.
