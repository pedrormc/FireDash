import { apiFetch } from './api';

export interface ApiAlert {
  id: number;
  incident_id: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
  incident_tipo: string | null;
  incident_gravidade: string | null;
  incident_bairro: string | null;
}

export async function fetchAlerts(): Promise<ApiAlert[]> {
  return apiFetch<ApiAlert[]>('/alerts');
}

export async function fetchAlertCount(): Promise<number> {
  const result = await apiFetch<{ count: number }>('/alerts/count');
  return result.count;
}

export async function dismissAlert(id: number): Promise<void> {
  await apiFetch(`/alerts/${id}/dismiss`, { method: 'PATCH' });
}

export async function dismissAllAlerts(): Promise<void> {
  await apiFetch('/alerts/dismiss-all', { method: 'PATCH' });
}
