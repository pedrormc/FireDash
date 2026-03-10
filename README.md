<div align="center">

# 🔥 FireDash — Sistema de Monitoramento de Ocorrências

**Painel de comando em tempo real para gestão de ocorrências do Corpo de Bombeiros**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)

</div>

---

## Sobre o Projeto

Sistema web para monitoramento e gestão de ocorrências do corpo de bombeiros, com dashboard interativo, mapa de calor, gráficos analíticos, geração de relatórios com IA (Gemini), API REST completa e autenticação com 3 níveis de acesso.

### Funcionalidades

- **Dashboard** — KPIs em tempo real, tabela de ocorrências, status do sistema e alertas ativos
- **Mapa Interativo** — Visualização georreferenciada de ocorrências com Leaflet
- **Relatórios** — Geração de relatórios analíticos com auxílio de IA (Google Gemini)
- **Gráficos** — Análises visuais de tendências e distribuição de ocorrências
- **Configurações** — Personalização do painel e preferências do usuário
- **Novo Alerta** — Cadastro rápido de novas ocorrências
- **API REST** — CRUD completo para ocorrências, KPIs, tipos e usuários
- **Autenticação** — Login com JWT e controle de acesso por role (admin, operador, visualizador)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Vite 6 |
| Backend/API | Node.js + Express + TypeScript |
| Banco de Dados | PostgreSQL (VPS) |
| Autenticação | JWT (login/senha, 3 roles) |
| Estilização | Tailwind CSS v4 (tema customizado `fire-*`) |
| Mapas | Leaflet + React-Leaflet |
| Gráficos | Recharts |
| Animações | Motion (Framer Motion) |
| Ícones | Lucide React |
| IA | Google GenAI SDK (Gemini) |

---

## Estrutura do Projeto

```
src/                        # Frontend (React SPA)
├── components/             # Componentes compartilhados
│   ├── Sidebar.tsx                # Navegação lateral
│   ├── Topbar.tsx                 # Barra superior dinâmica
│   ├── KpiCards.tsx               # Cards de indicadores
│   ├── MapSection.tsx             # Mapa interativo
│   ├── ChartsSection.tsx          # Gráficos analíticos
│   ├── SystemStatus.tsx           # Status do sistema
│   ├── IncidentTable.tsx          # Tabela de ocorrências
│   ├── IncidentModal.tsx          # Detalhes de ocorrência
│   ├── NovoAlertaModal.tsx        # Criar novo alerta
│   └── ZoneStatus.tsx             # Status por zona
├── pages/                  # Páginas da aplicação
│   ├── RelatoriosPage.tsx
│   ├── MapaPage.tsx
│   └── ConfiguracoesPage.tsx
├── data/                   # Dados mock e tipos
│   └── mockData.ts
└── App.tsx                 # Dashboard + navegação central

api/                        # Backend (Express API REST)
├── index.ts                # Entry point — Express app + rotas
├── db.ts                   # Pool de conexão PostgreSQL
├── seed.sql                # SQL de criação de tabelas + dados iniciais
├── middleware/
│   ├── auth.ts             # Middleware JWT (gera e valida tokens)
│   └── roles.ts            # Middleware de roles (admin, operador, visualizador)
└── routes/
    ├── auth.ts             # POST /login, GET /me, POST /logout
    ├── incidents.ts        # CRUD ocorrências + filtros
    ├── kpis.ts             # GET/PUT KPIs
    ├── tipos.ts            # CRUD tipos de ocorrência
    └── users.ts            # CRUD usuários (admin only)
```

---

## Como Rodar

### Pre-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- PostgreSQL (local ou VPS remota)
- Chave de API do [Google Gemini](https://ai.google.dev/) (para relatórios com IA)

### 1. Instalacao

```bash
# Clonar o repositório
git clone https://github.com/pedrormc/FireDash.git
cd FireDash

# Instalar dependências
npm install
```

### 2. Configurar banco de dados

Executar o SQL de setup no PostgreSQL para criar as tabelas e dados iniciais:

```bash
psql -U <usuario> -d bombeiros -f api/seed.sql
```

Ou copiar o conteudo de `api/seed.sql` e executar no seu client SQL.

### 3. Configurar variaveis de ambiente

```bash
cp .env.example .env.local
```

Editar `.env.local` com suas credenciais:

```env
# Banco de dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@host:5432/bombeiros"
DB_SSL="false"                    # "true" se usar SSL (VPS remota)

# JWT
JWT_SECRET="sua-chave-secreta"

# Servidor
PORT="3001"
CORS_ORIGIN="http://localhost:3000"

# Frontend
VITE_API_URL="http://localhost:3001/api"

# IA (opcional, para relatórios)
GEMINI_API_KEY="sua-chave-gemini"
```

> **Nota:** Se a senha do banco contiver caracteres especiais (`!`, `@`, `#`, etc.), eles devem ser URL-encoded na `DATABASE_URL`. Exemplo: `!` = `%21`, `@` = `%40`, `#` = `%23`.

### 4. Iniciar o projeto

```bash
# Terminal 1 — Backend (API)
npm run api:dev
# API rodando em http://localhost:3001

# Terminal 2 — Frontend
npm run dev
# App rodando em http://localhost:3000
```

### 5. Verificar funcionamento

```bash
# Health check da API
curl http://localhost:3001/api/health

# Login (credenciais padrão do seed)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bombeiros.gov.br","senha":"admin123"}'
```

### Todos os comandos

```bash
# Frontend
npm run dev        # Dev server em http://localhost:3000
npm run build      # Build de produção
npm run preview    # Preview do build
npm run lint       # Type-check (tsc --noEmit)

# Backend
npm run api:dev    # API com hot reload em http://localhost:3001
npm run api:start  # API sem hot reload
```

---

## API REST

Todas as rotas (exceto login e health) requerem autenticacao via header `Authorization: Bearer <token>`.

### Auth

| Metodo | Rota | Descricao | Acesso |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login (email + senha) | Publico |
| `GET` | `/api/auth/me` | Dados do usuario logado | Autenticado |
| `POST` | `/api/auth/logout` | Logout | Autenticado |

### Ocorrencias

| Metodo | Rota | Descricao | Acesso |
|---|---|---|---|
| `GET` | `/api/incidents` | Listar (com filtros via query params) | Autenticado |
| `GET` | `/api/incidents/:id` | Detalhes de uma ocorrencia | Autenticado |
| `POST` | `/api/incidents` | Criar ocorrencia | Operador, Admin |
| `PUT` | `/api/incidents/:id` | Atualizar ocorrencia | Operador, Admin |
| `DELETE` | `/api/incidents/:id` | Remover ocorrencia | Operador, Admin |

**Filtros:** `?periodo=hoje|semana|mes` `?tipo=...` `?gravidade=...` `?status=...` `?search=...`

### KPIs

| Metodo | Rota | Descricao | Acesso |
|---|---|---|---|
| `GET` | `/api/kpis` | Listar KPIs | Autenticado |
| `PUT` | `/api/kpis/:id` | Atualizar KPI | Admin |

### Tipos de Ocorrencia

| Metodo | Rota | Descricao | Acesso |
|---|---|---|---|
| `GET` | `/api/tipos` | Listar tipos ativos | Autenticado |
| `POST` | `/api/tipos` | Criar tipo | Admin |
| `DELETE` | `/api/tipos/:id` | Desativar tipo | Admin |

### Usuarios (Admin)

| Metodo | Rota | Descricao | Acesso |
|---|---|---|---|
| `GET` | `/api/users` | Listar usuarios | Admin |
| `POST` | `/api/users` | Criar usuario | Admin |
| `PUT` | `/api/users/:id` | Editar usuario | Admin |
| `DELETE` | `/api/users/:id` | Desativar usuario | Admin |

---

## Autenticacao e Roles

O sistema usa JWT com 3 niveis de acesso:

| Role | Acesso |
|---|---|
| `admin` | Tudo + painel admin (CRUD de usuarios, KPIs, tipos) |
| `operador` | Dashboard, Relatorios, Mapa, Configuracoes, CRUD de ocorrencias |
| `visualizador` | Somente Dashboard (read-only) |

### Credenciais padrao (seed)

| Campo | Valor |
|---|---|
| Email | `admin@bombeiros.gov.br` |
| Senha | `admin123` |
| Role | `admin` |

---

## Arquitetura

A aplicacao e uma **SPA (Single Page Application)** sem router library. A navegacao e controlada via estado `Page` no `App.tsx`, com o componente `Sidebar` disparando mudancas de pagina.

```
App.tsx (estado Page controla a navegação)
├── LoginPage (auth)
├── Dashboard (renderizado inline)
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

### Banco de Dados

4 tabelas: `users`, `incidents`, `kpis`, `tipos_ocorrencia`. Schema completo em `api/seed.sql`.

---

## Roadmap

- [x] Frontend SPA com dashboard, mapa, graficos e relatorios
- [x] Backend API REST (Express + TypeScript)
- [x] Banco PostgreSQL com schema e seeds
- [x] Autenticacao JWT com 3 roles
- [x] CRUD completo (ocorrencias, KPIs, tipos, usuarios)
- [x] Testes de todas as rotas da API (40 testes aprovados)
- [ ] Integracao frontend com API (substituir mock data)
- [ ] Tela de login e controle de acesso no frontend
- [ ] Painel administrativo (CRUD de usuarios)
- [ ] Deploy na Vercel (frontend + serverless functions)

---

## Licenca

Este projeto e de uso privado.
