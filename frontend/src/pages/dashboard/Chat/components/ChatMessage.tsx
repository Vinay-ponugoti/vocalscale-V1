/**
 * ChatMessage — premium message design
 * User: dark slate bubble  |  Assistant: gradient avatar + clean prose
 */

import { useState } from 'react';
import {
  Copy, Check,
  ThumbsUp, ThumbsDown, Share, RotateCcw, Pencil, FileText,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage as ChatMessageType, Source } from '../../../../types/chat';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../../../lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ImageCard from './ImageCard';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

// ── Inline copy button used inside code blocks ──────────────────────────────
const InlineCopyButton = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* ignore */ }
  };
  return (
    <button
      onClick={handleCopy}
      className={cn(
        'p-1.5 rounded-md transition-all',
        copied ? 'text-green-400 bg-green-400/10' : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
      )}
      title={copied ? 'Copied!' : 'Copy'}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
};

// ── Source chip ──────────────────────────────────────────────────────────────
const SourceChip = ({ source }: { source: Source }) => (
  <div
    className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-default"
    title={source.excerpt}
  >
    <div className="w-4 h-4 rounded-sm flex items-center justify-center bg-blue-50 text-blue-600 flex-shrink-0">
      <FileText size={10} />
    </div>
    <span className="font-medium text-gray-700 truncate max-w-[140px]">
      {source.name || 'Document'}
    </span>
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
const ChatMessage = ({ message, isStreaming }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [copied, setCopied] = useState(false);

  // Debug log — remove once images are confirmed working
  if (message.images && message.images.length > 0) {
    console.log(`[ChatMessage] Rendering msg ${message.id} WITH ${message.images.length} image(s). First URL: ${message.images[0]?.url?.slice(0, 80)}`);
  } else if (!isUser && !isStreaming) {
    console.log(`[ChatMessage] Rendering assistant msg ${message.id} — NO images. keys: [${Object.keys(message).join(', ')}]`);
  }

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div
      className={cn(
        'group py-4 md:py-5 first:pt-2',
        isUser ? 'flex justify-end' : 'flex justify-start'
      )}
    >
      {/* ── Content ── */}
      <div className={cn('min-w-0 max-w-3xl w-full', isUser && 'flex flex-col items-end')}>

        {/* Assistant name + timestamp */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[13px] font-semibold text-gray-900">VocalScale AI</span>
            <span className="text-[11px] text-gray-400">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </span>
          </div>
        )}

        {/* ── Message body ── */}
        {isUser ? (
          // User bubble — dark slate, ChatGPT-style
          <div className="inline-block bg-[#1e293b] text-white/95 px-5 py-3.5 rounded-2xl rounded-br-sm text-[15px] leading-relaxed max-w-full text-left shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
            {message.content}
          </div>
        ) : (
          // Assistant — flat prose, no bubble
          <div className="text-[15px] text-gray-800 leading-7 w-full">

            {/* Streaming dots */}
            {isStreaming && !message.content && (
              <div className="flex gap-1.5 items-center h-6 py-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.32s]" />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.16s]" />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              </div>
            )}

            <div className="markdown-content prose prose-slate prose-sm max-w-none break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-3 list-disc pl-6 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="my-3 list-decimal pl-6 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="pl-1">{children}</li>,
                  h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-6 text-gray-900">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-5 text-gray-900">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-4 text-gray-800">{children}</h3>,
                  code: ({ children, className }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !String(children).includes('\n');
                    return isInline ? (
                      <code className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-800 text-[13px] font-mono border border-gray-200">
                        {children}
                      </code>
                    ) : (
                      <div className="relative group/code my-4 rounded-xl overflow-hidden border border-gray-800/60 bg-[#1e1e2e]">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#16161e] border-b border-gray-700/50">
                          <span className="text-[11px] text-gray-400 font-mono tracking-wide">
                            {match?.[1] || 'code'}
                          </span>
                          <InlineCopyButton content={String(children).replace(/\n$/, '')} />
                        </div>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match?.[1] || 'text'}
                          PreTag="div"
                          customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '13px' }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    );
                  },
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 font-medium">
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 border border-gray-200 rounded-xl shadow-sm">
                      <table className="w-full text-sm">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => <th className="bg-gray-50 px-4 py-2.5 text-left font-semibold text-gray-700 border-b border-gray-200 text-[13px]">{children}</th>,
                  td: ({ children }) => <td className="px-4 py-2.5 border-b border-gray-100 last:border-0 text-gray-600">{children}</td>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-[3px] border-blue-300 pl-4 py-0.5 my-4 text-gray-500 italic bg-blue-50/40 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="my-6 border-gray-200" />,
                  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                }}
              >
                {message.content}
              </ReactMarkdown>

              {/* Streaming cursor */}
              {isStreaming && message.content && (
                <span className="inline-block w-[3px] h-[18px] ml-0.5 bg-blue-500 rounded-sm animate-pulse align-middle" />
              )}
            </div>
          </div>
        )}

        {/* ── Images ── */}
        {message.images && message.images.length > 0 && (
          <div className={cn('w-full', isUser && 'text-left')}>
            <ImageCard
              images={message.images}
              generationId={message.generation_id}
              availablePresets={message.available_presets}
              sessionId={message.session_id}
              socialContent={message.social_content}
            />
          </div>
        )}

        {/* ── Sources ── */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {message.sources.map((source, idx) => (
              <SourceChip key={idx} source={source} />
            ))}
          </div>
        )}

        {/* ── Assistant action row ── */}
        {!isUser && !isStreaming && (
          <div className="flex items-center gap-0.5 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Copy */}
            <button
              onClick={handleCopyMessage}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all',
                copied
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              )}
              title={copied ? 'Copied!' : 'Copy'}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span className="font-medium">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            {/* Thumbs */}
            <button
              onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                feedback === 'up'
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              )}
              title="Good response"
            >
              <ThumbsUp size={13} />
            </button>
            <button
              onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                feedback === 'down'
                  ? 'text-red-500 bg-red-50'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              )}
              title="Bad response"
            >
              <ThumbsDown size={13} />
            </button>
            <button
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              title="Regenerate"
            >
              <RotateCcw size={13} />
            </button>
            <button
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              title="Share"
            >
              <Share size={13} />
            </button>
          </div>
        )}

        {/* ── User action row ── */}
        {isUser && !isStreaming && (
          <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              title="Edit"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={handleCopyMessage}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              title="Copy"
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
