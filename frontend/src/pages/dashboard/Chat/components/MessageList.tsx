import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, FileText, Check, Copy, ThumbsUp, ThumbsDown, Share, RotateCcw, MoreHorizontal, Pencil } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import type { ChatMessage, Source } from '../../../../types/chat';

interface MessageListProps {
    messages: ChatMessage[];
    isStreaming: boolean;
    streamingContent: string;
}

const CopyButton = ({ content, size = 18 }: { content: string; size?: number }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            title="Copy message"
        >
            {copied ? <Check size={size} /> : <Copy size={size} />}
        </button>
    );
};

const SourceChip = ({ source }: { source: Source }) => (
    <div
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-slate-100 transition-colors cursor-default"
        title={source.excerpt}
    >
        <div className="w-5 h-5 rounded flex items-center justify-center bg-blue-100 text-blue-600">
            <FileText size={10} />
        </div>
        <span className="font-medium text-slate-700 truncate max-w-[150px]">{source.name || 'Document'}</span>
    </div>
);

// Message action buttons component
const MessageActions = ({
    role,
    content,
    onEdit
}: {
    role: 'user' | 'assistant';
    content: string;
    onEdit?: () => void;
}) => {
    const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

    if (role === 'user') {
        return (
            <div className="flex items-center gap-1 justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                <CopyButton content={content} />
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        title="Edit message"
                    >
                        <Pencil size={18} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
            <CopyButton content={content} />
            <button
                onClick={() => setFeedbackGiven(feedbackGiven === 'up' ? null : 'up')}
                className={cn(
                    "p-1.5 rounded-lg transition-all",
                    feedbackGiven === 'up'
                        ? "text-green-600 bg-green-50"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                )}
                title="Good response"
            >
                <ThumbsUp size={18} fill={feedbackGiven === 'up' ? 'currentColor' : 'none'} />
            </button>
            <button
                onClick={() => setFeedbackGiven(feedbackGiven === 'down' ? null : 'down')}
                className={cn(
                    "p-1.5 rounded-lg transition-all",
                    feedbackGiven === 'down'
                        ? "text-red-500 bg-red-50"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                )}
                title="Bad response"
            >
                <ThumbsDown size={18} fill={feedbackGiven === 'down' ? 'currentColor' : 'none'} />
            </button>
            <button
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                title="Share"
            >
                <Share size={18} />
            </button>
            <button
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                title="Regenerate"
            >
                <RotateCcw size={18} />
            </button>
            <button
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                title="More options"
            >
                <MoreHorizontal size={18} />
            </button>
        </div>
    );
};

export const MessageList: React.FC<MessageListProps> = ({ messages, isStreaming, streamingContent }) => {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 max-w-3xl mx-auto w-full">
            {messages.map((message) => (
                <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                >
                    {message.role === 'user' ? (
                        // User message - right aligned bubble
                        <div className="flex flex-col items-end">
                            <div className="max-w-[85%] md:max-w-[80%]">
                                <div className="bg-slate-100 rounded-3xl px-4 py-2.5 text-slate-800 text-[15px] leading-relaxed">
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                                <MessageActions role="user" content={message.content} />
                            </div>
                        </div>
                    ) : (
                        // Assistant message - left aligned, no bubble
                        <div className="flex flex-col items-start">
                            <div className="max-w-full">
                                <div className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                                    {message.content}
                                </div>

                                {/* Sources */}
                                {message.sources && message.sources.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {message.sources.map((source, idx) => (
                                            <SourceChip key={idx} source={source} />
                                        ))}
                                    </div>
                                )}

                                <MessageActions role="assistant" content={message.content} />
                            </div>
                        </div>
                    )}
                </motion.div>
            ))}

            {/* Streaming Message */}
            {isStreaming && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-start"
                >
                    <div className="max-w-full">
                        <div className="text-slate-800 text-[15px] leading-relaxed">
                            {streamingContent || (
                                <div className="flex gap-1 py-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            )}
                            {streamingContent && (
                                <span className="inline-block w-0.5 h-4 ml-0.5 bg-blue-600 animate-pulse align-middle" />
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
