# Proximos Passos — Bombeiros

## Estado Atual

**Todas as 6 fases do PRD estao concluidas.** O sistema esta em producao em [https://firedash-bombeiros.vercel.app](https://firedash-bombeiros.vercel.app).

### Fases Concluidas

- **Fase 1 (Backend + Banco):** API REST Express + PostgreSQL na VPS. 40 testes manuais aprovados.
- **Fase 2 (Frontend Auth):** Login, AuthContext, ProtectedRoute, navegacao por role.
- **Fase 3 (Migracao de Dados):** Todos os componentes consomem dados reais da API (incidents, KPIs, tipos).
- **Fase 4 (Painel Admin):** AdminPage com CRUD completo de usuarios.
- **Fase 5 (Deploy):** Frontend + backend na Vercel (serverless functions).
- **Fase 6 (Funcionalidades + UI/UX):** Mini-mapa no formulario, edicao de status, tokens padronizados, responsividade, FAB mobile.

### Pos-Fase 6 — Melhorias Implementadas

| Feature | Descricao |
|---|---|
| Security Hardening | bcrypt, helmet, rate-limit, validacao centralizada, anti-enumeracao (21/23 vulns resolvidas) |
| Sistema de Notificacoes | Tabela `alerts`, API completa (GET/PATCH), NotificationPanel com badge e dismiss |
| 5 Status | Em Andamento, Finalizado, Pendente, Cancelada, Arquivado (migration 003) |
| Mapa: filtro ativos | Mapa exibe apenas incidents Em Andamento + Pendente |
| Mapa: isolate fix | Wrapper usa `isolation: isolate` para conter z-indexes do Leaflet |
| Cores CSS vars | Markers Leaflet usam `getComputedStyle()` com CSS vars (respeitam tema) |
| Status colors util | `src/utils/statusColors.ts` centraliza cores de status e gravidade |
| Paginacao | GET /incidents com LIMIT/OFFSET e meta (total, page, limit, pages) |
| Responsividade | Bottom tab bar, FAB mobile, layout adaptativo em todas as paginas |

## Melhorias Futuras

### Seguranca (P0)

- [ ] Migrar JWT de `localStorage` para httpOnly cookies
- [ ] CSRF protection (depende de httpOnly cookies)
- [ ] DB SSL com certificado validado (atualmente `rejectUnauthorized: false`)

### Funcionalidades (P1)

- [ ] Notificacoes em tempo real (WebSocket)
- [ ] Exportacao de relatorios em PDF/CSV funcional
- [ ] Filtros avancados no mapa (por tipo, gravidade, periodo)
- [ ] Edicao de mais campos no IncidentModal (tipo, gravidade, bairro, descricao)

### Qualidade (P1)

- [ ] Testes automatizados (Vitest + Testing Library)
- [ ] Testes E2E (Playwright)
- [ ] CI/CD pipeline
- [ ] Monitoramento de erros (Sentry)

### Performance (P2)

- [ ] Code splitting (dynamic imports para paginas)
- [ ] Cache de dados com stale-while-revalidate

## Referencia Rapida de Rotas

| Metodo | Rota | Descricao | Acesso |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login | Publico |
| `POST` | `/api/auth/register` | Registrar usuario | Admin |
| `GET` | `/api/auth/me` | Dados do usuario logado | Autenticado |
| `POST` | `/api/auth/logout` | Logout | Autenticado |
| `GET` | `/api/incidents` | Listar ocorrencias (filtros + paginacao) | Autenticado |
| `GET` | `/api/incidents/:id` | Detalhes ocorrencia | Autenticado |
| `POST` | `/api/incidents` | Criar ocorrencia | Operador, Admin |
| `PUT` | `/api/incidents/:id` | Atualizar ocorrencia | Operador, Admin |
| `DELETE` | `/api/incidents/:id` | Remover ocorrencia | Operador, Admin |
| `GET` | `/api/kpis` | Listar KPIs | Autenticado |
| `PUT` | `/api/kpis/:id` | Atualizar KPI | Admin |
| `GET` | `/api/tipos` | Listar tipos | Autenticado |
| `POST` | `/api/tipos` | Criar tipo | Admin |
| `DELETE` | `/api/tipos/:id` | Desativar tipo | Admin |
| `GET` | `/api/users` | Listar usuarios | Admin |
| `POST` | `/api/users` | Criar usuario | Admin |
| `PUT` | `/api/users/:id` | Editar usuario | Admin |
| `DELETE` | `/api/users/:id` | Desativar usuario | Admin |
| `GET` | `/api/alerts` | Listar alertas ativos | Autenticado |
| `GET` | `/api/alerts/count` | Contar alertas ativos | Autenticado |
| `PATCH` | `/api/alerts/:id/dismiss` | Dispensar alerta | Operador, Admin |
| `PATCH` | `/api/alerts/dismiss-all` | Dispensar todos | Operador, Admin |
