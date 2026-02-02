import React, { useState, useRef, useEffect } from 'react';
import { Brain, X, MessageSquare, Send, Paperclip, Loader2, Minus, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../hooks/useChat';
import ChatMessage from '../pages/dashboard/Chat/components/ChatMessage';
import ChatInput from '../pages/dashboard/Chat/components/ChatInput';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

/**
 * Global event for triggering the chat from other components
 */
export const toggleFloatingChat = () => {
    window.dispatchEvent(new CustomEvent('toggle-floating-chat'));
};

const FloatingChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Listen for external toggle events
    useEffect(() => {
        const handleToggle = () => setIsOpen((prev) => !prev);
        window.addEventListener('toggle-floating-chat', handleToggle);
        return () => window.removeEventListener('toggle-floating-chat', handleToggle);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, streamingContent, isOpen, isMinimized]);

    const handleSendMessage = async (content: string) => {
        const newSessionId = await sendMessage(content);
        if (!sessionId && newSessionId) {
            setSessionId(newSessionId);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            height: isMinimized ? '64px' : '600px',
                            width: isMinimized ? '300px' : '400px'
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={cn(
                            "bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300",
                            isMinimized ? "mb-4" : "mb-4 h-[600px] w-[400px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)]"
                        )}
                    >
                        {/* Header */}
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <Brain size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Knowledge Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] text-slate-400 font-medium">Always Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                                    {messages.length === 0 && !isStreaming && (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                                <MessageSquare size={24} />
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 mb-1">Welcome!</p>
                                            <p className="text-xs text-slate-500 max-w-[200px]">
                                                Ask me anything about your business documents and knowledge base.
                                            </p>
                                        </div>
                                    )}

                                    {messages.map((msg) => (
                                        <ChatMessage key={msg.id} message={msg} />
                                    ))}

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

                                    {isStreaming && !streamingContent && (
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                                <Brain size={16} className="text-white" />
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                                <span className="w-1.5 h-1.5 bg-blue-600/60 rounded-full animate-bounce" />
                                                <span className="w-1.5 h-1.5 bg-blue-600/60 rounded-full animate-bounce [animation-delay:0.1s]" />
                                                <span className="w-1.5 h-1.5 bg-blue-600/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex flex-col gap-2">
                                            <p>{error}</p>
                                            <button onClick={clearError} className="font-bold underline text-left text-red-700">Dismiss</button>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 border-t border-slate-100 bg-white">
                                    <ChatInput
                                        onSend={handleSendMessage}
                                        onFileUpload={uploadFile}
                                        pendingFiles={pendingFiles}
                                        onRemoveFile={removeFile}
                                        disabled={isStreaming}
                                    />
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    if (isMinimized) setIsMinimized(false);
                    setIsOpen(!isOpen);
                }}
                className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300",
                    isOpen ? "bg-slate-900 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                )}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X size={24} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <Brain size={24} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Unread dot or similar could go here */}
            </motion.button>
        </div>
    );
};

export default FloatingChat;
