import Constants from 'expo-constants';

/**
 * Base URL for the Wuzy backend.
 *
 * When running via the Expo dev server, hostUri is the machine that serves
 * the JS bundle (e.g. "192.168.1.10:8081"). We reuse its host with the
 * backend port so emulators and physical devices on the same network reach
 * the FastAPI server automatically.
 */
const devHost = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
export const API_URL = `http://${devHost}:8000`;

export const API_HEADERS = {
  'Content-Type': 'application/json',
};

export async function apiGet<T>(path: string, userId?: number): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: userId ? { ...API_HEADERS, 'X-User-Id': String(userId) } : API_HEADERS,
  });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown, userId?: number): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: userId ? { ...API_HEADERS, 'X-User-Id': String(userId) } : API_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`POST ${path} failed: ${res.status}`);
  }
  return res.json();
}

export async function uploadImage(kind: 'post' | 'avatar', uri: string, userId: number) {
  const filename = uri.split('/').pop() ?? 'upload.jpg';
  const form = new FormData();
  form.append('file', {
    uri,
    name: filename,
    type: 'image/jpeg',
  } as unknown as Blob);

  const res = await fetch(`${API_URL}/upload/${kind}`, {
    method: 'POST',
    headers: { 'X-User-Id': String(userId) },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }
  return res.json() as Promise<{ url: string; kind: string }>;
}

/** Turns a backend-relative path (e.g. /uploads/post/x.png) into a full URL. */
export function assetUrl(path: string): string {
  if (path.startsWith('http')) {
    return path;
  }
  return `${API_URL}${path}`;
}

export interface ApiUser {
  id: number;
  email: string;
  username: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ApiPost {
  id: number;
  media_url: string;
  caption: string | null;
  location: string | null;
  save_to_profile: boolean;
  user_id: number;
  created_at: string;
  user: ApiUser | null;
}
