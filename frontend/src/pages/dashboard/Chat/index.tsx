/**
 * Knowledge Chat Page
 * Chat interface with persistent Cognee memory
 */

import { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useChatSessions } from '../../../hooks/useChat';
import { Button } from '../../../components/ui/Button';
import ChatSidebar from './components/ChatSidebar';
import ChatInterface from './components/ChatInterface';
import { Brain, PanelLeftClose, PanelLeft } from 'lucide-react';

const Chat = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      <div className="h-full flex bg-slate-50">
        {/* Sidebar */}
        <ChatSidebar
          sessions={sessions}
          selectedId={sessionId}
          onSelect={setSessionId}
          onNewChat={handleNewChat}
          onDelete={handleDeleteSession}
          isOpen={sidebarOpen}
          loading={loadingSessions}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Header */}
          <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-slate-500 hover:text-slate-900"
              >
                {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Brain size={16} className="text-blue-600" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800">
                    {currentSession?.title || 'New Conversation'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* New Chat Interface */}
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
