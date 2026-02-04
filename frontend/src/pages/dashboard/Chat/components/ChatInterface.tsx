import React, { useRef, useEffect } from 'react';
import { MessageList } from './MessageList';
import { PromptInput } from './PromptInput';
import { useChat } from '../../../../hooks/useChat';
import { Loader2, Brain, Sparkles } from 'lucide-react';

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

    // Auto-scroll to bottom of messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, streamingContent, isStreaming]);

    const handleSendMessage = async (content: string) => {
        const newId = await activeSendMessage(content);
        if (newId && onSessionCreate) {
            onSessionCreate(newId);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header if needed, or just let DashboardLayout handle it */}

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto w-full custom-scrollbar relative"
            >
                {/* Error Banner */}
                {error && (
                    <div className="sticky top-0 z-10 p-4 bg-red-50 border-b border-red-200 text-red-700 flex items-center justify-between animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold">Error:</span> {error}
                        </div>
                        <button
                            onClick={clearError}
                            className="text-red-500 hover:text-red-800 p-1 hover:bg-red-100 rounded"
                        >
                            ✕
                        </button>
                    </div>
                )}
                {!sessionId && messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 relative group">
                            <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-xl group-hover:bg-blue-500/20 transition-all duration-500" />
                            <Brain size={32} className="text-blue-600 relative z-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">How can I help grow your business?</h2>
                        <p className="text-slate-500 max-w-md mb-8">
                            I'm your business growth assistant. I can help you get more customers, create marketing content, analyze your performance, and provide actionable advice.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                            {['How can I get more customers?', 'Write a promotional SMS for my services', 'Analyze my call performance', 'Create a social media post'].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => handleSendMessage(suggestion)}
                                    className="p-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-blue-600 hover:shadow-md transition-all text-left flex items-center gap-3 group"
                                >
                                    <Sparkles size={16} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <MessageList
                        messages={messages}
                        isStreaming={isStreaming}
                        streamingContent={streamingContent}
                    />
                )}
            </div>

            <div className="shrink-0 w-full bg-slate-50/50 pt-2">
                <PromptInput
                    onSend={handleSendMessage}
                    onFileUpload={uploadFile}
                    disabled={isStreaming}
                    pendingFiles={pendingFiles}
                    onRemoveFile={removeFile}
                />
            </div>
        </div>
    );
};

export default ChatInterface;
