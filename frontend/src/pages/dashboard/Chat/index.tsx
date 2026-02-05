/**
 * Knowledge Chat Page
 * ChatGPT-style chat interface for VocalScale Business Growth Assistant
 */

import { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useChatSessions } from '../../../hooks/useChat';
import ChatSidebar from './components/ChatSidebar';
import ChatInterface from './components/ChatInterface';
import { Menu, SquarePen, ChevronDown, MoreHorizontal } from 'lucide-react';
import { cn } from '../../../lib/utils';

const Chat = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { sessions, isLoading: loadingSessions, deleteSession } = useChatSessions();

  const handleNewChat = () => {
    setSessionId(null);
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
    <DashboardLayout fullWidth>
      <div className="h-full flex bg-white">
        {/* Sidebar */}
        <ChatSidebar
          sessions={sessions}
          selectedId={sessionId}
          onSelect={setSessionId}
          onNewChat={handleNewChat}
          onDelete={handleDeleteSession}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          loading={loadingSessions}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Header - ChatGPT Style */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Menu"
              >
                <Menu size={24} className="text-gray-700" />
              </button>

              {/* Model Name with dropdown indicator */}
              <button className="flex items-center gap-1 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors">
                <span className="font-semibold text-lg text-gray-900">VocalScale</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewChat}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="New chat"
                title="New chat"
              >
                <SquarePen size={22} className="text-gray-600" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Options"
              >
                <MoreHorizontal size={22} className="text-gray-600" />
              </button>
            </div>
          </header>

          {/* Chat Interface */}
          <div className="flex-1 min-h-0">
            <ChatInterface
              sessionId={sessionId}
              onSessionCreate={onSessionCreate}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
