import { apiFetch } from './api';

export interface Kpi {
  id: number;
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: 'orange' | 'blue' | 'green' | 'red';
  ordem: number;
}

export async function fetchKpis(): Promise<Kpi[]> {
  return apiFetch<Kpi[]>('/kpis');
}
