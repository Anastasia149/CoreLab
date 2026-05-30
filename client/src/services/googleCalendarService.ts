import $api from '../http';

export type GoogleCalendarStatus = {
  configured: boolean;
  connected: boolean;
  syncEnabled: boolean;
};

export async function fetchGoogleCalendarStatus(): Promise<GoogleCalendarStatus> {
  const { data } = await $api.get<GoogleCalendarStatus>('/schedule/google/status');
  return data;
}

export async function fetchGoogleCalendarAuthUrl(): Promise<string> {
  const { data } = await $api.get<{ url: string }>('/schedule/google/auth-url');
  return data.url;
}

export async function connectGoogleCalendar(code: string): Promise<{ syncEnabled: boolean; synced: number }> {
  const { data } = await $api.post<{ syncEnabled: boolean; synced: number }>('/schedule/google/connect', {
    code,
  });
  return data;
}

export type EnableGoogleCalendarSyncResult =
  | { configured: false; message: string }
  | { needsAuth: false; syncEnabled: true; synced: number }
  | { needsAuth: true; url: string };

export function isEnableSyncNotConfigured(
  result: EnableGoogleCalendarSyncResult
): result is { configured: false; message: string } {
  return 'configured' in result && result.configured === false;
}

export function isEnableSyncNeedsAuth(
  result: EnableGoogleCalendarSyncResult
): result is { needsAuth: true; url: string } {
  return 'needsAuth' in result && result.needsAuth === true;
}

export function isEnableSyncComplete(
  result: EnableGoogleCalendarSyncResult
): result is { needsAuth: false; syncEnabled: true; synced: number } {
  return 'synced' in result;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: { message?: string } } }).response?.data;
    if (data?.message) return data.message;
  }
  return fallback;
}

export { getApiErrorMessage };

export async function enableGoogleCalendarSync(): Promise<EnableGoogleCalendarSyncResult> {
  const { data } = await $api.post<EnableGoogleCalendarSyncResult>('/schedule/google/enable');
  return data;
}

export async function disconnectGoogleCalendarSync(): Promise<void> {
  await $api.post('/schedule/google/disconnect');
}

export function openGoogleOAuthPopup(url: string): Window | null {
  const width = 520;
  const height = 640;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  return window.open(
    url,
    'google-calendar-oauth',
    `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`
  );
}
