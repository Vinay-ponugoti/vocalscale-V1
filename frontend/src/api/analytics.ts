/**
 * Chat Analytics API client
 */

import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';
import { getStoredSession } from '../utils/sessionUtils';
import type { ChatAnalytics } from '../types/analytics';

const KNOWLEDGE_URL = env.KNOWLEDGE_API_URL;

class AnalyticsAPI {
  private getUserId(): string | undefined {
    try {
      const session = getStoredSession();
      return session?.user?.id;
    } catch {
      return undefined;
    }
  }

  /**
   * Get chat analytics for the dashboard
   */
  async getChatAnalytics(days: number = 7): Promise<ChatAnalytics> {
    const userId = this.getUserId();
    const headers = await getAuthHeader(userId);

    const response = await fetch(
      `${KNOWLEDGE_URL}/chat/analytics?days=${days}`,
      { headers }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to load analytics' }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

export const analyticsApi = new AnalyticsAPI();
