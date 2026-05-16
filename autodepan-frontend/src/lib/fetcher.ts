import { API_URL, DEFAULT_HEADERS } from '@/config/api';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { queryClient } from '@/lib/queryClient';

export class ApiError extends Error {
  constructor(
    public status:  number,
    public message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

function buildURL(path: string, params?: FetchOptions['params']): string {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

export async function fetcher<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, headers, body, ...rest } = options;

  const token = store.getState().auth.token;

  const requestHeaders: Record<string, string> = {
    ...DEFAULT_HEADERS,
    ...(headers as Record<string, string>),
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Pour FormData on laisse le browser définir le Content-Type (multipart boundary)
  if (body instanceof FormData) {
    delete requestHeaders['Content-Type'];
  }

  const response = await fetch(buildURL(path, params), {
    ...rest,
    headers: requestHeaders,
    body,
  });

  // Token expiré — déconnexion automatique + arrêt de toutes les queries
  if (response.status === 401) {
    queryClient.cancelQueries();
    queryClient.clear();
    store.dispatch(logout());
    throw new ApiError(401, 'Session expirée, veuillez vous reconnecter.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message ?? 'Une erreur est survenue.',
      data.errors,
    );
  }

  return data as T;
}

// Raccourcis
export const api = {
  get<T>(path: string, params?: FetchOptions['params']) {
    return fetcher<T>(path, { method: 'GET', params });
  },
  post<T>(path: string, body: unknown) {
    return fetcher<T>(path, {
      method: 'POST',
      body:   body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  put<T>(path: string, body: unknown) {
    return fetcher<T>(path, {
      method: 'PUT',
      body:   JSON.stringify(body),
    });
  },
  patch<T>(path: string, body: unknown) {
    return fetcher<T>(path, {
      method: 'PATCH',
      body:   JSON.stringify(body),
    });
  },
  delete<T>(path: string) {
    return fetcher<T>(path, { method: 'DELETE' });
  },
};
