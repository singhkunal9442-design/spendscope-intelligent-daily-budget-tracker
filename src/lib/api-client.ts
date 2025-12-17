import { ApiResponse } from "../../shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const mergedInit = {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  };
  const res = await fetch(path, mergedInit);
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok || !json.success || json.data === undefined) {
    console.error('API Error:', json.error || 'Request failed');
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}