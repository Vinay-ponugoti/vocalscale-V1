/**
 * Chat Interface Component
 * Main chat area with messages, input, and skill selection
 */

import React, { useRef, useEffect, useState } from 'react';
import { MessageList } from './MessageList';
import { PromptInput } from './PromptInput';
import EmptyState from './EmptyState';
import { SkillSelector } from './SkillSelector';
import { useChat } from '../../../../hooks/useChat';
import { useAuth } from '../../../../context/AuthContext';
import { ChevronDown, AlertCircle, X } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Button } from '../../../../components/ui/Button';

interface ChatInterfaceProps {
  sessionId?: string | null;
  onSessionCreate?: (newSessionId: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId, onSessionCreate }) => {
  const { user, loading: authLoading } = useAuth();
  const {
    messages,
    sendMessage: activeSendMessage,
    isStreaming,
    streamingContent,
    uploadFile,
    pendingFiles,
    removeFile,
    error,
    clearError,
    selectedSkill,
    setSelectedSkill,
  } = useChat(sessionId || null);

  const isAppLoading = authLoading || !user;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, streamingContent, isStreaming]);

  // Handle scroll to show/hide scroll button
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!nearBottom);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    if (isAppLoading) return;
    const newId = await activeSendMessage(content);
    if (newId && onSessionCreate) {
      onSessionCreate(newId);
    }
  };

  const showEmptyState = !sessionId && messages.length === 0;

  return (
    <div className="flex flex-col h-full relative bg-white">
      {/* Skills Selector - Clean header section */}
      <SkillSelector
        selectedSkill={selectedSkill}
        onSelect={setSelectedSkill}
      />

      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={cn(
          "flex-1 overflow-y-auto w-full",
          // Custom scrollbar styling
          "scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent",
          "hover:scrollbar-thumb-slate-300"
        )}
      >
        {/* Error Banner */}
        {error && (
          <div className="sticky top-0 z-10 mx-4 mt-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle size={18} className="shrink-0" />
              <div className="flex-1 text-sm">
                <span className="font-medium">Error:</span> {error}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={clearError}
                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-100"
              >
                <X size={14} />
              </Button>
            </div>
          </div>
        )}

        {showEmptyState ? (
          <EmptyState onSuggestionClick={handleSendMessage} />
        ) : (
          <MessageList
            messages={messages}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
          />
        )}
      </div>

      {/* Scroll to bottom button */}
      <button
        onClick={scrollToBottom}
        className={cn(
          "absolute left-1/2 -translate-x-1/2 bottom-[140px] md:bottom-[120px]",
          "w-9 h-9 bg-white border border-slate-200 rounded-full",
          "flex items-center justify-center shadow-lg",
          "transition-all duration-200 hover:bg-slate-50 hover:border-slate-300",
          showScrollButton
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        )}
        aria-label="Scroll to bottom"
      >
        <ChevronDown size={20} className="text-slate-600" />
      </button>

      {/* Input area */}
      <div
        className={cn(
          "shrink-0 w-full pt-2 bg-white",
          "md:relative",
          // Mobile: fixed positioning
          "fixed bottom-0 left-0 right-0 md:static",
          "pb-safe border-t border-slate-100 md:border-t-0"
        )}
      >
        <PromptInput
          onSend={handleSendMessage}
          onFileUpload={uploadFile}
          disabled={isStreaming || isAppLoading}
          pendingFiles={pendingFiles}
          onRemoveFile={removeFile}
          placeholder={isAppLoading ? "Authenticating..." : "Ask anything about your business..."}
        />
      </div>

      {/* Spacer for fixed input on mobile */}
      <div className="h-[120px] md:hidden shrink-0" />
    </div>
  );
};

export default ChatInterface;
