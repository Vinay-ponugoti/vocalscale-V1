import { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import ChatInterface from './components/ChatInterface';
import ChatAnalytics from './components/ChatAnalytics';
import { SquarePen, MessageSquare, BarChart3 } from 'lucide-react';

import { cn } from '../../../lib/utils';

type ActiveTab = 'chat' | 'analytics';

const Chat = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');

  const handleNewChat = () => {
    setSessionId(null);
    setActiveTab('chat');
  };

  const onSessionCreate = (newSessionId: string) => {
    setSessionId(newSessionId);
  };

  return (
    <DashboardLayout fullWidth>
      <div className="h-full flex flex-col bg-white min-w-0">

        {/* Unique branded sub-header (replaces the conversation sidebar) */}
        <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 border-b border-gray-100 bg-white shrink-0">
          {/* Left: assistant identity */}
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-none truncate">AI Assistant</p>
            <p className="text-[11px] text-gray-400 leading-none mt-1 truncate">Knows your business</p>
          </div>

          {/* Right: tab switcher + new chat */}
          <div className="flex items-center gap-2 shrink-0">
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
        <div className="flex-1 min-h-0">
          {activeTab === 'chat' ? (
            <ChatInterface sessionId={sessionId} onSessionCreate={onSessionCreate} />
          ) : (
            <ChatAnalytics />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
