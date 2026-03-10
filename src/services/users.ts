import { apiFetch } from './api';

export interface ApiUser {
  id: number;
  nome: string;
  email: string;
  cargo: string | null;
  role: 'admin' | 'operador' | 'visualizador';
  ativo: boolean;
  created_at: string;
}

export async function fetchUsers(): Promise<ApiUser[]> {
  return apiFetch<ApiUser[]>('/users');
}

export async function createUser(data: {
  nome: string;
  email: string;
  senha: string;
  cargo?: string;
  role?: string;
}): Promise<ApiUser> {
  return apiFetch<ApiUser>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(
  id: number,
  data: Partial<{ nome: string; email: string; senha: string; cargo: string; role: string; ativo: boolean }>,
): Promise<ApiUser> {
  return apiFetch<ApiUser>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deactivateUser(id: number): Promise<void> {
  await apiFetch(`/users/${id}`, { method: 'DELETE' });
}
