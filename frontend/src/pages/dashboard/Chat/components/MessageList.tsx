import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ChatMessage as ChatMessageType } from '../../../../types/chat';
import ChatMessage from './ChatMessage';

interface MessageListProps {
    messages: ChatMessageType[];
    isStreaming: boolean;
    streamingContent: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isStreaming, streamingContent }) => {
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

            <div ref={bottomRef} />
        </div>
    );
};
