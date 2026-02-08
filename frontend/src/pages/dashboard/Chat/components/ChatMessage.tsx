/**
 * Chat Message Component
 * Displays individual chat messages with avatar, content, and sources
 */

import { useState } from 'react';
import { User, Sparkles, Copy, Check, ThumbsUp, ThumbsDown, Share, RotateCcw, MoreHorizontal, Pencil, FileText, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage as ChatMessageType, Source } from '../../../../types/chat';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../../../lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

const CopyButton = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100",
        copied ? "text-green-600 bg-green-50" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
      )}
      title={copied ? "Copied!" : "Copy"}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};

const SourceChip = ({ source }: { source: Source }) => (
  <div
    className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-default max-w-full"
    title={source.excerpt}
  >
    <div className="w-4 h-4 rounded-sm flex items-center justify-center bg-blue-50 text-blue-600 flex-shrink-0">
      <FileText size={10} />
    </div>
    <span className="font-medium text-gray-700 truncate">{source.name || 'Document'}</span>
  </div>
);

const ChatMessage = ({ message, isStreaming }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  return (
    <div className={cn(
      'group flex gap-4 md:gap-6 py-6 md:py-8 first:pt-0',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border',
          isUser
            ? 'bg-white border-gray-200 text-gray-600'
            : 'bg-white border-gray-200 text-blue-600'
        )}
      >
        {isUser ? (
          <User size={16} strokeWidth={2} />
        ) : (
          <Sparkles size={16} strokeWidth={2} className={isStreaming ? "animate-pulse" : ""} />
        )}
      </div>

      {/* Content Container */}
      <div className={cn('flex-1 min-w-0 max-w-3xl', isUser && 'text-right')}>

        {/* Header (Name & Time) */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-gray-900">VocalScale AI</span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </span>
          </div>
        )}

        {/* Message Bubble/Content */}
        <div
          className={cn(
            'relative',
            isUser
              ? 'inline-block bg-blue-50/50 text-gray-800 px-5 py-3.5 rounded-2xl rounded-tr-sm text-left border border-blue-100/50'
              : 'text-gray-800 leading-7 text-[15px]'
          )}
        >
          {/* Streaming Indicator */}
          {isStreaming && !message.content && (
            <div className="flex gap-1 items-center h-6">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          )}

          <div className={cn("markdown-content prose prose-slate prose-sm max-w-none break-words", isUser && "prose-p:m-0")}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="my-4 list-disc pl-6 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="my-4 list-decimal pl-6 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="pl-1">{children}</li>,
                h1: ({ children }) => <h1 className="text-xl font-bold mb-4 mt-6">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold mb-3 mt-5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-4">{children}</h3>,
                code: ({ children, className }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !children?.toString().includes('\n');
                  return isInline ? (
                    <code className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-800 text-xs font-mono border border-gray-200">
                      {children}
                    </code>
                  ) : (
                    <div className="relative group/code my-4 rounded-lg overflow-hidden border border-gray-200 bg-[#282c34]">
                      <div className="flex items-center justify-between px-4 py-2 bg-[#21252b] border-b border-gray-700">
                        <span className="text-xs text-gray-400 font-mono">{match?.[1] || 'code'}</span>
                        <CopyButton content={String(children).replace(/\n$/, '')} />
                      </div>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match?.[1] || 'text'}
                        PreTag="div"
                        customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  );
                },
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline underline-offset-2">
                    {children}
                  </a>
                ),
                table: ({ children }) => <div className="overflow-x-auto my-4 border rounded-lg"><table className="w-full text-sm">{children}</table></div>,
                th: ({ children }) => <th className="bg-gray-50 px-4 py-2 text-left font-semibold border-b">{children}</th>,
                td: ({ children }) => <td className="px-4 py-2 border-b last:border-0">{children}</td>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-200 pl-4 py-1 my-4 text-gray-500 italic">{children}</blockquote>
              }}
            >
              {message.content}
            </ReactMarkdown>

            {isStreaming && message.content && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 animate-pulse align-middle" />
            )}
          </div>

        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.sources.map((source, idx) => (
              <SourceChip key={idx} source={source} />
            ))}
          </div>
        )}

        {/* Action Row (AI Only) */}
        {!isUser && !isStreaming && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <CopyButton content={message.content} />
            <button
              onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
              className={cn("p-1.5 rounded-md hover:bg-gray-100 transition-colors", feedback === 'up' ? "text-green-600" : "text-gray-400 hover:text-gray-700")}
            >
              <ThumbsUp size={14} />
            </button>
            <button
              onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
              className={cn("p-1.5 rounded-md hover:bg-gray-100 transition-colors", feedback === 'down' ? "text-red-500" : "text-gray-400 hover:text-gray-700")}
            >
              <ThumbsDown size={14} />
            </button>
            <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
              <RotateCcw size={14} />
            </button>
            <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
              <Share size={14} />
            </button>
          </div>
        )}

        {/* User Action Row */}
        {isUser && (
          <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Pencil size={12} />
            </button>
            <CopyButton content={message.content} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
