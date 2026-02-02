/**
 * Chat Sidebar Component
 * Shows conversation list with search and new chat button
 */

import { useState } from 'react';
import { Plus, MessageSquare, Trash2, Search } from 'lucide-react';
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
  loading: boolean;
}

const ChatSidebar = ({
  sessions,
  selectedId,
  onSelect,
  onNewChat,
  onDelete,
  isOpen,
  loading,
}: ChatSidebarProps) => {
  const [search, setSearch] = useState('');

  const filteredSessions = sessions.filter(s =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.last_message?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={cn(
        'border-r border-white-light bg-white flex flex-col transition-all duration-300',
        'fixed lg:relative inset-y-0 left-0 z-40',
        isOpen ? 'w-80' : 'w-0 lg:w-0 overflow-hidden'
      )}
    >
      {/* Header */}
      <div className="h-14 border-b border-white-light flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-blue-electric" />
          <h3 className="font-semibold text-charcoal">Conversations</h3>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="w-full justify-center gap-2"
          variant="premium"
        >
          <Plus size={18} />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className={cn(
              'w-full pl-9 pr-4 py-2.5 text-sm rounded-lg',
              'bg-white-light/50 border border-white-light',
              'text-charcoal placeholder:text-charcoal-light',
              'focus:outline-none focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/10',
              'transition-all duration-200'
            )}
          />
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-white-light rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-charcoal-light">
              {search ? 'No matching conversations' : 'No conversations yet'}
            </p>
            <p className="text-xs text-charcoal-light mt-1">
              Start a new chat to begin
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredSessions.map(session => (
              <div
                key={session.id}
                onClick={() => onSelect(session.id)}
                className={cn(
                  'group p-3 rounded-xl cursor-pointer transition-all duration-200',
                  selectedId === session.id
                    ? 'bg-blue-electric/10 border border-blue-electric/20'
                    : 'hover:bg-white-light border border-transparent'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium truncate',
                        selectedId === session.id
                          ? 'text-blue-electric'
                          : 'text-charcoal'
                      )}
                    >
                      {session.title || 'Untitled'}
                    </p>
                    <p className="text-xs text-charcoal-light truncate mt-1">
                      {session.last_message || 'No messages yet'}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(session.id);
                    }}
                    className={cn(
                      'p-1.5 rounded-lg transition-all',
                      'opacity-0 group-hover:opacity-100',
                      'hover:bg-red-50 text-charcoal-light hover:text-red-500'
                    )}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-charcoal-light">
                    {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                  </p>
                  <span className="text-[10px] text-charcoal-light">
                    {session.message_count} messages
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
