/**
 * Empty State Component
 * Clean welcome screen with VocalScale branding and quick suggestions
 */

import {
  TrendingUp,
  Target,
  PenTool,
  BarChart3,
  Sparkles,
  MessageSquare,
  Zap,
  Brain,
} from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface EmptyStateProps {
  onSuggestionClick: (message: string) => void;
}

const suggestions = [
  {
    icon: TrendingUp,
    text: 'How can I get more customers this month?',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: PenTool,
    text: 'Write a follow-up SMS for missed appointments',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: BarChart3,
    text: 'Analyze my call performance and suggest improvements',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    icon: Target,
    text: 'Create a social media post for my services',
    color: 'text-purple-600 bg-purple-50',
  },
];

const capabilities = [
  {
    icon: Brain,
    label: 'Knows your business',
    color: 'bg-emerald-500',
  },
  {
    icon: Zap,
    label: 'Actionable insights',
    color: 'bg-blue-500',
  },
  {
    icon: MessageSquare,
    label: 'Ready-to-use content',
    color: 'bg-purple-500',
  },
];

const EmptyState = ({ onSuggestionClick }: EmptyStateProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4 py-8">
      {/* Welcome Icon */}
      <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
        <Sparkles size={32} className="text-blue-600" />
      </div>

      {/* Welcome message */}
      <h2 className="text-2xl font-semibold text-slate-800 mb-2">
        How can I help grow your business?
      </h2>
      <p className="text-slate-500 text-sm mb-10 max-w-md">
        I'm your AI-powered business growth assistant. Ask me for marketing ideas,
        customer insights, or help with communications.
      </p>

      {/* Suggestion cards - 2x2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {suggestions.map((suggestion, idx) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={idx}
              onClick={() => onSuggestionClick(suggestion.text)}
              className={cn(
                "group flex items-start gap-3 p-4",
                "bg-white border border-slate-200 rounded-xl text-left",
                "hover:border-slate-300 hover:shadow-md hover:bg-slate-50/50",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                suggestion.color
              )}>
                <Icon size={16} />
              </div>
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed">
                {suggestion.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Capabilities */}
      <div className="mt-12 flex flex-wrap justify-center gap-4">
        {capabilities.map((cap, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full"
          >
            <div className={cn("w-2 h-2 rounded-full", cap.color)} />
            <span className="text-xs font-medium text-slate-500">
              {cap.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
