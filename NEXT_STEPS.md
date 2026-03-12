# Próximos Passos — Bombeiros

## Estado Atual

**Todas as 6 fases do PRD estão concluídas.** O sistema está em produção em [https://firedash-bombeiros.vercel.app](https://firedash-bombeiros.vercel.app).

### Fases Concluídas

- **Fase 1 (Backend + Banco):** API REST Express + PostgreSQL na VPS. 40 testes manuais aprovados.
- **Fase 2 (Frontend Auth):** Login, AuthContext, ProtectedRoute, navegação por role.
- **Fase 3 (Migração de Dados):** Todos os componentes consomem dados reais da API (incidents, KPIs, tipos).
- **Fase 4 (Painel Admin):** AdminPage com CRUD completo de usuários.
- **Fase 5 (Deploy):** Frontend + backend na Vercel (serverless functions).
- **Fase 6 (Funcionalidades + UI/UX):** Mini-mapa no formulário, edição de status, tokens padronizados, responsividade, FAB mobile.

### O que mudou na Fase 6

| Feature | Descrição |
|---|---|
| `updateIncident()` | Service layer para PUT /api/incidents/:id |
| LocationPicker | Mini-mapa react-leaflet para seleção de coordenadas no formulário de criação |
| Edição de Status | IncidentModal permite alterar status (admin/operador) com botões selecionáveis |
| Z-index fix | Modais z-[70] (acima do bottom nav z-50 e mapa) |
| Topbar real | Nome e cargo do usuário logado, avatar com iniciais, search fake removido |
| Tokens | `fire-yellow` e `fire-blue` substituem cores raw (`yellow-500`, `blue-400`) |
| MapaPage responsivo | Layout empilha no mobile, side panel full-width |
| FAB mobile | Botão flutuante "Novo Alerta" no mobile (admin/operador) |
| Status "Cancelada" | Suportado em filtros, tabelas, modais e cores |
| Scroll modal | NovoAlertaModal com `max-h-[90vh] overflow-y-auto` |

## Melhorias Futuras

### Segurança (P0)
- [ ] Hash de senhas com bcrypt (atualmente texto plano)
- [ ] Migrar JWT de `localStorage` para httpOnly cookies
- [ ] Rate limiting nas rotas de auth
- [ ] CSRF protection

### Funcionalidades (P1)
- [ ] Notificações em tempo real (WebSocket)
- [ ] Exportação de relatórios em PDF/CSV funcional
- [ ] Filtros avançados no mapa (por tipo, gravidade, período)
- [ ] Edição de mais campos no IncidentModal (tipo, gravidade, bairro, descrição)
- [ ] Paginação na listagem de incidents

### Qualidade (P1)
- [ ] Testes automatizados (Vitest + Testing Library)
- [ ] CI/CD pipeline
- [ ] Monitoramento de erros (Sentry)

### Performance (P2)
- [ ] `SELECT *` → colunas específicas nas queries
- [ ] Code splitting (dynamic imports para páginas)
- [ ] Cache de dados com stale-while-revalidate

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
