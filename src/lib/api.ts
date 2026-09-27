import { Capacitor } from '@capacitor/core';

// Permanent Vercel production domain for native iOS/Android builds
const DEFAULT_REMOTE_BACKEND = 'https://genshitranslate.vercel.app';

/**
 * Resolves an API endpoint path.
 * When running inside a native iOS or Android WebView container via Capacitor,
 * relative paths like '/api/translate' are routed to the hosted backend server.
 * When running in standard web browsers, relative paths are preserved.
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (Capacitor.isNativePlatform()) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_REMOTE_BACKEND;
    return `${baseUrl.replace(/\/+$/, '')}${cleanEndpoint}`;
  }

  return cleanEndpoint;
}
