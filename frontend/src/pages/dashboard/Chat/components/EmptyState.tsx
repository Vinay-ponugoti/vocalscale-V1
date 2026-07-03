/**
 * EmptyState — clean, minimal welcome screen (ChatGPT-style)
 */

import { cn } from '../../../../lib/utils';

interface EmptyStateProps {
  onSuggestionClick: (message: string) => void;
}

const suggestions = [
  'How can I get more customers this month?',
  'Write a follow-up SMS for missed appointments',
  'Create a 20% off Instagram post for my store',
  'Analyze my call performance and suggest improvements',
  'Create a promotional campaign for this weekend',
  'Give me 5 ways to improve customer retention',
];

const EmptyState = ({ onSuggestionClick }: EmptyStateProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-10 overflow-y-auto [&::-webkit-scrollbar]:w-0 scrollbar-none bg-white">
      {/* ── Headline ── */}
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight text-center mb-2">
        How can I help your business today?
      </h2>
      <p className="text-gray-500 text-sm text-center max-w-sm leading-relaxed mb-8">
        I know your products, customers, and goals. Ask me anything — or pick a suggestion below.
      </p>

      {/* ── Suggestion grid (plain text, no icons) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
        {suggestions.map((text, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick(text)}
            className={cn(
              'px-4 py-3 text-left text-sm text-gray-600',
              'bg-white border border-gray-200 rounded-xl',
              'hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900',
              'transition-colors duration-150',
            )}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
