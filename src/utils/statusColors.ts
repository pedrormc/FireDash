export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'em andamento': return 'text-fire-blue bg-fire-blue/20';
    case 'finalizado':   return 'text-fire-green bg-fire-green/20';
    case 'cancelada':    return 'text-fire-red bg-fire-red/20';
    case 'pendente':     return 'text-fire-orange bg-fire-orange/20';
    case 'arquivado':    return 'text-fire-muted bg-fire-muted/20';
    default:             return 'text-slate-400 bg-slate-400/20';
  }
}

export function getSeverityColor(gravidade: string): string {
  switch (gravidade.toLowerCase()) {
    case 'crítica': return 'text-fire-red bg-fire-red/20';
    case 'alta':    return 'text-fire-orange bg-fire-orange/20';
    case 'média':   return 'text-fire-yellow bg-fire-yellow/20';
    case 'baixa':   return 'text-fire-green bg-fire-green/20';
    default:        return 'text-slate-400 bg-slate-400/20';
  }
}

export function getSeverityColorWithBorder(gravidade: string): string {
  switch (gravidade.toLowerCase()) {
    case 'crítica': return 'text-fire-red bg-fire-red/20 border-fire-red';
    case 'alta':    return 'text-fire-orange bg-fire-orange/20 border-fire-orange';
    case 'média':   return 'text-fire-yellow bg-fire-yellow/20 border-fire-yellow';
    case 'baixa':   return 'text-fire-green bg-fire-green/20 border-fire-green';
    default:        return 'text-slate-400 bg-slate-400/20 border-slate-400';
  }
}
