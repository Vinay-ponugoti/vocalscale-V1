import { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import ChatInterface from './components/ChatInterface';
import ChatAnalytics from './components/ChatAnalytics';
import { SquarePen, MessageSquare, BarChart3, History, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useChatSessions } from '../../../hooks/useChat';

import { cn } from '../../../lib/utils';

type ActiveTab = 'chat' | 'analytics';

const Chat = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [historyOpen, setHistoryOpen] = useState(false);
  const { sessions, isLoading: sessionsLoading, deleteSession } = useChatSessions();

  const handleNewChat = () => {
    setSessionId(null);
    setActiveTab('chat');
  };

  const onSessionCreate = (newSessionId: string) => {
    setSessionId(newSessionId);
  };

  const openSession = (id: string) => {
    setSessionId(id);
    setActiveTab('chat');
    if (window.innerWidth < 768) setHistoryOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    if (sessionId === id) setSessionId(null);
  };

  return (
    <DashboardLayout fullWidth>
      <div className="h-full flex flex-col bg-white min-w-0">

        {/* Unique branded sub-header */}
        <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 border-b border-gray-100 bg-white shrink-0">
          {/* Left: assistant identity */}
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-none truncate">AI Assistant</p>
            <p className="text-[11px] text-gray-400 leading-none mt-1 truncate">Knows your business</p>
          </div>

          {/* Right: history + tab switcher + new chat */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setHistoryOpen(o => !o)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border transition-colors',
                historyOpen
                  ? 'text-gray-900 bg-gray-100 border-gray-200'
                  : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              )}
              title="Chat history"
            >
              <History size={15} />
              <span className="hidden sm:inline">History</span>
            </button>

            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('chat')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  activeTab === 'chat' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <MessageSquare size={14} />
                <span className="hidden sm:inline">Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  activeTab === 'analytics' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <BarChart3 size={14} />
                <span className="hidden sm:inline">Analytics</span>
              </button>
            </div>

            {activeTab === 'chat' && (
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                title="New chat"
              >
                <SquarePen size={15} />
                <span className="hidden sm:inline">New</span>
              </button>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-h-0 flex">
          {/* History sidebar */}
          {historyOpen && (
            <aside className="w-72 max-w-[85vw] shrink-0 border-r border-gray-100 bg-gray-50/60 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Conversations</p>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label="Close history"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sessionsLoading ? (
                  <p className="px-3 py-4 text-sm text-gray-400">Loading…</p>
                ) : sessions.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-gray-400">No conversations yet. Start chatting and they'll appear here.</p>
                ) : (
                  sessions.map(s => (
                    <div
                      key={s.id}
                      className={cn(
                        'group relative rounded-lg transition-colors',
                        sessionId === s.id ? 'bg-white shadow-sm ring-1 ring-gray-200' : 'hover:bg-white/80'
                      )}
                    >
                      <button
                        onClick={() => openSession(s.id)}
                        className="w-full text-left px-3 py-2.5 pr-9"
                      >
                        <p className="text-sm font-medium text-gray-800 truncate">{s.title || 'Untitled chat'}</p>
                        <p className="mt-0.5 text-xs text-gray-400 truncate">
                          {s.last_message || `${s.message_count} messages`}
                        </p>
                        <p className="mt-0.5 text-[10px] text-gray-400">
                          {formatDistanceToNow(new Date(s.updated_at), { addSuffix: true })}
                        </p>
                      </button>
                      <button
                        onClick={() => handleDeleteSession(s.id)}
                        className="absolute right-2 top-2.5 p-1 rounded-md text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                        title="Delete conversation"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </aside>
          )}

          <div className="flex-1 min-w-0 min-h-0">
            {activeTab === 'chat' ? (
              <ChatInterface sessionId={sessionId} onSessionCreate={onSessionCreate} />
            ) : (
              <ChatAnalytics />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
