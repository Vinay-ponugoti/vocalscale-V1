/**
 * Skills types for the hybrid chat system
 */

export type SkillCategory =
  | 'marketing'
  | 'sales'
  | 'communication'
  | 'analysis'
  | 'content';

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  icon: string;
  input_template?: string;
}

export interface SkillsResponse {
  skills: Skill[];
}
