/**
 * Skills API client
 */

import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';
import { getStoredSessionSync } from '../utils/sessionUtils';
import type { Skill, SkillsResponse } from '../types/skills';

const KNOWLEDGE_URL = env.KNOWLEDGE_API_URL;

class SkillsAPI {
  private getUserId(): string | undefined {
    try {
      const session = getStoredSessionSync();
      return session?.user?.id;
    } catch {
      return undefined;
    }
  }

  /**
   * Get all available skills
   */
  async getSkills(): Promise<Skill[]> {
    const userId = this.getUserId();
    const headers = await getAuthHeader(userId);

    const response = await fetch(`${KNOWLEDGE_URL}/chat/skills`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to load skills' }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    const data: SkillsResponse = await response.json();
    return data.skills;
  }

  /**
   * Get a specific skill by ID
   */
  async getSkill(skillId: string): Promise<Skill> {
    const userId = this.getUserId();
    const headers = await getAuthHeader(userId);

    const response = await fetch(`${KNOWLEDGE_URL}/chat/skills/${skillId}`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Skill not found' }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

export const skillsApi = new SkillsAPI();
