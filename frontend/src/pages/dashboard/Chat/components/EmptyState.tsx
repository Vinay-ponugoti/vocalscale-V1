/**
 * EmptyState — immersive welcome screen with premium suggestion cards
 */

import { TrendingUp, Target, PenTool, BarChart3, ArrowRight, Sparkles, Image } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface EmptyStateProps {
  onSuggestionClick: (message: string) => void;
}

const suggestions = [
  {
    icon: TrendingUp,
    color: 'bg-emerald-50 text-emerald-600',
    title: 'Grow customers',
    text: 'How can I get more customers this month?',
  },
  {
    icon: PenTool,
    color: 'bg-violet-50 text-violet-600',
    title: 'Draft content',
    text: 'Write a follow-up SMS for missed appointments',
  },
  {
    icon: Image,
    color: 'bg-blue-50 text-blue-600',
    title: 'Create visuals',
    text: 'Create a 20% off Instagram post for my store',
  },
  {
    icon: BarChart3,
    color: 'bg-amber-50 text-amber-600',
    title: 'Analyze performance',
    text: 'Analyze my call performance and suggest improvements',
  },
  {
    icon: Target,
    color: 'bg-rose-50 text-rose-600',
    title: 'Run a campaign',
    text: 'Create a promotional campaign for this weekend',
  },
  {
    icon: Sparkles,
    color: 'bg-indigo-50 text-indigo-600',
    title: 'Brainstorm ideas',
    text: 'Give me 5 ways to improve customer retention',
  },
];

const EmptyState = ({ onSuggestionClick }: EmptyStateProps) => {
  return (
    <div
      className="h-full flex flex-col items-center justify-center px-6 py-10 overflow-y-auto [&::-webkit-scrollbar]:w-0 scrollbar-none"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(59,130,246,0.07) 0%, transparent 70%)',
      }}
    >
      {/* ── Hero Icon ── */}
      <div className="relative mb-7 flex items-center justify-center">
        <div
          className="absolute w-20 h-20 rounded-full bg-blue-400/10 animate-ping"
          style={{ animationDuration: '3s' }}
        />
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_8px_24px_rgba(59,130,246,0.4)]">
          <Sparkles size={26} className="text-white" strokeWidth={1.5} />
        </div>
      </div>

      {/* ── Headline ── */}
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight text-center mb-2">
        How can I help your business today?
      </h2>
      <p className="text-gray-500 text-sm text-center max-w-sm leading-relaxed mb-10">
        I know your products, customers, and goals. Ask me anything — or pick a suggestion below.
      </p>

      {/* ── Suggestion Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
        {suggestions.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={idx}
              onClick={() => onSuggestionClick(s.text)}
              className={cn(
                'group relative flex items-start gap-3 p-4 text-left',
                'bg-white border border-gray-100 rounded-2xl',
                'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
                'hover:border-blue-200 hover:shadow-[0_4px_16px_rgba(59,130,246,0.1)]',
                'hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                  s.color
                )}
              >
                <Icon size={15} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                  {s.title}
                </p>
                <p className="text-sm text-gray-700 group-hover:text-gray-900 leading-snug transition-colors">
                  {s.text}
                </p>
              </div>
              <ArrowRight
                size={14}
                className="flex-shrink-0 text-gray-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 mt-1.5"
              />
            </button>
          );
        })}
      </div>

      {/* ── Capability badges ── */}
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {[
          { dot: 'bg-emerald-400', label: 'Knows your business' },
          { dot: 'bg-blue-400',    label: 'Generates images' },
          { dot: 'bg-violet-400',  label: 'Ready-to-use content' },
          { dot: 'bg-amber-400',   label: 'Actionable insights' },
        ].map((c, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-100 rounded-full shadow-sm text-xs text-gray-500"
          >
            <div className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
