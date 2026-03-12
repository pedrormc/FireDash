# PRD — Migração para Banco de Dados e Autenticação

## Visão Geral

Migrar o sistema Bombeiros de dados mockados (`mockData.ts`) para um banco PostgreSQL hospedado em VPS própria, com API Node.js (Express) deployada na Vercel, e sistema de autenticação com login/senha e 3 níveis de acesso.

---

## Stack Definida

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Vite (já existente) |
| Backend/API | Node.js + Express (Vercel Serverless) |
| Banco de Dados | PostgreSQL (VPS própria) |
| Autenticação | Login/senha simples (sem hash inicial, sem provider externo) |
| Deploy API | Vercel (serverless functions) |
| Deploy Frontend | Vercel (SPA estática) |

---

## Níveis de Acesso (Roles)

| Role | Acesso | Rota |
|---|---|---|
| `admin` | Tudo + painel admin (`/admin`) — CRUD de usuários, configurações globais | Todas |
| `operador` | Dashboard, Relatórios, Mapa, Configurações pessoais, CRUD de ocorrências | Todas exceto `/admin` |
| `visualizador` | Somente Dashboard (read-only) | Apenas Dashboard |

---

## Estrutura do Banco de Dados

### Tabela: `users`

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `SERIAL` | PK | ID auto-incremento |
| `nome` | `VARCHAR(100)` | NOT NULL | Nome completo |
| `email` | `VARCHAR(150)` | UNIQUE, NOT NULL | Email (usado como login) |
| `senha` | `VARCHAR(100)` | NOT NULL | Senha em texto plano (fase 1) |
| `cargo` | `VARCHAR(100)` | | Cargo/função |
| `role` | `VARCHAR(20)` | NOT NULL, DEFAULT 'visualizador' | `admin`, `operador`, `visualizador` |
| `ativo` | `BOOLEAN` | DEFAULT true | Conta ativa/inativa |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Data de criação |

### Tabela: `incidents`

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `VARCHAR(20)` | PK | Ex: BMB-101 |
| `tipo` | `VARCHAR(50)` | NOT NULL | Tipo da ocorrência |
| `gravidade` | `VARCHAR(20)` | NOT NULL | Crítica, Alta, Média, Baixa |
| `bairro` | `VARCHAR(100)` | NOT NULL | Localização |
| `status` | `VARCHAR(30)` | NOT NULL | Em Andamento, Finalizado, Cancelada |
| `data` | `DATE` | NOT NULL | Data da ocorrência |
| `hora` | `INTEGER` | | 0-23 (opcional) |
| `descricao` | `TEXT` | | Detalhes da ocorrência |
| `latitude` | `DECIMAL(10,7)` | | Para exibição no mapa |
| `longitude` | `DECIMAL(10,7)` | | Para exibição no mapa |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Data de criação no sistema |

### Tabela: `kpis`

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `SERIAL` | PK | ID auto-incremento |
| `title` | `VARCHAR(50)` | NOT NULL | Nome do KPI |
| `value` | `VARCHAR(20)` | NOT NULL | Valor exibido |
| `subtitle` | `VARCHAR(100)` | | Texto auxiliar |
| `icon` | `VARCHAR(30)` | NOT NULL | Nome do ícone Lucide |
| `color` | `VARCHAR(20)` | NOT NULL | orange, blue, green, red |
| `ordem` | `INTEGER` | DEFAULT 0 | Ordem de exibição |

### Tabela: `tipos_ocorrencia`

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `SERIAL` | PK | ID auto-incremento |
| `nome` | `VARCHAR(50)` | UNIQUE, NOT NULL | Nome do tipo |
| `ativo` | `BOOLEAN` | DEFAULT true | Se aparece nas opções |

---

## Rotas da API

### Auth

| Método | Rota | Body | Resposta | Acesso |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | `{ email, senha }` | `{ token, user }` | Público |
| `GET` | `/api/auth/me` | — | `{ user }` | Autenticado |
| `POST` | `/api/auth/logout` | — | `{ ok }` | Autenticado |

> **Token:** JWT simples armazenado em `localStorage`. Enviado via header `Authorization: Bearer <token>`.

### Incidents

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/api/incidents` | Listar ocorrências (com query params para filtros) | Autenticado |
| `GET` | `/api/incidents/:id` | Detalhes de uma ocorrência | Autenticado |
| `POST` | `/api/incidents` | Criar nova ocorrência | Operador, Admin |
| `PUT` | `/api/incidents/:id` | Atualizar ocorrência | Operador, Admin |
| `DELETE` | `/api/incidents/:id` | Remover ocorrência | Operador, Admin |

**Query params para GET /api/incidents:**
- `?periodo=hoje|semana|mes`
- `?tipo=Incêndio Florestal`
- `?gravidade=Crítica`
- `?status=Em Andamento`
- `?search=BMB-101`

### KPIs

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/api/kpis` | Listar KPIs | Autenticado |
| `PUT` | `/api/kpis/:id` | Atualizar valor de KPI | Admin |

### Tipos de Ocorrência

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/api/tipos` | Listar tipos ativos | Autenticado |
| `POST` | `/api/tipos` | Criar novo tipo | Admin |
| `DELETE` | `/api/tipos/:id` | Desativar tipo | Admin |

### Usuários (Admin)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/api/users` | Listar todos os usuários | Admin |
| `POST` | `/api/users` | Criar usuário | Admin |
| `PUT` | `/api/users/:id` | Editar usuário (role, ativo, etc.) | Admin |
| `DELETE` | `/api/users/:id` | Desativar usuário | Admin |

---

## Estrutura de Arquivos (Backend)

```
api/
├── index.ts                  # Express app + export para Vercel
├── db.ts                     # Pool de conexão PostgreSQL
├── middleware/
│   ├── auth.ts               # Middleware JWT — verifica token
│   └── roles.ts              # Middleware de roles — verifica permissão
├── routes/
│   ├── auth.ts               # POST /login, GET /me, POST /logout
│   ├── incidents.ts          # CRUD ocorrências
│   ├── kpis.ts               # GET/PUT KPIs
│   ├── tipos.ts              # CRUD tipos de ocorrência
│   └── users.ts              # CRUD usuários (admin)
└── vercel.json               # Config de deploy Vercel
```

## Estrutura de Arquivos (Frontend — novos/alterados)

```
src/
├── services/
│   ├── api.ts                # Axios/fetch wrapper com baseURL e token
│   ├── auth.ts               # login(), logout(), getMe()
│   ├── incidents.ts          # getIncidents(), createIncident(), etc.
│   ├── kpis.ts               # getKpis()
│   └── users.ts              # getUsers(), createUser(), etc. (admin)
├── contexts/
│   └── AuthContext.tsx        # Context com user, token, login/logout
├── pages/
│   ├── LoginPage.tsx          # Tela de login
│   └── AdminPage.tsx          # Painel admin (CRUD usuários)
├── components/
│   └── ProtectedRoute.tsx     # Wrapper que verifica auth + role
└── data/
    └── mockData.ts            # Manter como fallback até migração completa
```

---

## Fluxo de Autenticação

```
1. Usuário acessa o app → verifica token no localStorage
2. Se não tem token → redireciona para LoginPage
3. LoginPage → POST /api/auth/login → recebe { token, user }
4. Salva token no localStorage, user no AuthContext
5. Redireciona para Dashboard (ou página permitida pelo role)
6. Toda requisição à API inclui header Authorization: Bearer <token>
7. Se token inválido/expirado → API retorna 401 → redireciona para login
```

---

## Regras de Acesso por Página

| Página | admin | operador | visualizador |
|---|---|---|---|
| Login | - | - | - |
| Dashboard | R | R | R |
| Relatórios | RW | RW | - |
| Mapa | R | R | - |
| Configurações | RW | RW (pessoal) | - |
| Admin | RW | - | - |

**R** = Read, **W** = Write/Edit, **-** = Sem acesso

---

## SQL de Setup (para rodar na VPS)

```sql
-- Criar banco
CREATE DATABASE bombeiros;

-- Conectar ao banco bombeiros, então:

-- Tabela de usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha VARCHAR(100) NOT NULL,
  cargo VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'visualizador',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de tipos de ocorrência
CREATE TABLE tipos_ocorrencia (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT true
);

-- Tabela de ocorrências
CREATE TABLE incidents (
  id VARCHAR(20) PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  gravidade VARCHAR(20) NOT NULL,
  bairro VARCHAR(100) NOT NULL,
  status VARCHAR(30) NOT NULL,
  data DATE NOT NULL,
  hora INTEGER,
  descricao TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de KPIs
CREATE TABLE kpis (
  id SERIAL PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  value VARCHAR(20) NOT NULL,
  subtitle VARCHAR(100),
  icon VARCHAR(30) NOT NULL,
  color VARCHAR(20) NOT NULL,
  ordem INTEGER DEFAULT 0
);

-- Usuário admin inicial
INSERT INTO users (nome, email, senha, cargo, role)
VALUES ('Administrador', 'admin@bombeiros.gov.br', 'admin123', 'Administrador do Sistema', 'admin');

-- Seed: Tipos de ocorrência
INSERT INTO tipos_ocorrencia (nome) VALUES
  ('Incêndio Florestal'),
  ('Incêndio Estrutural'),
  ('Incêndio Residencial'),
  ('Incêndio Comercial'),
  ('Acidente de Trânsito'),
  ('Resgate'),
  ('Vazamento de Gás'),
  ('Inundação'),
  ('Desabamento');

-- Seed: KPIs
INSERT INTO kpis (title, value, subtitle, icon, color, ordem) VALUES
  ('Chamados Ativos', '128', '+5% desde ontem', 'Flame', 'orange', 1),
  ('Taxa de Contenção', '84%', '-2% esta semana', 'Shield', 'blue', 2),
  ('Tempo de Resposta', '12m', 'média nos últimos 7 dias', 'Clock', 'green', 3),
  ('Zonas Críticas', '15', 'em monitoramento ativo', 'AlertTriangle', 'red', 4);
```

---

## Fases de Implementação

### Fase 1 — Backend + Banco 🔧
- [x] Configurar banco PostgreSQL na VPS
- [x] Rodar SQL de setup (tabelas + seeds) → arquivo `api/seed.sql` pronto
- [x] Criar projeto backend (Express + TypeScript)
- [x] Implementar conexão com banco (`api/db.ts`)
- [x] Implementar rotas de auth (`api/routes/auth.ts`) — login, me, logout
- [x] Implementar middleware JWT (`api/middleware/auth.ts`)
- [x] Implementar middleware de roles (`api/middleware/roles.ts`)
- [x] Implementar CRUD incidents (`api/routes/incidents.ts`)
- [x] Implementar CRUD KPIs (`api/routes/kpis.ts`)
- [x] Implementar CRUD tipos (`api/routes/tipos.ts`)
- [x] Implementar CRUD users (`api/routes/users.ts`)
- [x] Testar todas as rotas (manual ou Postman)

### Fase 2 — Frontend: Auth + Contexto ✅
- [x] Criar `services/api.ts` (fetch wrapper com token)
- [x] Criar `contexts/AuthContext.tsx`
- [x] Criar `LoginPage.tsx`
- [x] Criar `ProtectedRoute.tsx`
- [x] Integrar auth no `App.tsx` (verificar token ao iniciar)
- [x] Adicionar `'admin'` ao type `Page`
- [x] Bloquear navegação por role

### Fase 3 — Frontend: Migração de Dados ✅
- [x] Criar `services/incidents.ts` — substituir imports de mockData
- [x] Criar `services/kpis.ts`
- [x] Atualizar `App.tsx` — fetch incidents e kpis da API
- [x] Atualizar `KpiCards.tsx` — recebe kpis via props (da API)
- [x] Atualizar `RelatoriosPage.tsx` — recebe incidents via props (da API)
- [x] Atualizar `MapaPage.tsx` — recebe incidents da API (filtra por lat/lng)
- [x] Atualizar `NovoAlertaModal.tsx` — POST para API + tipos dinâmicos
- [x] Atualizar `IncidentModal.tsx` — DELETE via API (callback do App)
- [x] Atualizar `ConfiguracoesPage.tsx` — dados reais do user logado

### Fase 4 — Painel Admin ✅
- [x] Criar `AdminPage.tsx` — CRUD de usuários
- [x] Tabela de usuários com ações (editar role, ativar/desativar)
- [x] Formulário de criação de usuário
- [x] Integrar no Sidebar (visível só para admin — feito na Fase 2)

### Fase 5 — Deploy ✅
- [x] Configurar `vercel.json` para serverless functions
- [x] Configurar variáveis de ambiente na Vercel (DATABASE_URL, JWT_SECRET, DB_SSL, CORS_ORIGIN)
- [x] Deploy do backend na Vercel (serverless function Express)
- [x] Deploy do frontend na Vercel (SPA estática)
- [x] Testar fluxo completo em produção
- [x] Seed de dados iniciais no banco de produção (feito na Fase 1)

---

## Variáveis de Ambiente

### Backend (`.env`)
```
DATABASE_URL=postgresql://user:password@<VPS_IP>:5432/bombeiros
JWT_SECRET=<chave-secreta-qualquer>
PORT=3001
```

### Frontend (`.env.local`)
```
VITE_API_URL=http://localhost:3001/api   # dev
# VITE_API_URL=https://bombeiros-api.vercel.app/api  # prod
```

---

## Fase 6 — Funcionalidades + UI/UX (Março 2026) ✅

### Funcionalidades
- [x] `updateIncident()` no service layer (PUT /api/incidents/:id)
- [x] Tipos alinhados: `ApiIncident` em todos os componentes (antes usava `Incident` do mockData)
- [x] Fix z-index de modais: `z-50` → `z-[70]` (NovoAlertaModal, IncidentModal) — acima do bottom nav e mapa
- [x] Mini-mapa no formulário de criação (LocationPicker) — click para selecionar coordenadas + geolocalização
- [x] Edição interativa de status no IncidentModal (admin/operador) — botões "Editar"/"Salvar" com status selecionável
- [x] Status "Cancelada" suportado em filtros, tabelas e modais

### UI/UX
- [x] Topbar: nome e cargo do usuário real (via AuthContext), avatar com iniciais, removido search fake
- [x] Tokens `fire-yellow` e `fire-blue` adicionados ao tema — substituição de cores raw (`yellow-500`, `blue-400`)
- [x] MapaPage responsivo: layout empilha no mobile, side panel full-width, lista com scroll limitado
- [x] FAB mobile "Novo Alerta" (PlusCircle) — visível só para admin/operador, acima do bottom nav
- [x] NovoAlertaModal com scroll (`max-h-[90vh] overflow-y-auto`) para telas pequenas

### Novos Componentes
- `src/components/LocationPicker.tsx` — mini-mapa react-leaflet para seleção de coordenadas

---

## Decisões Técnicas

1. **Sem hash de senha (fase 1)** — simplifica o início. Migrar para bcrypt na fase de hardening.
2. **JWT em localStorage** — simples para SPA. Considerar httpOnly cookies futuramente.
3. **Alerts derivados de incidents** — não terão tabela própria, são os últimos 3 incidents com status "Em Andamento".
4. **IDs de incident como string** — mantém o padrão BMB-XXX já existente.
5. **KPIs estáticos** — armazenados no banco, editáveis pelo admin.
6. **Mapa** — incidents precisarão de lat/lng; os 60 markers do MapaPage serão migrados para a tabela incidents com coordenadas.
7. **LocationPicker** — mini-mapa reutilizável com react-leaflet, usa mesmo tile dark do CartoDB.
8. **Z-index hierarchy** — bottom nav: z-50, FAB: z-[60], modais: z-[70], Leaflet overlays: z-[1000].
