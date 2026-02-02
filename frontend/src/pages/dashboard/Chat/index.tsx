/**
 * Knowledge Chat Page
 * Chat interface with persistent Cognee memory
 */

import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useChat, useChatSessions } from '../../../hooks/useChat';
import { Button } from '../../../components/ui/Button';
import ChatSidebar from './components/ChatSidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import EmptyState from './components/EmptyState';
import { Brain, PanelLeftClose, PanelLeft, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

const Chat = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sessions, isLoading: loadingSessions, deleteSession } = useChatSessions();
  const {
    messages,
    streamingContent,
    isStreaming,
    isLoading,
    pendingFiles,
    error,
    sendMessage,
    uploadFile,
    removeFile,
    clearError,
  } = useChat(sessionId);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleNewChat = () => {
    setSessionId(null);
  };

  const handleSendMessage = async (content: string) => {
    const newSessionId = await sendMessage(content);
    // If this was a new chat, update the session ID
    if (!sessionId && newSessionId) {
      setSessionId(newSessionId);
    }
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    if (sessionId === id) {
      setSessionId(null);
    }
  };

  // Get current session title
  const currentSession = sessions.find(s => s.id === sessionId);

  return (
    <DashboardLayout fullWidth>
      <div className="h-[calc(100vh-4rem)] flex bg-white-light/30">
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
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-14 border-b border-white-light bg-white flex items-center justify-between px-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-charcoal-medium hover:text-charcoal"
              >
                {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-electric/10 flex items-center justify-center">
                  <Brain size={16} className="text-blue-electric" />
                </div>
                <div>
                  <span className="font-semibold text-charcoal">
                    {currentSession?.title || 'New Conversation'}
                  </span>
                  {isStreaming && (
                    <span className="ml-2 text-xs text-blue-electric animate-pulse">
                      Thinking...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm flex-1">{error}</span>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {!sessionId && messages.length === 0 ? (
                <EmptyState onSuggestionClick={handleSendMessage} />
              ) : isLoading ? (
                // Loading skeleton
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-white-light" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white-light rounded w-3/4" />
                        <div className="h-4 bg-white-light rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}

                  {/* Streaming response */}
                  {isStreaming && streamingContent && (
                    <ChatMessage
                      message={{
                        id: 'streaming',
                        session_id: sessionId || '',
                        role: 'assistant',
                        content: streamingContent,
                        timestamp: new Date().toISOString(),
                      }}
                      isStreaming
                    />
                  )}

                  {/* Typing indicator */}
                  {isStreaming && !streamingContent && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-electric flex items-center justify-center">
                        <Brain size={16} className="text-white" />
                      </div>
                      <div className="flex items-center gap-1.5 px-4 py-3 bg-white rounded-2xl border border-white-light shadow-sm">
                        <span className="w-2 h-2 bg-blue-electric/60 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-blue-electric/60 rounded-full animate-bounce [animation-delay:0.1s]" />
                        <span className="w-2 h-2 bg-blue-electric/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-white-light bg-white p-4 shadow-lg">
            <div className="max-w-3xl mx-auto">
              <ChatInput
                onSend={handleSendMessage}
                onFileUpload={uploadFile}
                pendingFiles={pendingFiles}
                onRemoveFile={removeFile}
                disabled={isStreaming}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
