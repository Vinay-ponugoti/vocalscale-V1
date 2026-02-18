/**
 * Chat Interface Component
 * ChatGPT-style main chat area with messages and input
 */

import React, { useRef, useEffect, useState } from 'react';
import { MessageList } from './MessageList';
import { PromptInput } from './PromptInput';
import EmptyState from './EmptyState';
import { useChat } from '../../../../hooks/useChat';
import { useAuth } from '../../../../context/AuthContext';
import { ChevronDown, AlertCircle, X } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { ImageStatusBadge } from './ImageCard';

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
    imageStatus,
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

      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={cn(
          "flex-1 overflow-y-auto w-full",
          // Hide scrollbar like ChatGPT
          "[&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0",
          "scrollbar-none",
          // Mobile padding for fixed input
          "pb-[140px] md:pb-0"
        )}
      >
        {/* Error Banner */}
        {error && (
          <div className="sticky top-0 z-10 p-3 bg-red-50 border-b border-red-200 text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              <span className="font-medium">Error:</span> {error}
            </div>
            <button
              onClick={clearError}
              className="p-1 hover:bg-red-100 rounded transition-colors"
            >
              <X size={16} />
            </button>
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
          "fixed left-1/2 -translate-x-1/2 z-40",
          "bottom-[120px] md:bottom-[100px]",
          "w-9 h-9 bg-white border border-gray-200 rounded-full",
          "flex items-center justify-center shadow-md",
          "transition-all duration-200 hover:bg-gray-50",
          showScrollButton
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        )}
        aria-label="Scroll to bottom"
      >
        <ChevronDown size={20} className="text-gray-600" />
      </button>

      {/* Input area - ChatGPT style fixed at bottom on mobile */}
      <div
        className={cn(
          "bg-white border-t border-gray-200",
          "px-4 py-4",
          // Mobile: fixed positioning
          "fixed bottom-0 left-0 right-0 md:relative",
          "z-50"
        )}
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Image generation status badge */}
          {imageStatus && imageStatus !== 'complete' && (
            <div className="mb-3 flex justify-center">
              <ImageStatusBadge status={imageStatus} />
            </div>
          )}
          <PromptInput
            onSend={handleSendMessage}
            onFileUpload={uploadFile}
            disabled={isStreaming || isAppLoading}
            pendingFiles={pendingFiles}
            onRemoveFile={removeFile}
            placeholder={isAppLoading ? "Authenticating..." : "Ask anything — try: 'Create a 20% off Instagram post'"}
          />
          <p className="text-center text-xs text-gray-400 mt-2">
            VocalScale can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
