/**
 * Knowledge Chat Page
 * ChatGPT-style chat interface for VocalScale Business Growth Assistant
 */

import { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useChatSessions } from '../../../hooks/useChat';
import ChatSidebar from './components/ChatSidebar';
import ChatInterface from './components/ChatInterface';
import { ChatAnalytics } from './components/ChatAnalytics';
import {
  Menu,
  SquarePen,
  MessageSquare,
  BarChart3,
  Sparkles,
  Bot,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

type TabType = 'chat' | 'analytics';

const Chat = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('chat');

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

  // Get current session title
  const currentSession = sessions.find(s => s.id === sessionId);

  return (
    <DashboardLayout fullWidth>
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
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Enhanced Header */}
          <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
            {/* Top Bar - Model & Actions */}
            <div className="h-14 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
                  aria-label="Open menu"
                >
                  <Menu size={22} className="text-slate-600" />
                </button>

                {/* Model Indicator */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/50 rounded-lg">
                    <Bot size={16} className="text-violet-600" />
                    <span className="font-semibold text-sm text-violet-900">Gemini 2.0 Flash</span>
                    <Badge variant="info" size="sm" className="ml-1">
                      <Sparkles size={10} className="mr-1" />
                      Pro
                    </Badge>
                  </div>
                </div>

                {/* Session Title */}
                {currentSession && (
                  <div className="hidden md:flex items-center gap-2 text-slate-500">
                    <span className="text-slate-300">|</span>
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                      {currentSession.title}
                    </span>
                  </div>
                )}
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleNewChat}
                  className="text-slate-600 hover:text-slate-900"
                  title="Start new chat"
                >
                  <SquarePen size={20} />
                </Button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-4 flex items-center gap-1 border-t border-slate-100 bg-slate-50/50">
              <TabButton
                active={activeTab === 'chat'}
                onClick={() => setActiveTab('chat')}
                icon={<MessageSquare size={16} />}
                label="Chat"
              />
              <TabButton
                active={activeTab === 'analytics'}
                onClick={() => setActiveTab('analytics')}
                icon={<BarChart3 size={16} />}
                label="Analytics"
                badge={sessions.length > 0 ? sessions.length.toString() : undefined}
              />
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 min-h-0">
            {activeTab === 'chat' ? (
              <ChatInterface
                sessionId={sessionId}
                onSessionCreate={onSessionCreate}
              />
            ) : (
              <div className="h-full overflow-y-auto p-4 bg-slate-50/30">
                <ChatAnalytics />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all relative",
      "hover:text-slate-900",
      active
        ? "text-blue-600"
        : "text-slate-500"
    )}
  >
    {icon}
    <span>{label}</span>
    {badge && (
      <span className={cn(
        "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
        active
          ? "bg-blue-100 text-blue-700"
          : "bg-slate-200 text-slate-600"
      )}>
        {badge}
      </span>
    )}
    {/* Active indicator */}
    {active && (
      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full" />
    )}
  </button>
);

export default Chat;
