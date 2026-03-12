import { apiFetch } from './api';
import type { Incident } from '../data/mockData';

export interface ApiIncident extends Incident {
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
}

interface FetchIncidentsParams {
  periodo?: string;
  tipo?: string;
  gravidade?: string;
  status?: string;
  search?: string;
}

export async function fetchIncidents(params?: FetchIncidentsParams): Promise<ApiIncident[]> {
  const query = new URLSearchParams();
  if (params?.periodo && params.periodo !== 'todos') query.set('periodo', params.periodo);
  if (params?.tipo && params.tipo !== 'Todos') query.set('tipo', params.tipo);
  if (params?.gravidade && params.gravidade !== 'Todas') query.set('gravidade', params.gravidade);
  if (params?.status && params.status !== 'Todos') query.set('status', params.status);
  if (params?.search) query.set('search', params.search);

  const qs = query.toString();
  return apiFetch<ApiIncident[]>(`/incidents${qs ? `?${qs}` : ''}`);
}

export async function createIncident(data: {
  id: string;
  tipo: string;
  gravidade: string;
  bairro: string;
  status: string;
  data: string;
  hora?: number;
  descricao?: string;
  latitude?: number;
  longitude?: number;
}): Promise<ApiIncident> {
  return apiFetch<ApiIncident>('/incidents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateIncident(
  id: string,
  data: Partial<{
    tipo: string;
    gravidade: string;
    bairro: string;
    status: string;
    data: string;
    hora: number;
    descricao: string;
    latitude: number;
    longitude: number;
  }>,
): Promise<ApiIncident> {
  return apiFetch<ApiIncident>(`/incidents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteIncident(id: string): Promise<void> {
  await apiFetch(`/incidents/${id}`, { method: 'DELETE' });
}
