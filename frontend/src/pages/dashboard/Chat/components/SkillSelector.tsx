/**
 * Skill Selector Component
 * Pills/chips UI for selecting business development skills
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
} from 'lucide-react';

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

// Category colors
const categoryColors: Record<string, string> = {
  marketing: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
  sales: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
  communication: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  analysis: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
  content: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100',
};

const selectedColors: Record<string, string> = {
  marketing: 'bg-purple-600 text-white border-purple-600',
  sales: 'bg-green-600 text-white border-green-600',
  communication: 'bg-blue-600 text-white border-blue-600',
  analysis: 'bg-orange-600 text-white border-orange-600',
  content: 'bg-pink-600 text-white border-pink-600',
};

export const SkillSelector: React.FC<SkillSelectorProps> = ({
  selectedSkill,
  onSelect,
}) => {
  const { skills, isLoading } = useSkills();
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-gray-100 bg-gray-50/50">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-28 bg-gray-200 rounded-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!skills || skills.length === 0) {
    return null;
  }

  // Show first 4 skills, or all if expanded
  const visibleSkills = isExpanded ? skills : skills.slice(0, 4);
  const hasMore = skills.length > 4;

  return (
    <div className="border-b border-gray-100 bg-gray-50/30">
      {/* Selected skill indicator */}
      {selectedSkill && (
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles size={14} className="text-blue-600" />
            <span className="font-medium text-blue-900">
              Using: <span className="font-semibold">{selectedSkill.name}</span>
            </span>
            {selectedSkill.input_template && (
              <span className="text-blue-600/70 text-xs ml-2 hidden sm:inline">
                {selectedSkill.input_template}
              </span>
            )}
          </div>
          <button
            onClick={() => onSelect(null)}
            className="p-1.5 hover:bg-blue-100 rounded-full text-blue-600 transition-colors"
            title="Clear skill selection"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Skill pills */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-1 mb-2">
          <Zap size={12} className="text-gray-400" />
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Quick Skills
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {visibleSkills.map((skill) => {
            const IconComponent = iconMap[skill.icon] || Zap;
            const isSelected = selectedSkill?.id === skill.id;
            const baseColor = categoryColors[skill.category] || categoryColors.content;
            const activeColor = selectedColors[skill.category] || selectedColors.content;

            return (
              <button
                key={skill.id}
                onClick={() => onSelect(isSelected ? null : skill)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  transition-all duration-200 border whitespace-nowrap
                  ${isSelected ? activeColor : baseColor}
                `}
                title={skill.description}
              >
                <IconComponent size={13} />
                {skill.name}
              </button>
            );
          })}

          {/* Show more/less button */}
          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={14} />
                  Less
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  +{skills.length - 4} more
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillSelector;
