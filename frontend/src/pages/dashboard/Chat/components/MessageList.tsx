import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ChatMessage as ChatMessageType } from '../../../../types/chat';
import ChatMessage from './ChatMessage';

interface MessageListProps {
    messages: ChatMessageType[];
    isStreaming: boolean;
    streamingContent: string;
    onSuggestionClick?: (text: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isStreaming, streamingContent, onSuggestionClick }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll on new messages or streaming
    useEffect(() => {
        if (isStreaming) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isStreaming, streamingContent]);

    return (
        <div className="max-w-3xl mx-auto px-4 py-2">
            {messages.map((message) => {
                if (!message || !message.id) return null;

                return (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ChatMessage message={message} isStreaming={false} />
                    </motion.div>
                );
            })}

            {/* Streaming Message */}
            {isStreaming && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChatMessage
                        message={{
                            id: 'streaming-temp',
                            session_id: 'streaming',
                            role: 'assistant',
                            content: streamingContent,
                            timestamp: new Date().toISOString(),
                            sources: [],
                            attachments: []
                        }}
                        isStreaming={true}
                    />
                </motion.div>
            )}

            {/* Suggested Questions */}
            {!isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && Array.isArray(messages[messages.length - 1].suggested_questions) && messages[messages.length - 1].suggested_questions!.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="flex flex-wrap gap-2 mt-4 max-w-2xl px-[52px] justify-start"
                >
                    {messages[messages.length - 1].suggested_questions!.map((q, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSuggestionClick?.(q)}
                            className="text-[13px] px-3.5 py-1.5 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors shadow-sm font-medium"
                        >
                            {q}
                        </button>
                    ))}
                </motion.div>
            )}

            <div ref={bottomRef} />
        </div>
    );
};
