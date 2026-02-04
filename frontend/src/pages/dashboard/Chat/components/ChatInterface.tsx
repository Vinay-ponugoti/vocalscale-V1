import React, { useRef, useEffect, useState } from 'react';
import { MessageList } from './MessageList';
import { PromptInput } from './PromptInput';
import EmptyState from './EmptyState';
import { useChat } from '../../../../hooks/useChat';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface ChatInterfaceProps {
    sessionId?: string | null;
    onSessionCreate?: (newSessionId: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId, onSessionCreate }) => {
    const {
        messages,
        sendMessage: activeSendMessage,
        isStreaming,
        streamingContent,
        uploadFile,
        pendingFiles,
        removeFile,
        error,
        clearError
    } = useChat(sessionId || null);

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
        const newId = await activeSendMessage(content);
        if (newId && onSessionCreate) {
            onSessionCreate(newId);
        }
    };

    const showEmptyState = !sessionId && messages.length === 0;

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Messages area */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className={cn(
                    "flex-1 overflow-y-auto w-full",
                    // Hide scrollbar but keep functionality
                    "[&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0",
                    "scrollbar-none"
                )}
            >
                {/* Error Banner */}
                {error && (
                    <div className="sticky top-0 z-10 p-3 bg-red-50 border-b border-red-200 text-red-700 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Error:</span> {error}
                        </div>
                        <button
                            onClick={clearError}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-100 rounded"
                        >
                            ✕
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
                    "absolute left-1/2 -translate-x-1/2 bottom-[140px] md:bottom-[120px]",
                    "w-9 h-9 bg-white border border-slate-200 rounded-full",
                    "flex items-center justify-center shadow-md",
                    "transition-all duration-200",
                    showScrollButton
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none"
                )}
                aria-label="Scroll to bottom"
            >
                <ChevronDown size={20} className="text-slate-600" />
            </button>

            {/* Input area - fixed at bottom on mobile */}
            <div className={cn(
                "shrink-0 w-full bg-white pt-2",
                "md:relative",
                // Mobile: fixed positioning
                "fixed bottom-0 left-0 right-0 md:static",
                "pb-safe" // Safe area for iOS
            )}>
                <PromptInput
                    onSend={handleSendMessage}
                    onFileUpload={uploadFile}
                    disabled={isStreaming}
                    pendingFiles={pendingFiles}
                    onRemoveFile={removeFile}
                />
            </div>

            {/* Spacer for fixed input on mobile */}
            <div className="h-[120px] md:hidden shrink-0" />
        </div>
    );
};

export default ChatInterface;
