# ADR-001: Migração de Mock Data para Banco de Dados Real

## Status
Concluída — Todas as 5 fases implementadas e deploy em produção

## Contexto
O sistema usava dados mock em `src/data/mockData.ts` para todas as funcionalidades. Para uso em produção, precisamos de persistência real de dados com autenticação.

## Dados Afetados
- Alertas e notificações (derivados de incidents)
- KPIs (indicadores de desempenho) — estáticos no banco
- Tipos de ocorrência
- Ocorrências de emergência (incidents)
- Usuários e autenticação

## Decisão
- **Banco:** PostgreSQL hospedado em VPS própria
- **API:** Node.js + Express (REST), deploy na Vercel como serverless
- **Auth:** JWT com login/senha simples (sem hash na fase 1)
- **Roles:** admin, operador, visualizador
- **Alerts:** Derivados dos últimos incidents "Em Andamento" (sem tabela própria)

## Estrutura do Banco
4 tabelas: `users`, `incidents`, `kpis`, `tipos_ocorrencia`. Schema em `api/seed.sql`.

## Consequências
- API REST completa criada em `api/` com CRUD para todos os recursos
- Middlewares de JWT e roles controlam acesso
- Frontend usa services layer (`src/services/`) para comunicar com a API
- AuthContext gerencia estado de autenticação global
- LoginPage como tela de entrada, ProtectedRoute para controle por role
- AdminPage com CRUD completo de usuários
- Mock data mantido apenas como referência de interfaces TypeScript
- PRD com checklist de fases em `PRD.md`

## Progresso
- **Fase 1 (Backend):** Concluída — API funcional, banco PostgreSQL configurado na VPS, 40 testes manuais aprovados
- **Fase 2 (Frontend Auth):** Concluída — LoginPage, AuthContext, ProtectedRoute, navegação por role
- **Fase 3 (Migração de Dados):** Concluída — Todos os componentes consomem dados reais da API
- **Fase 4 (Painel Admin):** Concluída — AdminPage com CRUD de usuários
- **Fase 5 (Deploy):** Concluída — Frontend + backend na Vercel, produção em https://firedash-bombeiros.vercel.app
