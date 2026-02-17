

import { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useChatSessions } from '../../../hooks/useChat';
import ChatSidebar from './components/ChatSidebar';
import ChatInterface from './components/ChatInterface';
import ChatAnalytics from './components/ChatAnalytics';
import { Menu, MessageSquare, BarChart3, PanelLeftOpen } from 'lucide-react';
import { cn } from '../../../lib/utils';

type ActiveTab = 'chat' | 'analytics';

const Chat = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state
  const [isDesktopOpen, setIsDesktopOpen] = useState(true); // Desktop sidebar state
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

  const onToggleDesktopSidebar = () => {
    setIsDesktopOpen((prev) => !prev);
  };

  return (
    <DashboardLayout fullWidth hideTopNav>
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
          isDesktopOpen={isDesktopOpen}
          onToggleDesktopSidebar={onToggleDesktopSidebar}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Header */}
          <header className="flex items-center justify-between px-4 pt-4 pb-2 bg-white sticky top-0 z-30 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Menu"
              >
                <Menu size={24} className="text-gray-700" />
              </button>

              {/* Desktop open sidebar button */}
              {!isDesktopOpen && (
                <button
                  onClick={onToggleDesktopSidebar}
                  className="hidden lg:block p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Open sidebar"
                  title="Open sidebar"
                >
                  <PanelLeftOpen size={24} className="text-gray-700" />
                </button>
              )}

              {/* Title */}
              <span className="font-semibold text-lg text-gray-900">VocalScale AI</span>
            </div>

            {/* Tab Buttons */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('chat')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === 'chat'
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <MessageSquare size={15} />
                <span className="hidden sm:inline">Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === 'analytics'
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <BarChart3 size={15} />
                <span className="hidden sm:inline">Analytics</span>
              </button>
            </div>

            {/* Spacer to balance header layout */}
            <div className="w-10" />
          </header>

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
