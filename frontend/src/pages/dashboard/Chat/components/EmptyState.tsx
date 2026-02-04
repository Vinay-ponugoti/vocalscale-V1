/**
 * Empty State Component
 * Clean ChatGPT-style welcome screen with VocalScale branding
 */

import { TrendingUp, Target, PenTool, BarChart3, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onSuggestionClick: (message: string) => void;
}

const suggestions = [
  {
    icon: TrendingUp,
    text: 'How can I get more customers this month?',
  },
  {
    icon: PenTool,
    text: 'Write a follow-up SMS for missed appointments',
  },
  {
    icon: BarChart3,
    text: 'Analyze my call performance and suggest improvements',
  },
  {
    icon: Target,
    text: 'Create a social media post for my services',
  },
];

const EmptyState = ({ onSuggestionClick }: EmptyStateProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4 py-8" style={{ backgroundColor: '#ffffff' }}>
      {/* Logo / Brand - Removed */}
      <div className="mb-4" />

      {/* Welcome message */}
      <h2 className="text-xl text-gray-600 mb-2">
        How can I help grow your business today?
      </h2>
      <p className="text-gray-400 text-sm mb-10 max-w-md">
        I'm your business growth assistant. Ask me for marketing ideas, customer insights, or help with communications.
      </p>

      {/* Suggestion cards - 2x2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="group flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl text-left hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            <Sparkles size={16} className="text-gray-300 group-hover:text-black transition-colors flex-shrink-0" />
            <span className="text-sm text-gray-600 group-hover:text-black transition-colors">
              {suggestion.text}
            </span>
          </button>
        ))}
      </div>

      {/* Capabilities */}
      <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Knows your business
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Actionable insights
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Ready-to-use content
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
