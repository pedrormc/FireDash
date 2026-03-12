-- =============================================
-- Migration 002: Schema Constraints e Indexes
-- Executar: psql -d bombeiros -f api/migrations/002_schema_constraints.sql
-- IMPORTANTE: Verificar dados existentes antes de aplicar
-- IMPORTANTE: Fazer backup do banco antes de executar
-- =============================================

-- Wrap em DO block para idempotência das constraints
DO $$
BEGIN
  -- Role constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_role') THEN
    ALTER TABLE users ADD CONSTRAINT check_role
      CHECK (role IN ('admin', 'operador', 'visualizador'));
    RAISE NOTICE 'Constraint check_role criada';
  ELSE
    RAISE NOTICE 'Constraint check_role já existe, pulando';
  END IF;

  -- Hora constraint (nullable — 0 a 23)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_hora') THEN
    ALTER TABLE incidents ADD CONSTRAINT check_hora
      CHECK (hora IS NULL OR (hora >= 0 AND hora <= 23));
    RAISE NOTICE 'Constraint check_hora criada';
  ELSE
    RAISE NOTICE 'Constraint check_hora já existe, pulando';
  END IF;

  -- Gravidade constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_gravidade') THEN
    ALTER TABLE incidents ADD CONSTRAINT check_gravidade
      CHECK (gravidade IN ('Baixa', 'Média', 'Alta', 'Crítica'));
    RAISE NOTICE 'Constraint check_gravidade criada';
  ELSE
    RAISE NOTICE 'Constraint check_gravidade já existe, pulando';
  END IF;

  -- Status constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_status') THEN
    ALTER TABLE incidents ADD CONSTRAINT check_status
      CHECK (status IN ('Em Andamento', 'Finalizado', 'Pendente'));
    RAISE NOTICE 'Constraint check_status criada';
  ELSE
    RAISE NOTICE 'Constraint check_status já existe, pulando';
  END IF;
END $$;

-- Timestamps: migrar de TIMESTAMP para TIMESTAMPTZ
-- Idempotente: se a coluna já é TIMESTAMPTZ, o USING converte sem erro
ALTER TABLE users ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
ALTER TABLE incidents ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';

-- Indexes para queries frequentes (IF NOT EXISTS é suportado nativamente)
CREATE INDEX IF NOT EXISTS idx_incidents_status    ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_data      ON incidents(data DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_tipo      ON incidents(tipo);
CREATE INDEX IF NOT EXISTS idx_incidents_gravidade ON incidents(gravidade);
CREATE INDEX IF NOT EXISTS idx_kpis_ordem          ON kpis(ordem);
CREATE INDEX IF NOT EXISTS idx_tipos_ativo         ON tipos_ocorrencia(ativo);
