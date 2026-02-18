/**
 * Development headers utility
 * Only adds development-specific headers (like ngrok) in development mode
 */

const isDev = import.meta.env.DEV;

/**
 * Returns headers that should only be present in development
 * Currently includes ngrok-skip-browser-warning header
 */
export function getDevelopmentHeaders(): Record<string, string> {
  if (isDev) {
    return {
      'ngrok-skip-browser-warning': 'true',
    };
  }
  return {};
}
