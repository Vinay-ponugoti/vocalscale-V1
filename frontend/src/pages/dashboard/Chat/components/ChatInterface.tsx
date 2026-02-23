/**
 * Chat Interface Component
 * ChatGPT-style main chat area with messages and input
 */

import React, { useRef, useEffect, useState } from 'react';
import { MessageList } from './MessageList';
import { PromptInput } from './PromptInput';
import type { ModelOption } from '../../../../types/chat';
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

  const handleSendMessage = async (content: string, model?: ModelOption) => {
    if (isAppLoading) return;
    const newId = await activeSendMessage(content, model || 'auto');
    if (newId && onSessionCreate) {
      onSessionCreate(newId);
    }
  };

  const showEmptyState = !sessionId && messages.length === 0;

  return (
    <div className="flex flex-col h-full relative bg-white overflow-hidden">

      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={cn(
          "flex-1 overflow-y-auto w-full",
          "[&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0",
          "scrollbar-none"
        )}
      >
        {/* Error Banner */}
        {error && (
          <div className="sticky top-0 z-10 px-4 py-2.5 bg-red-50 border-b border-red-200 text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle size={15} />
              <span className="font-medium">Error:</span> {error}
            </div>
            <button
              onClick={clearError}
              className="p-1 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X size={15} />
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

      {/* Scroll to bottom button — premium pill with blue hover glow */}
      <button
        onClick={scrollToBottom}
        className={cn(
          "absolute left-1/2 -translate-x-1/2 z-40",
          "bottom-[96px]",
          "flex items-center gap-1.5 px-3.5 py-2 rounded-full",
          "bg-white border border-gray-200",
          "shadow-[0_2px_12px_rgba(0,0,0,0.10)]",
          "text-gray-600 text-xs font-medium",
          "hover:border-blue-200 hover:shadow-[0_4px_16px_rgba(59,130,246,0.15)] hover:text-blue-600",
          "transition-all duration-200",
          showScrollButton
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-3 pointer-events-none"
        )}
        aria-label="Scroll to bottom"
      >
        <span className="font-medium">Recent Messages</span>
      </button>

      {/* Input area */}
      <div
        className="w-full flex justify-center shrink-0 z-20 px-4 pt-2 pb-6 bg-gradient-to-t from-white via-white to-transparent"
      >
        <div className="w-full max-w-3xl mx-auto relative">
          {/* Image generation status badge */}
          {imageStatus && imageStatus !== 'complete' && (
            <div className="mb-2 flex justify-center">
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
          <p className="text-center text-[10px] text-gray-400 mt-2 select-none tracking-wide">
            VocalScale AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
