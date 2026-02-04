/**
 * Knowledge Chat Page
 * ChatGPT-style chat interface for VocalScale Business Growth Assistant
 */

import { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useChatSessions } from '../../../hooks/useChat';
import ChatSidebar from './components/ChatSidebar';
import ChatInterface from './components/ChatInterface';
import { Menu, ChevronDown, SquarePen } from 'lucide-react';

const Chat = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile

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

  // Get current session title
  const currentSession = sessions.find(s => s.id === sessionId);

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
          {/* Header - ChatGPT style */}
          <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 hover:bg-slate-100 rounded-lg lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={22} className="text-slate-600" />
              </button>

              {/* Title with dropdown indicator */}
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <span className="font-semibold text-slate-900">
                  {currentSession?.title || ''}
                </span>
              </div>
            </div>

            {/* Right side - New Chat button */}
            <button
              onClick={handleNewChat}
              className="p-1.5 hover:bg-slate-100 rounded-lg"
              aria-label="New chat"
              title="Start new chat"
            >
              <SquarePen size={22} className="text-slate-600" />
            </button>
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
