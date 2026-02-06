/**
 * Chat Message Component
 * Displays individual chat messages with avatar, content, and sources
 */

import { Brain, User, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="pl-1">{children}</li>,
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "underline hover:opacity-80 transition-opacity",
                      isUser ? "text-white" : "text-blue-600"
                    )}
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                code: ({ children, className }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !children?.toString().includes('\n');
                  return (
                    <code
                      className={cn(
                        isInline
                          ? "px-1 py-0.5 rounded text-xs font-mono"
                          : "block p-2 rounded text-xs font-mono overflow-x-auto",
                        isUser
                          ? "bg-white/20"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <pre className="my-2 rounded overflow-hidden">{children}</pre>,
                blockquote: ({ children }) => (
                  <blockquote className={cn(
                    "border-l-2 pl-3 my-2 italic",
                    isUser ? "border-white/50" : "border-gray-300 text-gray-600"
                  )}>
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3 rounded border border-gray-200">
                    <table className="min-w-full text-sm">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">{children}</thead>,
                tbody: ({ children }) => <tbody className="divide-y divide-gray-100">{children}</tbody>,
                tr: ({ children }) => <tr className="hover:bg-gray-50/50">{children}</tr>,
                th: ({ children }) => <th className={cn("px-3 py-2 text-left", isUser && "text-charcoal-dark")}>{children}</th>,
                td: ({ children }) => <td className={cn("px-3 py-2", isUser && "text-charcoal-dark")}>{children}</td>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

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
              <div className="flex flex-wrap gap-2">
                {message.sources.map((source, idx) => {
                  const isEpisodic = source.layer === 'episodic';
                  const isSemantic = source.layer === 'semantic';
                  const isIdentity = source.layer === 'identity';

                  return (
                    <span
                      key={idx}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors",
                        isEpisodic && "bg-amber-50 text-amber-700 border border-amber-100",
                        isSemantic && "bg-blue-50 text-blue-700 border border-blue-100",
                        isIdentity && "bg-purple-50 text-purple-700 border border-purple-100",
                        !source.layer && "bg-gray-50 text-gray-600 border border-gray-100"
                      )}
                      title={source.excerpt}
                    >
                      {isEpisodic ? <Brain size={10} /> : <FileText size={10} />}
                      {source.name}
                      <span className="opacity-50 text-[8px] uppercase font-bold ml-1">
                        {source.layer || 'context'}
                      </span>
                    </span>
                  );
                })}
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
