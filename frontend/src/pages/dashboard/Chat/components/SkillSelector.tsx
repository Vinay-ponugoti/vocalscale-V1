/**
 * Skill Selector Component
 * Clean, modern pills UI for selecting business development skills
 */

import React, { useState } from 'react';
import { useSkills } from '../../../../hooks/useSkills';
import type { Skill } from '../../../../types/skills';
import {
  Mail,
  Megaphone,
  Target,
  Share2,
  MessageCircle,
  BarChart3,
  Search,
  Calendar,
  Lightbulb,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Zap,
  Wand2,
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';

interface SkillSelectorProps {
  selectedSkill: Skill | null;
  onSelect: (skill: Skill | null) => void;
}

// Map icon names to Lucide components
const iconMap: Record<string, React.ElementType> = {
  Mail,
  Megaphone,
  Target,
  Share2,
  MessageCircle,
  BarChart3,
  Search,
  Calendar,
  Lightbulb,
  Zap,
};

// Category styling
const categoryStyles: Record<string, { bg: string; text: string; border: string; activeBg: string }> = {
  marketing: {
    bg: 'bg-purple-50 hover:bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    activeBg: 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600',
  },
  sales: {
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    activeBg: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600',
  },
  communication: {
    bg: 'bg-blue-50 hover:bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    activeBg: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
  },
  analysis: {
    bg: 'bg-amber-50 hover:bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    activeBg: 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600',
  },
  content: {
    bg: 'bg-pink-50 hover:bg-pink-100',
    text: 'text-pink-700',
    border: 'border-pink-200',
    activeBg: 'bg-pink-600 hover:bg-pink-700 text-white border-pink-600',
  },
};

export const SkillSelector: React.FC<SkillSelectorProps> = ({
  selectedSkill,
  onSelect,
}) => {
  const { skills, isLoading } = useSkills();
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-8 w-28 bg-slate-200 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!skills || skills.length === 0) {
    return null;
  }

  // Show first 5 skills, or all if expanded
  const visibleSkills = isExpanded ? skills : skills.slice(0, 5);
  const hasMore = skills.length > 5;

  return (
    <div className="border-b border-slate-100">
      {/* Selected skill banner */}
      {selectedSkill && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 border-b border-blue-100/50">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Wand2 size={14} className="text-blue-600" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
              <span className="text-sm font-semibold text-blue-900">
                {selectedSkill.name}
              </span>
              {selectedSkill.input_template && (
                <span className="text-xs text-blue-600/70 hidden sm:inline">
                  • {selectedSkill.input_template}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onSelect(null)}
            className="h-7 w-7 text-blue-600 hover:bg-blue-100"
            title="Clear skill"
          >
            <X size={14} />
          </Button>
        </div>
      )}

      {/* Skills grid */}
      <div className="px-4 py-3 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              AI Skills
            </span>
            <Badge variant="secondary" size="sm">
              {skills.length}
            </Badge>
          </div>
          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              {isExpanded ? (
                <>
                  Show less
                  <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Show all
                  <ChevronDown size={14} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Skill pills */}
        <div className="flex flex-wrap gap-2">
          {visibleSkills.map((skill) => {
            const IconComponent = iconMap[skill.icon] || Zap;
            const isSelected = selectedSkill?.id === skill.id;
            const styles = categoryStyles[skill.category] || categoryStyles.content;

            return (
              <button
                key={skill.id}
                onClick={() => onSelect(isSelected ? null : skill)}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium",
                  "transition-all duration-200 border",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  isSelected
                    ? styles.activeBg
                    : cn(styles.bg, styles.text, styles.border)
                )}
                title={skill.description}
              >
                <IconComponent
                  size={15}
                  className={cn(
                    "transition-transform group-hover:scale-110",
                    isSelected && "text-white"
                  )}
                />
                <span className="whitespace-nowrap">{skill.name}</span>
              </button>
            );
          })}
        </div>

        {/* Collapsed indicator */}
        {!isExpanded && hasMore && (
          <p className="mt-2 text-xs text-slate-400">
            +{skills.length - 5} more skills available
          </p>
        )}
      </div>
    </div>
  );
};

export default SkillSelector;
