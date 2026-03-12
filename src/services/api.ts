const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

/**
 * Checks whether a parsed JSON body uses the API envelope format
 * (`{ success: boolean, data: T }` or `{ data: T, meta: ... }`).
 * If so, returns the inner `data` value; otherwise returns the body as-is.
 */
function unwrapEnvelope<T>(body: unknown): T {
  if (
    body !== null &&
    typeof body === 'object' &&
    'data' in (body as Record<string, unknown>) &&
    ('success' in (body as Record<string, unknown>) || 'meta' in (body as Record<string, unknown>))
  ) {
    return (body as Record<string, unknown>).data as T;
  }
  return body as T;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
    throw new Error('Sessão expirada');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erro ${res.status}`);
  }

  const body: unknown = await res.json();
  return unwrapEnvelope<T>(body);
}
