/**
 * Chat Message Component
 * Displays individual chat messages with avatar, content, and sources
 */

import { Brain, User, ExternalLink, FileText } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../../../types/chat';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../../../lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

const ChatMessage = ({ message, isStreaming }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm',
          isUser
            ? 'bg-charcoal-medium'
            : 'bg-gradient-to-br from-blue-electric to-blue-dark'
        )}
      >
        {isUser ? (
          <User size={16} className="text-white" />
        ) : (
          <Brain size={16} className="text-white" />
        )}
      </div>

      {/* Content */}
      <div className={cn('flex-1 max-w-[80%]', isUser && 'text-right')}>
        <div
          className={cn(
            'inline-block p-4 rounded-2xl text-sm leading-relaxed shadow-sm',
            isUser
              ? 'bg-charcoal text-white rounded-tr-sm'
              : 'bg-white border border-white-light rounded-tl-sm'
          )}
        >
          {/* Message content */}
          <p className="whitespace-pre-wrap">{message.content}</p>

          {/* Streaming cursor */}
          {isStreaming && (
            <span className="inline-block w-2 h-5 ml-1 bg-blue-electric animate-pulse rounded-sm" />
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white-light/20">
              <div className="flex flex-wrap gap-2">
                {message.attachments.map((attachment, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs',
                      isUser
                        ? 'bg-white/10 text-white/80'
                        : 'bg-white-light text-charcoal-medium'
                    )}
                  >
                    <FileText size={12} />
                    {attachment.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white-light/50">
              <p className="text-xs font-medium text-charcoal-light mb-2">
                Sources:
              </p>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((source, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-electric/10 text-blue-electric text-xs rounded-lg"
                  >
                    <ExternalLink size={10} />
                    {source.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p
          className={cn(
            'text-[10px] text-charcoal-light mt-1',
            isUser && 'text-right'
          )}
        >
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
