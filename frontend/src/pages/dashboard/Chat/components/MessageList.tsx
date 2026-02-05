import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Check, Copy, ThumbsUp, ThumbsDown, Share, RotateCcw, MoreHorizontal, Pencil } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import type { ChatMessage, Source } from '../../../../types/chat';

interface MessageListProps {
    messages: ChatMessage[];
    isStreaming: boolean;
    streamingContent: string;
}

// Copy button with feedback
const CopyButton = ({ content }: { content: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={cn(
                "action-btn p-1.5 rounded-md transition-all",
                copied ? "text-[#10a37f]" : "text-gray-400 hover:text-gray-600"
            )}
            title={copied ? "Copied!" : "Copy"}
        >
            {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
    );
};

// Source chip for knowledge base references
const SourceChip = ({ source }: { source: Source }) => (
    <div
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs hover:bg-gray-100 transition-colors cursor-default"
        title={source.excerpt}
    >
        <div className="w-5 h-5 rounded flex items-center justify-center bg-blue-100 text-blue-600">
            <FileText size={10} />
        </div>
        <span className="font-medium text-gray-700 truncate max-w-[150px]">{source.name || 'Document'}</span>
    </div>
);

// User message action buttons
const UserMessageActions = ({ content }: { content: string }) => (
    <div className={cn(
        "msg-actions flex items-center gap-1 mt-2",
        // Mobile: always visible, Desktop: show on hover
        "flex opacity-100",
        "md:opacity-0 md:group-hover:opacity-100",
        "justify-end pr-1"
    )}>
        <CopyButton content={content} />
        <button
            className="action-btn p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-all"
            title="Edit"
        >
            <Pencil size={18} />
        </button>
    </div>
);

// Assistant message action buttons
const AssistantMessageActions = ({ content }: { content: string }) => {
    const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

    return (
        <div className={cn(
            "msg-actions flex items-center gap-1 mt-2",
            // Mobile: always visible, Desktop: show on hover
            "flex opacity-100",
            "md:opacity-0 md:group-hover:opacity-100",
            "justify-start pl-1"
        )}>
            <CopyButton content={content} />
            <button
                onClick={() => setFeedbackGiven(feedbackGiven === 'up' ? null : 'up')}
                className={cn(
                    "action-btn p-1.5 rounded-md transition-all",
                    feedbackGiven === 'up'
                        ? "text-[#10a37f]"
                        : "text-gray-400 hover:text-gray-600"
                )}
                title="Good response"
            >
                <ThumbsUp size={18} fill={feedbackGiven === 'up' ? 'currentColor' : 'none'} />
            </button>
            <button
                onClick={() => setFeedbackGiven(feedbackGiven === 'down' ? null : 'down')}
                className={cn(
                    "action-btn p-1.5 rounded-md transition-all",
                    feedbackGiven === 'down'
                        ? "text-red-500"
                        : "text-gray-400 hover:text-gray-600"
                )}
                title="Bad response"
            >
                <ThumbsDown size={18} fill={feedbackGiven === 'down' ? 'currentColor' : 'none'} />
            </button>
            <button
                className="action-btn p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-all"
                title="Share"
            >
                <Share size={18} />
            </button>
            <button
                className="action-btn p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-all"
                title="Regenerate"
            >
                <RotateCcw size={18} />
            </button>
            <button
                className="action-btn p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-all"
                title="More"
            >
                <MoreHorizontal size={18} />
            </button>
        </div>
    );
};

// Typing indicator
const TypingIndicator = () => (
    <div className="flex gap-1 py-3 px-4">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.4s' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.4s' }} />
    </div>
);

export const MessageList: React.FC<MessageListProps> = ({ messages, isStreaming, streamingContent }) => {
    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.map((message) => (
                <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="message-wrapper group mb-6"
                >
                    {message.role === 'user' ? (
                        // User message - right aligned, gray bubble
                        <>
                            <div className="flex justify-end">
                                <div
                                    className="msg-bubble-user max-w-[85%] md:max-w-[80%] bg-gray-100 rounded-3xl px-4 py-2 text-gray-800 text-[16px]"
                                >
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                            <UserMessageActions content={message.content} />
                        </>
                    ) : (
                        // Assistant message - left aligned, no bubble
                        <>
                            <div className="flex justify-start">
                                <div className="msg-bubble-assistant max-w-full text-gray-800 leading-relaxed whitespace-pre-line text-[16px]">
                                    {message.content}
                                </div>
                            </div>

                            {/* Sources */}
                            {message.sources && message.sources.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {message.sources.map((source, idx) => (
                                        <SourceChip key={idx} source={source} />
                                    ))}
                                </div>
                            )}

                            <AssistantMessageActions content={message.content} />
                        </>
                    )}
                </motion.div>
            ))}

            {/* Streaming Message */}
            {isStreaming && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="message-wrapper mb-6"
                >
                    <div className="flex justify-start">
                        <div className="msg-bubble-assistant text-gray-800 leading-relaxed text-[16px]">
                            {streamingContent ? (
                                <span className="whitespace-pre-line">
                                    {streamingContent}
                                    <span className="inline-block w-0.5 h-4 ml-0.5 bg-gray-800 animate-pulse align-text-bottom" />
                                </span>
                            ) : (
                                <TypingIndicator />
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
