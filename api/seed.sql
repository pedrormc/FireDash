-- =============================================
-- SEED: Banco de dados Bombeiros
-- Rodar na VPS após criar o banco "bombeiros"
-- =============================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  cargo VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'visualizador',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de tipos de ocorrência
CREATE TABLE IF NOT EXISTS tipos_ocorrencia (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT true
);

-- Tabela de ocorrências
CREATE TABLE IF NOT EXISTS incidents (
  id VARCHAR(20) PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  gravidade VARCHAR(20) NOT NULL,
  bairro VARCHAR(100) NOT NULL,
  status VARCHAR(30) NOT NULL,
  data DATE NOT NULL,
  hora INTEGER,
  descricao TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de KPIs
CREATE TABLE IF NOT EXISTS kpis (
  id SERIAL PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  value VARCHAR(20) NOT NULL,
  subtitle VARCHAR(100),
  icon VARCHAR(30) NOT NULL,
  color VARCHAR(20) NOT NULL,
  ordem INTEGER DEFAULT 0
);

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Usuario admin (IMPORTANTE: nunca hardcode senhas aqui)
-- Para criar o admin, gerar hash bcrypt e executar manualmente:
--   1. Gerar hash: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('SUA_SENHA_SEGURA', 12).then(h => console.log(h))"
--   2. Inserir: INSERT INTO users (nome, email, senha, cargo, role) VALUES
--      ('Administrador', 'admin@bombeiros.gov.br', '$2b$12$HASH_GERADO', 'Administrador do Sistema', 'admin');

-- Tipos de ocorrência
INSERT INTO tipos_ocorrencia (nome) VALUES
  ('Incêndio Florestal'),
  ('Incêndio Estrutural'),
  ('Incêndio Residencial'),
  ('Incêndio Comercial'),
  ('Acidente de Trânsito'),
  ('Resgate'),
  ('Vazamento de Gás'),
  ('Inundação'),
  ('Desabamento')
ON CONFLICT (nome) DO NOTHING;

-- KPIs
INSERT INTO kpis (title, value, subtitle, icon, color, ordem) VALUES
  ('Chamados Ativos', '128', '+5% desde ontem', 'Flame', 'orange', 1),
  ('Taxa de Contenção', '84%', '-2% esta semana', 'Shield', 'blue', 2),
  ('Tempo de Resposta', '12m', 'média nos últimos 7 dias', 'Clock', 'green', 3),
  ('Zonas Críticas', '15', 'em monitoramento ativo', 'AlertTriangle', 'red', 4)
ON CONFLICT DO NOTHING;

-- Ocorrências (migradas do mockData.ts)
INSERT INTO incidents (id, tipo, gravidade, bairro, status, data, hora, descricao) VALUES
  ('BMB-101', 'Incêndio Estrutural',    'Alta',    'Asa Norte',        'Em Andamento', '2026-03-06', 14, 'Incêndio em edifício residencial de 8 andares, 3 andares comprometidos.'),
  ('BMB-102', 'Acidente de Trânsito',   'Média',   'Eixo Monumental',  'Finalizado',   '2026-03-06', 9,  'Colisão entre dois veículos na via principal, uma vítima com ferimentos leves.'),
  ('BMB-103', 'Resgate',                'Crítica', 'Taguatinga',       'Em Andamento', '2026-03-06', 7,  'Pessoa presa em veículo após capotamento na BR-070.'),
  ('BMB-104', 'Vazamento de Gás',       'Alta',    'Asa Sul',          'Finalizado',   '2026-03-06', 11, 'Vazamento de GLP em restaurante comercial, área evacuada preventivamente.'),
  ('BMB-105', 'Incêndio Florestal',     'Crítica', 'Planaltina',       'Em Andamento', '2026-03-05', NULL, 'Incêndio de grande proporção atingindo área de cerrado nativo.'),
  ('BMB-106', 'Inundação',              'Alta',    'Ceilândia',        'Em Andamento', '2026-03-05', NULL, 'Chuvas intensas causaram alagamento em rua residencial.'),
  ('BMB-107', 'Desabamento',            'Crítica', 'Samambaia',        'Finalizado',   '2026-03-04', NULL, 'Desabamento parcial de muro após chuvas, sem vítimas.'),
  ('BMB-108', 'Acidente de Trânsito',   'Média',   'Guará',            'Finalizado',   '2026-03-04', NULL, 'Engavetamento com 3 veículos na EPIA, duas vítimas com ferimentos.'),
  ('BMB-109', 'Vazamento de Gás',       'Baixa',   'Lago Norte',       'Finalizado',   '2026-03-03', NULL, 'Pequeno vazamento em registro externo de residência, controlado rapidamente.'),
  ('BMB-110', 'Incêndio Residencial',   'Alta',    'Sobradinho',       'Em Andamento', '2026-03-03', NULL, 'Incêndio iniciado na cozinha se alastrou para dois cômodos.'),
  ('BMB-111', 'Resgate',                'Alta',    'Lago Sul',         'Em Andamento', '2026-03-02', NULL, 'Resgate de idoso em situação de risco em residência.'),
  ('BMB-112', 'Incêndio Comercial',     'Média',   'Cruzeiro',         'Finalizado',   '2026-03-01', NULL, 'Incêndio em estabelecimento comercial, controlado em 40 minutos.'),
  ('BMB-113', 'Incêndio Estrutural',    'Crítica', 'Noroeste',         'Em Andamento', '2026-02-28', NULL, 'Incêndio de alta intensidade em galpão industrial com risco de colapso.'),
  ('BMB-114', 'Incêndio Florestal',     'Crítica', 'Brazlândia',       'Em Andamento', '2026-02-25', NULL, 'Queimada de grande extensão atingindo reserva ambiental.'),
  ('BMB-115', 'Incêndio Residencial',   'Alta',    'Gama',             'Finalizado',   '2026-02-22', NULL, 'Curto-circuito elétrico causou incêndio no quarto da residência.'),
  ('BMB-116', 'Desabamento',            'Alta',    'Santa Maria',      'Finalizado',   '2026-02-20', NULL, 'Desabamento de laje em construção irregular, dois feridos leves.'),
  ('BMB-117', 'Inundação',              'Média',   'Riacho Fundo',     'Finalizado',   '2026-02-18', NULL, 'Transbordamento de córrego afetou 5 residências na área baixa.'),
  ('BMB-118', 'Acidente de Trânsito',   'Crítica', 'BR-020 KM 14',    'Em Andamento', '2026-02-15', NULL, 'Acidente com caminhão-tanque, risco de derramamento de produto químico.'),
  ('BMB-119', 'Incêndio Comercial',     'Alta',    'Taguatinga',       'Finalizado',   '2026-02-12', NULL, 'Incêndio em depósito de materiais inflamáveis, exigiu 3 viaturas.'),
  ('BMB-120', 'Resgate',                'Crítica', 'São Sebastião',    'Em Andamento', '2026-02-10', NULL, 'Resgate de vítima soterrada após deslizamento de terra.'),
  ('BMB-121', 'Incêndio Estrutural',    'Alta',    'Asa Norte',        'Finalizado',   '2026-02-08', NULL, 'Incêndio em apartamento do 5º andar, vizinhos evacuados preventivamente.'),
  ('BMB-122', 'Incêndio Florestal',     'Crítica', 'Planaltina',       'Em Andamento', '2026-02-05', NULL, 'Incêndio de origem criminosa suspeita em área de proteção ambiental.')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- CONSTRAINTS (aplicar via migration separada)
-- =============================================
-- ALTER TABLE users ADD CONSTRAINT check_role CHECK (role IN ('admin', 'operador', 'visualizador'));
-- ALTER TABLE incidents ADD CONSTRAINT check_hora CHECK (hora IS NULL OR (hora >= 0 AND hora <= 23));
-- ALTER TABLE incidents ADD CONSTRAINT check_gravidade CHECK (gravidade IN ('Baixa', 'Média', 'Alta', 'Crítica'));
-- ALTER TABLE incidents ADD CONSTRAINT check_status CHECK (status IN ('Em Andamento', 'Finalizado', 'Pendente'));
