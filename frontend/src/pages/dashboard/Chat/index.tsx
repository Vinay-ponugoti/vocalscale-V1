

import { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useChatSessions } from '../../../hooks/useChat';
import ChatSidebar from './components/ChatSidebar';
import ChatInterface from './components/ChatInterface';
import ChatAnalytics from './components/ChatAnalytics';
import { Menu, SquarePen, MessageSquare, BarChart3 } from 'lucide-react';

import { cn } from '../../../lib/utils';

type ActiveTab = 'chat' | 'analytics';

const Chat = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');

  const { sessions, isLoading: loadingSessions, deleteSession } = useChatSessions();

  const handleNewChat = () => {
    setSessionId(null);
    setActiveTab('chat');
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    if (sessionId === id) {
      setSessionId(null);
    }
  };

  const onSessionCreate = (newSessionId: string) => {
    setSessionId(newSessionId);
  };

  return (
    <DashboardLayout fullWidth hideHeader>
      <div className="h-full flex bg-white">
        {/* Sidebar */}
        <ChatSidebar
          sessions={sessions}
          selectedId={sessionId}
          onSelect={(id) => {
            setSessionId(id);
            setActiveTab('chat');
          }}
          onNewChat={handleNewChat}
          onDelete={handleDeleteSession}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          loading={loadingSessions}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

          {/* Slim toolbar — mobile hamburger + tabs + new-chat (no duplicate title/nav) */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-white shrink-0">
            {/* Mobile: open sidebar drawer */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={20} className="text-gray-600" />
            </button>

            {/* Tab switcher */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 mx-auto lg:mx-0">
              <button
                onClick={() => setActiveTab('chat')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === 'chat' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <MessageSquare size={14} />
                <span className="hidden sm:inline">Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === 'analytics' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <BarChart3 size={14} />
                <span className="hidden sm:inline">Analytics</span>
              </button>
            </div>

            {/* New chat button */}
            {activeTab === 'chat' && (
              <button
                onClick={handleNewChat}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="New chat"
                title="New chat"
              >
                <SquarePen size={20} className="text-gray-600" />
              </button>
            )}
            {activeTab !== 'chat' && <div className="w-8" />}
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0">
            {activeTab === 'chat' ? (
              <ChatInterface
                sessionId={sessionId}
                onSessionCreate={onSessionCreate}
              />
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
