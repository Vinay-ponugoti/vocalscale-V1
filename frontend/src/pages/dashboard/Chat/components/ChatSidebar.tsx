/**
 * ChatSidebar — dark premium sidebar (Claude/ChatGPT-style)
 */

import { SquarePen, Trash2, X, MessageSquare } from 'lucide-react';
import type { ChatSession } from '../../../../types/chat';
import { cn } from '../../../../lib/utils';

interface ChatSidebarProps {
  sessions: ChatSession[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose?: () => void;
  loading: boolean;
}

const ChatSidebar = ({
  sessions,
  selectedId,
  onSelect,
  onNewChat,
  onDelete,
  isOpen,
  onClose,
  loading,
}: ChatSidebarProps) => {
  const handleSelectSession = (id: string) => {
    onSelect(id);
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 z-[100] transition-all duration-300 lg:hidden',
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed lg:relative left-0 top-0 bottom-0 z-[101] lg:z-auto',
          'w-[260px] flex-shrink-0',
          'bg-[#0f1117] border-r border-white/[0.06]',
          'flex flex-col overflow-hidden',
          'transition-transform duration-300 ease-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
              <MessageSquare size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold text-white/90 tracking-tight">AI Chat</span>
          </div>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white/80"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── New Chat Button ── */}
        <div className="px-3 pb-3 shrink-0">
          <button
            onClick={() => { onNewChat(); onClose?.(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.08] rounded-xl transition-all duration-150 group"
          >
            <SquarePen size={15} className="text-white/50 group-hover:text-white/80 transition-colors" />
            <span className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors">
              New conversation
            </span>
          </button>
        </div>

        {/* ── Session List ── */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 [&::-webkit-scrollbar]:w-0 scrollbar-none">
          {loading ? (
            <div className="space-y-1 px-1 pt-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-9 bg-white/[0.05] animate-pulse rounded-xl" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center mb-3">
                <MessageSquare size={18} className="text-white/20" />
              </div>
              <p className="text-xs text-white/30 leading-relaxed">
                No conversations yet.<br />Start a new chat above.
              </p>
            </div>
          ) : (
            <>
              <p className="px-3 pt-3 pb-2 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                Recent
              </p>
              <div className="space-y-0.5">
                {sessions.map(session => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isSelected={selectedId === session.id}
                    onSelect={handleSelectSession}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Bottom fade ── */}
        <div className="h-8 shrink-0 bg-gradient-to-t from-[#0f1117] to-transparent pointer-events-none -mt-8 relative z-10" />
      </aside>
    </>
  );
};

// ── Session Item ──────────────────────────────────────────────────────────────
const SessionItem = ({
  session,
  isSelected,
  onSelect,
  onDelete,
}: {
  session: ChatSession;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) => (
  <button
    onClick={() => onSelect(session.id)}
    className={cn(
      'w-full group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150 text-left text-sm',
      isSelected
        ? 'bg-white/[0.12] text-white'
        : 'text-white/55 hover:text-white/85 hover:bg-white/[0.07]'
    )}
  >
    {/* Active accent bar */}
    {isSelected && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-r-full" />
    )}

    <MessageSquare
      size={14}
      className={cn(
        'flex-shrink-0 transition-colors',
        isSelected ? 'text-blue-400' : 'text-white/25 group-hover:text-white/50'
      )}
    />
    <span className="flex-1 truncate text-[13px] font-medium">
      {session.title || 'New conversation'}
    </span>

    {/* Delete button */}
    <button
      onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 flex-shrink-0"
    >
      <Trash2 size={13} />
    </button>
  </button>
);

export default ChatSidebar;
