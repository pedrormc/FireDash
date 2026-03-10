export interface Incident {
  id: string;
  tipo: string;
  gravidade: string;
  bairro: string;
  status: string;
  data: string; // YYYY-MM-DD
  hora?: number; // 0-23
  descricao?: string;
}

export const TIPOS_OCORRENCIA = [
  'Incêndio Florestal',
  'Incêndio Estrutural',
  'Incêndio Residencial',
  'Incêndio Comercial',
  'Acidente de Trânsito',
  'Resgate',
  'Vazamento de Gás',
  'Inundação',
  'Desabamento',
];

export const alerts = [
  {
    id: '#1284',
    location: 'Setor Norte',
    time: '14:32',
    title: 'Incêndio Florestal em curso',
    status: 'Em Progresso',
    statusColor: 'fire-red'
  },
  {
    id: '#1282',
    location: 'Centro Histórico',
    time: '12:15',
    title: 'Curto-circuito Comercial',
    status: 'Atendimento',
    statusColor: 'fire-orange'
  },
  {
    id: '#1279',
    location: 'BR-101 KM 42',
    time: '09:44',
    title: 'Acidente com Carga Inflamável',
    status: 'Resolvido',
    statusColor: 'fire-green'
  }
];

export const kpis = [
  {
    title:    'Chamados Ativos',
    value:    '128',
    subtitle: '+5% desde ontem',
    icon:     'Flame',
    color:    'orange' as const,
  },
  {
    title:    'Taxa de Contenção',
    value:    '84%',
    subtitle: '-2% esta semana',
    icon:     'Shield',
    color:    'blue' as const,
  },
  {
    title:    'Tempo de Resposta',
    value:    '12m',
    subtitle: 'média nos últimos 7 dias',
    icon:     'Clock',
    color:    'green' as const,
  },
  {
    title:    'Zonas Críticas',
    value:    '15',
    subtitle: 'em monitoramento ativo',
    icon:     'AlertTriangle',
    color:    'red' as const,
  },
];

// TODAY = 2026-03-06
// Semana: >= 2026-02-27
// Mês:    >= 2026-02-04
export const emergencyIncidents: Incident[] = [
  // --- Hoje (2026-03-06) ---
  { id: 'BMB-101', tipo: 'Incêndio Estrutural',    gravidade: 'Alta',    bairro: 'Asa Norte',        status: 'Em Andamento', data: '2026-03-06', hora: 14, descricao: 'Incêndio em edifício residencial de 8 andares, 3 andares comprometidos.' },
  { id: 'BMB-102', tipo: 'Acidente de Trânsito',   gravidade: 'Média',   bairro: 'Eixo Monumental',  status: 'Finalizado',   data: '2026-03-06', hora: 9,  descricao: 'Colisão entre dois veículos na via principal, uma vítima com ferimentos leves.' },
  { id: 'BMB-103', tipo: 'Resgate',                gravidade: 'Crítica', bairro: 'Taguatinga',       status: 'Em Andamento', data: '2026-03-06', hora: 7,  descricao: 'Pessoa presa em veículo após capotamento na BR-070.' },
  { id: 'BMB-104', tipo: 'Vazamento de Gás',       gravidade: 'Alta',    bairro: 'Asa Sul',          status: 'Finalizado',   data: '2026-03-06', hora: 11, descricao: 'Vazamento de GLP em restaurante comercial, área evacuada preventivamente.' },

  // --- Esta semana (2026-02-28 a 2026-03-05) ---
  { id: 'BMB-105', tipo: 'Incêndio Florestal',     gravidade: 'Crítica', bairro: 'Planaltina',       status: 'Em Andamento', data: '2026-03-05', descricao: 'Incêndio de grande proporção atingindo área de cerrado nativo.' },
  { id: 'BMB-106', tipo: 'Inundação',              gravidade: 'Alta',    bairro: 'Ceilândia',        status: 'Em Andamento', data: '2026-03-05', descricao: 'Chuvas intensas causaram alagamento em rua residencial.' },
  { id: 'BMB-107', tipo: 'Desabamento',            gravidade: 'Crítica', bairro: 'Samambaia',        status: 'Finalizado',   data: '2026-03-04', descricao: 'Desabamento parcial de muro após chuvas, sem vítimas.' },
  { id: 'BMB-108', tipo: 'Acidente de Trânsito',   gravidade: 'Média',   bairro: 'Guará',            status: 'Finalizado',   data: '2026-03-04', descricao: 'Engavetamento com 3 veículos na EPIA, duas vítimas com ferimentos.' },
  { id: 'BMB-109', tipo: 'Vazamento de Gás',       gravidade: 'Baixa',   bairro: 'Lago Norte',       status: 'Finalizado',   data: '2026-03-03', descricao: 'Pequeno vazamento em registro externo de residência, controlado rapidamente.' },
  { id: 'BMB-110', tipo: 'Incêndio Residencial',   gravidade: 'Alta',    bairro: 'Sobradinho',       status: 'Em Andamento', data: '2026-03-03', descricao: 'Incêndio iniciado na cozinha se alastrou para dois cômodos.' },
  { id: 'BMB-111', tipo: 'Resgate',                gravidade: 'Alta',    bairro: 'Lago Sul',         status: 'Em Andamento', data: '2026-03-02', descricao: 'Resgate de idoso em situação de risco em residência.' },
  { id: 'BMB-112', tipo: 'Incêndio Comercial',     gravidade: 'Média',   bairro: 'Cruzeiro',         status: 'Finalizado',   data: '2026-03-01', descricao: 'Incêndio em estabelecimento comercial, controlado em 40 minutos.' },
  { id: 'BMB-113', tipo: 'Incêndio Estrutural',    gravidade: 'Crítica', bairro: 'Noroeste',         status: 'Em Andamento', data: '2026-02-28', descricao: 'Incêndio de alta intensidade em galpão industrial com risco de colapso.' },

  // --- Este mês (2026-02-04 a 2026-02-27) ---
  { id: 'BMB-114', tipo: 'Incêndio Florestal',     gravidade: 'Crítica', bairro: 'Brazlândia',       status: 'Em Andamento', data: '2026-02-25', descricao: 'Queimada de grande extensão atingindo reserva ambiental.' },
  { id: 'BMB-115', tipo: 'Incêndio Residencial',   gravidade: 'Alta',    bairro: 'Gama',             status: 'Finalizado',   data: '2026-02-22', descricao: 'Curto-circuito elétrico causou incêndio no quarto da residência.' },
  { id: 'BMB-116', tipo: 'Desabamento',            gravidade: 'Alta',    bairro: 'Santa Maria',      status: 'Finalizado',   data: '2026-02-20', descricao: 'Desabamento de laje em construção irregular, dois feridos leves.' },
  { id: 'BMB-117', tipo: 'Inundação',              gravidade: 'Média',   bairro: 'Riacho Fundo',     status: 'Finalizado',   data: '2026-02-18', descricao: 'Transbordamento de córrego afetou 5 residências na área baixa.' },
  { id: 'BMB-118', tipo: 'Acidente de Trânsito',   gravidade: 'Crítica', bairro: 'BR-020 KM 14',     status: 'Em Andamento', data: '2026-02-15', descricao: 'Acidente com caminhão-tanque, risco de derramamento de produto químico.' },
  { id: 'BMB-119', tipo: 'Incêndio Comercial',     gravidade: 'Alta',    bairro: 'Taguatinga',       status: 'Finalizado',   data: '2026-02-12', descricao: 'Incêndio em depósito de materiais inflamáveis, exigiu 3 viaturas.' },
  { id: 'BMB-120', tipo: 'Resgate',                gravidade: 'Crítica', bairro: 'São Sebastião',    status: 'Em Andamento', data: '2026-02-10', descricao: 'Resgate de vítima soterrada após deslizamento de terra.' },
  { id: 'BMB-121', tipo: 'Incêndio Estrutural',    gravidade: 'Alta',    bairro: 'Asa Norte',        status: 'Finalizado',   data: '2026-02-08', descricao: 'Incêndio em apartamento do 5º andar, vizinhos evacuados preventivamente.' },
  { id: 'BMB-122', tipo: 'Incêndio Florestal',     gravidade: 'Crítica', bairro: 'Planaltina',       status: 'Em Andamento', data: '2026-02-05', descricao: 'Incêndio de origem criminosa suspeita em área de proteção ambiental.' },
];
