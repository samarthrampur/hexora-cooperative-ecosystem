// Centralized API Client for HEXORA Ecosystem

// Cloud-ready API base URL configuration:
// Uses import.meta.env.VITE_API_URL or defaults to local backend port 5000
const rawBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const API_BASE = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

export const getAssetUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const origin = API_BASE.endsWith('/api') ? API_BASE.slice(0, -4) : API_BASE;
  return `${origin}${cleanPath}`;
};

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('hexora_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = options.body instanceof FormData 
      ? { ...(localStorage.getItem('hexora_token') ? { Authorization: `Bearer ${localStorage.getItem('hexora_token')}` } : {}) }
      : { ...this.getHeaders(), ...options.headers };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
      }

      return data as T;
    } catch (err: any) {
      console.error(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService();
