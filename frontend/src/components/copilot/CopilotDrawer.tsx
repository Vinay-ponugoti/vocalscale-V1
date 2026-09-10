import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowUp,
  Bot,
  ChevronRight,
  Loader2,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLocation } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import {
  COPILOT_OPEN_EVENT,
  type CopilotOpenRequest,
  surfaceForPath,
} from '../../lib/copilot';
import type { ChatMessage } from '../../types/chat';

const suggestions: Record<string, string[]> = {
  overview: ['What needs my attention today?', 'Where are we losing callers?'],
  calls: ['Find patterns in recent failed calls', 'What follow-ups should I prioritize?'],
  call_detail: [
    'Analyze the intent, outcome, missed opportunity, and next action.',
    'Show which lines sounded robotic and rewrite them naturally.',
    'What agent or knowledge change would prevent this next time?',
  ],
  contacts: ['Which customers need follow-up?', 'Suggest the next best action'],
  campaigns: ['Draft a focused campaign', 'Review campaign risks before launch'],
  appointments: ['Find booking issues', 'Which appointments need confirmation?'],
  agents: ['How can I make this agent sound more human?', 'Review the agent configuration'],
  knowledge: ['Find missing or conflicting answers', 'What should I add to the knowledge base?'],
  performance: ['Explain the biggest metric change', 'What should I improve first?'],
  general: ['What can you help me improve?'],
};

const surfaceLabel = (request: CopilotOpenRequest) =>
  request.title || request.surface.replaceAll('_', ' ');

function MessageContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
        strong: ({ children }) => <strong className="font-black text-slate-950">{children}</strong>,
        h1: ({ children }) => <h3 className="mb-2 mt-3 text-sm font-black text-slate-950 first:mt-0">{children}</h3>,
        h2: ({ children }) => <h3 className="mb-2 mt-3 text-sm font-black text-slate-950 first:mt-0">{children}</h3>,
        h3: ({ children }) => <h3 className="mb-2 mt-3 text-sm font-black text-slate-950 first:mt-0">{children}</h3>,
        code: ({ children }) => <code className="rounded bg-slate-200/70 px-1 py-0.5 text-[12px] font-semibold">{children}</code>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function ConversationMessage({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
        isUser
          ? 'border-slate-200 bg-white text-slate-500'
          : 'border-blue-100 bg-blue-50 text-blue-600'
      }`}>
        {isUser ? <UserRound size={13} /> : <Bot size={14} />}
      </div>
      <div className={`min-w-0 max-w-[86%] ${isUser ? 'text-right' : ''}`}>
        <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {isUser ? 'You' : 'Copilot'}
        </p>
        <div className={`rounded-xl px-3.5 py-2.5 text-left text-[13px] font-medium leading-6 shadow-sm ${
          isUser
            ? 'rounded-tr-sm bg-slate-900 text-white'
            : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700'
        }`}>
          {isUser ? <span className="whitespace-pre-wrap">{message.content}</span> : <MessageContent content={message.content} />}
        </div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.sources.slice(0, 3).map((source, index) => (
              <span key={`${source.name}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">
                {source.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CopilotConversation({ request }: { request: CopilotOpenRequest }) {
  const { messages, streamingContent, isStreaming, error, sendMessage } = useChat(null, {
    surface: request.surface,
    entityId: request.entityId,
  });
  const [input, setInput] = useState('');
  const startedPrompt = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!request.prompt || startedPrompt.current) return;
    startedPrompt.current = true;
    void sendMessage(request.prompt);
  }, [request.prompt, sendMessage]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const send = () => {
    const message = input.trim();
    if (!message || isStreaming) return;
    setInput('');
    void sendMessage(message);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    send();
  };

  const prompts = suggestions[request.surface] || suggestions.general;
  const isCallContext = request.surface === 'call_detail';

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-50/70">
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isCallContext ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
            {isCallContext ? <ShieldCheck size={16} /> : <MessageSquareText size={16} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              {isCallContext ? 'Trusted call context' : 'Current workspace'}
            </p>
            <p className="truncate text-xs font-bold capitalize text-slate-800">{surfaceLabel(request)}</p>
          </div>
          {isCallContext && (
            <div className="flex items-center gap-1 rounded-md border border-emerald-100 bg-white px-2 py-1 text-[10px] font-bold text-emerald-700">
              <LockKeyhole size={10} /> Private
            </div>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-5">
        {messages.length === 0 && !isStreaming && (
          <div className="py-2">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-slate-950">What should we improve?</h3>
                <p className="mt-1 max-w-sm text-xs font-medium leading-5 text-slate-500">
                  Ask for an explanation or a draft. Copilot will not publish changes or launch actions without confirmation.
                </p>
              </div>
            </div>

            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Suggested for this page</p>
            <div className="space-y-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isStreaming}
                  onClick={() => void sendMessage(prompt)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left text-xs font-semibold leading-5 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                    <Sparkles size={13} />
                  </span>
                  <span className="flex-1">{prompt}</span>
                  <ChevronRight size={14} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => <ConversationMessage key={message.id} message={message} />)}

        {isStreaming && (
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
              <Bot size={14} />
            </div>
            <div className="min-w-0 max-w-[86%]">
              <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Copilot</p>
              <div className="rounded-xl rounded-tl-sm border border-blue-100 bg-white px-3.5 py-2.5 text-[13px] font-medium leading-6 text-slate-700 shadow-sm">
                {streamingContent
                  ? <MessageContent content={streamingContent} />
                  : <span className="flex items-center gap-2 text-slate-500"><Loader2 size={14} className="animate-spin text-blue-500" /> Reviewing the context…</span>}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-semibold leading-5 text-rose-700">
            {error}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            rows={2}
            maxLength={10000}
            disabled={isStreaming}
            placeholder={isStreaming ? 'Copilot is responding…' : 'Ask about this page…'}
            className="max-h-32 min-h-[48px] w-full resize-none bg-transparent px-1.5 py-1 text-sm font-medium leading-5 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-wait"
          />
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="px-1 text-[10px] font-medium text-slate-400">Enter to send · Shift + Enter for a new line</p>
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              aria-label="Send message"
            >
              {isStreaming ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={15} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] font-medium text-slate-400">Review important recommendations before applying changes.</p>
      </form>
    </div>
  );
}

export default function CopilotDrawer() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [request, setRequest] = useState<CopilotOpenRequest>({ surface: 'overview', title: 'Dashboard' });

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<CopilotOpenRequest>).detail;
      setRequest(detail || { surface: surfaceForPath(location.pathname) });
      setOpen(true);
    };
    window.addEventListener(COPILOT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(COPILOT_OPEN_EVENT, handleOpen);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="VocalScale Copilot">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/25 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
            aria-label="Close Copilot"
          />
          <motion.aside
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-slate-200 bg-white shadow-2xl shadow-slate-950/15 sm:max-w-[460px]"
          >
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                  <Bot size={19} />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="truncate text-sm font-black tracking-tight text-slate-950">VocalScale Copilot</h2>
                    <span className="rounded-md border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-600">Beta</span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">Analyze, explain, and draft</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close Copilot">
                <X size={19} />
              </button>
            </div>
            <CopilotConversation key={`${request.surface}:${request.entityId || 'none'}:${request.prompt || ''}`} request={request} />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
