/**
 * Chat Sidebar Component
 * Mobile-friendly drawer with conversation list
 */

import { useState } from 'react';
import { Plus, MessageSquare, Trash2, Search, X, LogOut, Settings } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import type { ChatSession } from '../../../../types/chat';
import { formatDistanceToNow } from 'date-fns';
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
  const [search, setSearch] = useState('');

  const filteredSessions = sessions.filter(s =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.last_message?.toLowerCase().includes(search.toLowerCase())
  );

  // Group sessions by time
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groupedSessions = {
    today: filteredSessions.filter(s => new Date(s.updated_at) >= new Date(today.setHours(0, 0, 0, 0))),
    yesterday: filteredSessions.filter(s => {
      const date = new Date(s.updated_at);
      return date >= new Date(yesterday.setHours(0, 0, 0, 0)) && date < new Date(today.setHours(0, 0, 0, 0));
    }),
    older: filteredSessions.filter(s => new Date(s.updated_at) < new Date(yesterday.setHours(0, 0, 0, 0))),
  };

  const handleSelectSession = (id: string) => {
    onSelect(id);
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto",
          "w-[280px] bg-white border-r border-slate-200",
          "flex flex-col transition-transform duration-300 ease-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:w-0 lg:border-0 lg:overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
              VS
            </div>
            <span className="font-semibold text-slate-900">VocalScale</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onClose?.();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors"
          >
            <Plus size={18} />
            New chat
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className={cn(
                "w-full pl-9 pr-4 py-2 text-sm rounded-lg",
                "bg-slate-50 border border-slate-200",
                "text-slate-700 placeholder:text-slate-400",
                "focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100",
                "transition-all"
              )}
            />
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-2">
          {loading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse h-12 bg-slate-100 rounded-lg" />
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-slate-500">
                {search ? 'No matching conversations' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Today */}
              {groupedSessions.today.length > 0 && (
                <div>
                  <p className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Today
                  </p>
                  <div className="space-y-0.5">
                    {groupedSessions.today.map(session => (
                      <SessionItem
                        key={session.id}
                        session={session}
                        isSelected={selectedId === session.id}
                        onSelect={handleSelectSession}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Yesterday */}
              {groupedSessions.yesterday.length > 0 && (
                <div>
                  <p className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Yesterday
                  </p>
                  <div className="space-y-0.5">
                    {groupedSessions.yesterday.map(session => (
                      <SessionItem
                        key={session.id}
                        session={session}
                        isSelected={selectedId === session.id}
                        onSelect={handleSelectSession}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Older */}
              {groupedSessions.older.length > 0 && (
                <div>
                  <p className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Previous
                  </p>
                  <div className="space-y-0.5">
                    {groupedSessions.older.map(session => (
                      <SessionItem
                        key={session.id}
                        session={session}
                        isSelected={selectedId === session.id}
                        onSelect={handleSelectSession}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
            <Settings size={16} />
            Settings
          </button>
        </div>
      </aside>
    </>
  );
};

// Session item component
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
}) => {
  return (
    <div
      onClick={() => onSelect(session.id)}
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
        isSelected
          ? "bg-slate-100"
          : "hover:bg-slate-50"
      )}
    >
      <MessageSquare size={16} className="text-slate-400 flex-shrink-0" />
      <span className="flex-1 text-sm text-slate-700 truncate">
        {session.title || 'New conversation'}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(session.id);
        }}
        className={cn(
          "p-1 rounded-md transition-all",
          "opacity-0 group-hover:opacity-100",
          "text-slate-400 hover:text-red-500 hover:bg-red-50"
        )}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default ChatSidebar;
