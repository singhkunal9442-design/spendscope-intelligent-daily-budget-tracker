import { ApiResponse } from "../../shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // Get token from localStorage to include in Authorization header
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('spendscope-token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  if (token && token !== 'temp') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const mergedInit = {
    ...init,
    headers,
  };
  try {
    const res = await fetch(path, mergedInit);
    // Handle 401 Unauthorized globally
    if (res.status === 401) {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('spendscope-token');
        localStorage.removeItem('spendscope-user');
        // Simple window location for clean state reset
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
      }
      throw new Error('Session expired. Please login again.');
    }
    const json = (await res.json()) as ApiResponse<T>;
    if (!res.ok || !json.success || json.data === undefined) {
      const errorMsg = json.error || `HTTP ${res.status}: Request failed`;
      // Don't log if it's a routine fetch error during unmount
      if (errorMsg !== 'Failed to fetch') {
        console.error(`[API ERROR] ${mergedInit.method || 'GET'} ${path}:`, errorMsg);
      }
      throw new Error(errorMsg);
    }
    return json.data;
  } catch (error: any) {
    if (error.name !== 'AbortError' && error.message !== 'Failed to fetch') {
        console.error(`[API FETCH FAILED] ${mergedInit.method || 'GET'} ${path}:`, error);
    }
    throw error;
  }
}