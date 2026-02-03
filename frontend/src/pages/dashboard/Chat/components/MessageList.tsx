import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, FileText, Check, Copy } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import type { ChatMessage, Source } from '../../../../types/chat';

interface MessageListProps {
    messages: ChatMessage[];
    isStreaming: boolean;
    streamingContent: string;
}

const CopyButton = ({ content }: { content: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            title="Copy message"
        >
            {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
    );
};

const SourceChip = ({ source }: { source: Source }) => (
    <div
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-slate-100 transition-colors max-w-full overflow-hidden cursor-default"
        title={source.excerpt}
    >
        <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-200 shrink-0 text-slate-500">
            <FileText size={10} />
        </div>
        <div className="flex flex-col truncate">
            <span className="font-medium text-slate-700 truncate">{source.name || 'Document'}</span>
        </div>
    </div>
);

export const MessageList: React.FC<MessageListProps> = ({ messages, isStreaming, streamingContent }) => {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 max-w-3xl mx-auto w-full">
            {messages.map((message) => (
                <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "group flex gap-4 w-full",
                        message.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                >
                    {/* Avatar */}
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                        message.role === 'user'
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : "bg-blue-600 text-white border-blue-600"
                    )}>
                        {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    {/* Content */}
                    <div className={cn(
                        "flex flex-col gap-2 max-w-[85%] md:max-w-[75%]",
                        message.role === 'user' ? "items-end" : "items-start"
                    )}>
                        {/* Name & Time */}
                        <div className="flex items-center gap-2 opacity-50 text-xs px-1">
                            <span className="font-medium">{message.role === 'user' ? 'You' : 'Assistant'}</span>
                        </div>

                        {/* Bubble */}
                        <div className={cn(
                            "relative px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                            message.role === 'user'
                                ? "bg-blue-600 text-white rounded-tr-sm"
                                : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                        )}>
                            {message.content}

                            {message.role === 'assistant' && (
                                <div className="absolute top-2 right-2">
                                    <CopyButton content={message.content} />
                                </div>
                            )}
                        </div>

                        {/* Attachments / Sources */}
                        {message.sources && message.sources.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {message.sources.map((source, idx) => (
                                    <SourceChip key={idx} source={source} />
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}

            {/* Streaming Message */}
            {isStreaming && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 w-full"
                >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 border border-blue-600 shadow-sm">
                        <Bot size={16} />
                    </div>
                    <div className="flex flex-col gap-2 max-w-[75%] items-start">
                        <div className="flex items-center gap-2 opacity-50 text-xs px-1">
                            <span className="font-medium">Assistant</span>
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full animate-pulse">Thinking...</span>
                        </div>

                        <div className="bg-white border border-slate-200 text-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-sm">
                            {streamingContent}
                            <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-blue-600 animate-pulse" />
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
