/**
 * Empty State Component
 * Welcome screen with business growth focused suggestions
 */

import { Brain, TrendingUp, MessageSquare, Target, PenTool, BarChart3 } from 'lucide-react';

interface EmptyStateProps {
  onSuggestionClick: (message: string) => void;
}

const suggestions = [
  {
    icon: TrendingUp,
    text: 'How can I get more customers this month?',
    description: 'Get marketing ideas tailored to your business',
  },
  {
    icon: PenTool,
    text: 'Write a follow-up SMS for customers who missed their appointment',
    description: 'Generate ready-to-send messages',
  },
  {
    icon: BarChart3,
    text: 'Analyze my call patterns and suggest improvements',
    description: 'Get insights from your AI receptionist data',
  },
  {
    icon: Target,
    text: 'Create a social media post promoting my services',
    description: 'Generate engaging content for your business',
  },
  {
    icon: MessageSquare,
    text: 'Help me respond to a negative customer review',
    description: 'Draft professional responses',
  },
  {
    icon: TrendingUp,
    text: 'What are 3 quick wins I can implement today to grow?',
    description: 'Actionable tips you can start now',
  },
];

const EmptyState = ({ onSuggestionClick }: EmptyStateProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4 py-12">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-electric to-blue-dark flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-electric/20">
        <Brain size={40} />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-black text-charcoal mb-3">
        Your Business Growth Assistant
      </h2>

      {/* Description */}
      <p className="text-charcoal-light mb-8 leading-relaxed max-w-md">
        I'm here to help you grow your business. Ask me for marketing ideas,
        customer communication templates, business insights, or anything else
        to help you succeed.
      </p>

      {/* Suggestions */}
      <div className="w-full space-y-3">
        <p className="text-xs font-bold text-charcoal-light uppercase tracking-wider mb-4">
          Try asking:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onSuggestionClick(suggestion.text)}
              className="flex items-start gap-3 p-4 bg-white border border-white-light rounded-xl text-left hover:border-blue-electric/30 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-electric/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-electric/20 transition-colors">
                <suggestion.icon size={18} className="text-blue-electric" />
              </div>
              <div>
                <span className="text-sm font-medium text-charcoal group-hover:text-blue-electric transition-colors block">
                  {suggestion.text}
                </span>
                <span className="text-xs text-charcoal-light mt-1 block">
                  {suggestion.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-10 pt-8 border-t border-white-light w-full">
        <div className="flex flex-wrap justify-center gap-6 text-xs text-charcoal-light">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Knows Your Business
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-electric" />
            Actionable Advice
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            Ready-to-Use Content
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
