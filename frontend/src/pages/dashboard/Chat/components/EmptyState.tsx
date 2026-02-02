/**
 * Empty State Component
 * Welcome screen with suggestions for new conversations
 */

import { Brain, FileText, Search, Sparkles, MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  onSuggestionClick: (message: string) => void;
}

const suggestions = [
  {
    icon: FileText,
    text: 'Summarize my uploaded documents',
    description: 'Get a quick overview of your knowledge base',
  },
  {
    icon: Search,
    text: 'What information do you have about my business?',
    description: 'Explore what the AI knows about you',
  },
  {
    icon: Sparkles,
    text: 'Find connections between different topics',
    description: 'Discover insights across your documents',
  },
  {
    icon: MessageSquare,
    text: 'Help me draft a response based on past conversations',
    description: 'Use your chat history as reference',
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
        Chat with Your Knowledge Base
      </h2>

      {/* Description */}
      <p className="text-charcoal-light mb-8 leading-relaxed max-w-md">
        Ask questions about your documents and data. The AI searches your
        knowledge graph to provide accurate, contextual answers based on
        everything you've uploaded.
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
            Persistent Memory
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-electric" />
            Knowledge Graph Search
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            File Attachments
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
