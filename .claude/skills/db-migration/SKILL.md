# Skill: Database Migration

Workflow para mudancas de schema no PostgreSQL. Use o ECC skill **database-migrations** para patterns avancados.

## Quando usar

Quando precisar alterar tabelas, colunas, indices ou constraints no banco. Invocar via `/db-migration`.

## Workflow

### 1. Planejar a migracao
- Descrever a mudanca: ALTER TABLE, CREATE TABLE, ADD COLUMN, etc.
- Verificar dependencias: quais API routes e interfaces TypeScript sao afetadas
- Para mudancas grandes: usar agent **planner**
- Avaliar se precisa de migracao de dados (DML alem de DDL)

### 2. Escrever o SQL
- Criar arquivo `api/migrations/NNN-descricao.sql` (NNN = numero sequencial)
- Usar `IF NOT EXISTS` / `IF EXISTS` para idempotencia
- Incluir rollback comentado no final do arquivo
- Testar SQL em isolamento antes de aplicar

```sql
-- Exemplo de migracao
BEGIN;

ALTER TABLE incidents ADD COLUMN IF NOT EXISTS prioridade VARCHAR(20) DEFAULT 'media';

-- Rollback: ALTER TABLE incidents DROP COLUMN IF EXISTS prioridade;

COMMIT;
```

### 3. Atualizar seed.sql
- Refletir o novo schema em `api/seed.sql`
- Manter dados de seed atualizados
- Garantir que seed.sql continua idempotente

### 4. Atualizar TypeScript (Todas as Camadas)
- [ ] Interfaces em `src/data/` para novas colunas
- [ ] API routes em `api/routes/` para queries alteradas
- [ ] Services em `src/services/` se payload mudou
- [ ] Componentes frontend se exibem dados novos
- Rodar `/db-check` para verificar consistencia

### 5. Verificar localmente
```bash
# Verificar tipos (frontend + backend)
npm run lint
npx tsc --noEmit -p api/tsconfig.json

# Build
npm run build

# Testes (quando configurado)
npm run test -- --run

# Testar API manualmente
npm run api:dev
# curl endpoints afetados
```

### 6. Documentar
- Atualizar `PRD.md` secao de schema se necessario
- Criar ADR em `docs/decisions/` se for mudanca significativa

### 7. Aplicar em producao
- Rodar SQL na VPS `3.237.66.68` (user: `bombeiros_app`, db: `bombeiros`)
- Verificar API health apos migracao: `GET /api/health`
- Testar endpoints afetados em producao
- Monitorar logs por 15 minutos apos aplicar

### 8. Rollback (se necessario)
- Ter o SQL de rollback pronto antes de aplicar
- Testar rollback em ambiente de dev primeiro
- Em caso de erro: aplicar rollback imediatamente e investigar

## Agents de Suporte

- **planner** — Para planejar migracoes complexas
- **database-reviewer** (ECC) — Para review de queries e schema
