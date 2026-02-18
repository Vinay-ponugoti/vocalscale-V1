/**
 * Hook for managing chat skills
 */

import { useQuery } from '@tanstack/react-query';
import { skillsApi } from '../api/skills';

export function useSkills() {
  const {
    data: skills = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['chat-skills'],
    queryFn: () => skillsApi.getSkills(),
    staleTime: 1000 * 60 * 30, // 30 minutes - skills don't change often
    gcTime: 1000 * 60 * 60, // 1 hour cache
  });

  return {
    skills,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

export function useSkill(skillId: string | null) {
  const {
    data: skill,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chat-skill', skillId],
    queryFn: () => skillsApi.getSkill(skillId!),
    enabled: !!skillId,
    staleTime: 1000 * 60 * 30,
  });

  return {
    skill,
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
