# Próximos Passos — Bombeiros

## Estado Atual

**Fase 1 (Backend + Banco) — CONCLUÍDA**

O backend Express com API REST está 100% funcional e conectado ao PostgreSQL na VPS (`3.237.66.68`). Todas as 40 rotas foram testadas com sucesso, incluindo auth, CRUD completo, filtros, validações e controle de acesso por role.

## Próximo: Fase 2 — Frontend Auth + Contexto

### 2.1 Criar `src/services/api.ts`
- Fetch wrapper com `baseURL` da API (`VITE_API_URL`)
- Interceptor para incluir token JWT no header `Authorization`
- Tratamento de erro 401 (redirecionar para login)

### 2.2 Criar `src/contexts/AuthContext.tsx`
- Estado: `user`, `token`, `loading`
- Métodos: `login()`, `logout()`, `checkAuth()`
- Ao iniciar, verificar token no `localStorage` via `GET /api/auth/me`
- Expor via `useAuth()` hook

### 2.3 Criar `src/pages/LoginPage.tsx`
- Formulário: email + senha
- Chamar `POST /api/auth/login`
- Salvar token no `localStorage`, user no context
- Redirecionar para Dashboard após login
- Usar tokens `fire-*` do Tailwind

### 2.4 Criar `src/components/ProtectedRoute.tsx`
- Wrapper que verifica `isAuthenticated` e `role`
- Se não autenticado → redirecionar para login
- Se role insuficiente → redirecionar para Dashboard

### 2.5 Integrar auth no `App.tsx`
- Adicionar `'login'` e `'admin'` ao type `Page`
- Envolver app com `AuthProvider`
- Verificar token ao iniciar (loading state)
- Renderizar `LoginPage` se não autenticado

### 2.6 Bloquear navegação por role
- Sidebar: ocultar itens por role
- Operador: sem acesso a `/admin`
- Visualizador: apenas Dashboard

## Fases Futuras

### Fase 3 — Migração de Dados (Frontend)
- Criar services para incidents, kpis, tipos
- Substituir imports de `mockData.ts` por chamadas à API
- Atualizar todos os componentes que consomem dados

### Fase 4 — Painel Admin
- `AdminPage.tsx` com CRUD de usuários
- Tabela com ações (editar role, ativar/desativar)
- Formulário de criação de usuário

### Fase 5 — Deploy
- Configurar `vercel.json` para serverless
- Variáveis de ambiente na Vercel
- Deploy e teste em produção

## Referência Rápida de Rotas

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login | Público |
| `GET` | `/api/auth/me` | Dados do usuário logado | Autenticado |
| `POST` | `/api/auth/logout` | Logout | Autenticado |
| `GET` | `/api/incidents` | Listar ocorrências (filtros via query) | Autenticado |
| `GET` | `/api/incidents/:id` | Detalhes ocorrência | Autenticado |
| `POST` | `/api/incidents` | Criar ocorrência | Operador, Admin |
| `PUT` | `/api/incidents/:id` | Atualizar ocorrência | Operador, Admin |
| `DELETE` | `/api/incidents/:id` | Remover ocorrência | Operador, Admin |
| `GET` | `/api/kpis` | Listar KPIs | Autenticado |
| `PUT` | `/api/kpis/:id` | Atualizar KPI | Admin |
| `GET` | `/api/tipos` | Listar tipos | Autenticado |
| `POST` | `/api/tipos` | Criar tipo | Admin |
| `DELETE` | `/api/tipos/:id` | Desativar tipo | Admin |
| `GET` | `/api/users` | Listar usuários | Admin |
| `POST` | `/api/users` | Criar usuário | Admin |
| `PUT` | `/api/users/:id` | Editar usuário | Admin |
| `DELETE` | `/api/users/:id` | Desativar usuário | Admin |

## Credenciais Padrão (seed)
- **Email:** admin@bombeiros.gov.br
- **Senha:** admin123
- **Role:** admin
