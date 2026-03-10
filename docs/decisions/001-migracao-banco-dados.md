# ADR-001: Migração de Mock Data para Banco de Dados Real

## Status
Proposta

## Contexto
O sistema atualmente usa dados mock em `src/data/mockData.ts` para todas as funcionalidades. Para uso em produção, precisamos de persistência real de dados.

## Dados Afetados
- Alertas e notificações
- KPIs (indicadores de desempenho)
- Incidentes por tipo
- Ocorrências de emergência

## Decisão
*A ser definida — escolha de banco de dados, ORM, e estratégia de API ainda em discussão.*

## Opções em Consideração
1. **SQLite (better-sqlite3)** — Já está como dependência no projeto. Simples, sem servidor externo.
2. **PostgreSQL** — Mais robusto para produção, suporte a concorrência.
3. **Supabase/Firebase** — BaaS com real-time, autenticação inclusa.

## Consequências
- Necessidade de criar camada de API (REST ou tRPC)
- Migração incremental: substituir um módulo de mock por vez
- Manter mock data como fallback durante desenvolvimento
