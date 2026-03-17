-- Migration 003: Alerts table + status constraint update
-- Run: psql $DATABASE_URL -f api/migrations/003_alerts_and_status.sql

-- 1. Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  incident_id VARCHAR(20) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL DEFAULT 'new_incident',
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed_by INTEGER REFERENCES users(id),
  dismissed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_incident ON alerts(incident_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);

ALTER TABLE alerts DROP CONSTRAINT IF EXISTS check_alert_status;
ALTER TABLE alerts ADD CONSTRAINT check_alert_status CHECK (status IN ('active', 'dismissed'));

-- 2. Update incidents status constraint to include Cancelada and Arquivado
ALTER TABLE incidents DROP CONSTRAINT IF EXISTS check_status;
ALTER TABLE incidents ADD CONSTRAINT check_status
  CHECK (status IN ('Em Andamento', 'Finalizado', 'Pendente', 'Cancelada', 'Arquivado'));
