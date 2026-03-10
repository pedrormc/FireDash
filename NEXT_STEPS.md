# Próximos Passos — Bombeiros

## Estado Atual

**Todas as 5 fases do PRD estão concluídas.** O sistema está em produção em [https://firedash-bombeiros.vercel.app](https://firedash-bombeiros.vercel.app).

### Fases Concluídas

- **Fase 1 (Backend + Banco):** API REST Express + PostgreSQL na VPS. 40 testes manuais aprovados.
- **Fase 2 (Frontend Auth):** Login, AuthContext, ProtectedRoute, navegação por role.
- **Fase 3 (Migração de Dados):** Todos os componentes consomem dados reais da API (incidents, KPIs, tipos).
- **Fase 4 (Painel Admin):** AdminPage com CRUD completo de usuários.
- **Fase 5 (Deploy):** Frontend + backend na Vercel (serverless functions).

## Melhorias Futuras

### Segurança
- [ ] Hash de senhas com bcrypt (atualmente texto plano)
- [ ] Migrar JWT de `localStorage` para httpOnly cookies
- [ ] Rate limiting nas rotas de auth

### Funcionalidades
- [ ] Tela de cadastro (registro de novos usuários)
- [ ] Edição de ocorrências (PUT via frontend)
- [ ] Notificações em tempo real (WebSocket)
- [ ] Exportação de relatórios em PDF
- [ ] Filtros avançados no mapa (por tipo, gravidade, período)

### Qualidade
- [ ] Testes automatizados (Vitest + Testing Library)
- [ ] CI/CD pipeline
- [ ] Monitoramento de erros (Sentry)

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
