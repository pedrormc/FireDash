export const VALID_GRAVIDADES = ['Baixa', 'Média', 'Alta', 'Crítica'] as const;
export const VALID_STATUSES = ['Em Andamento', 'Finalizado', 'Pendente'] as const;
export const VALID_ROLES = ['admin', 'operador', 'visualizador'] as const;

export type Gravidade = typeof VALID_GRAVIDADES[number];
export type Status = typeof VALID_STATUSES[number];
export type Role = typeof VALID_ROLES[number];

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateStringLength(
  value: unknown,
  field: string,
  max: number
): string | null {
  if (typeof value !== 'string') return `${field} deve ser uma string`;
  const trimmed = value.trim();
  if (trimmed.length === 0) return `${field} não pode ser vazio`;
  if (trimmed.length > max) return `${field} excede o limite de ${max} caracteres`;
  return null;
}

export function isValidIncidentId(id: string): boolean {
  return /^BMB-\d+$/.test(id);
}

export function isValidGravidade(value: string): value is Gravidade {
  return (VALID_GRAVIDADES as readonly string[]).includes(value);
}

export function isValidStatus(value: string): value is Status {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

export function isValidRole(value: string): value is Role {
  return (VALID_ROLES as readonly string[]).includes(value);
}

export function isValidHora(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  const num = typeof value === 'number' ? value : parseInt(String(value), 10);
  return !isNaN(num) && num >= 0 && num <= 23;
}

export function isValidDate(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

export function isDuplicateKeyError(err: unknown): boolean {
  return err instanceof Error && 'code' in err && (err as Record<string, unknown>).code === '23505';
}
