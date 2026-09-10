import type { CopilotSurface } from '../types/chat';

export const COPILOT_OPEN_EVENT = 'vocalscale:open-copilot';

export interface CopilotOpenRequest {
  surface: CopilotSurface;
  entityId?: string;
  title?: string;
  prompt?: string;
}

export function openCopilot(request: CopilotOpenRequest) {
  window.dispatchEvent(new CustomEvent<CopilotOpenRequest>(COPILOT_OPEN_EVENT, { detail: request }));
}

export function surfaceForPath(pathname: string): CopilotSurface {
  if (/^\/dashboard\/calls\/[^/]+/.test(pathname)) return 'call_detail';
  if (pathname.startsWith('/dashboard/calls')) return 'calls';
  if (pathname.startsWith('/dashboard/contacts')) return 'contacts';
  if (pathname.startsWith('/dashboard/campaigns')) return 'campaigns';
  if (pathname.startsWith('/dashboard/appointments')) return 'appointments';
  if (pathname.startsWith('/dashboard/agents')) return 'agents';
  if (pathname.startsWith('/dashboard/knowledge')) return 'knowledge';
  if (pathname.startsWith('/dashboard/insights')) return 'performance';
  if (pathname === '/dashboard') return 'overview';
  return 'general';
}
