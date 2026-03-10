# ADR-001: Migração de Mock Data para Banco de Dados Real

## Status
Aceita — Fase 1 (Backend + Banco) concluída, Fase 2 (Frontend Auth) em planejamento

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
- Frontend precisa de: services layer, auth context, login page, admin page
- Migração incremental: mock data mantido como fallback durante transição
- PRD com checklist de fases em `PRD.md`

## Progresso
- **Fase 1 (Backend):** Concluída — API funcional, banco PostgreSQL configurado na VPS, 40 testes manuais aprovados
- **Fase 2 (Frontend Auth):** Próximo passo
- **Fase 3 (Migração de Dados):** Pendente
- **Fase 4 (Painel Admin):** Pendente
- **Fase 5 (Deploy):** Pendente
