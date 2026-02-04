import React, { useRef, useState, useEffect } from 'react';
import { Send, Paperclip, Mic, X, Sparkles } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import type { FileAttachment } from '../../../../types/chat';

interface PromptInputProps {
    onSend: (content: string) => void;
    onFileUpload: (file: File) => Promise<FileAttachment | null>;
    disabled?: boolean;
    pendingFiles?: FileAttachment[];
    onRemoveFile?: (fileId: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
    onSend,
    onFileUpload,
    disabled,
    pendingFiles = [],
    onRemoveFile
}) => {
    const [input, setInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    // Focus on mount
    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (disabled || !input.trim()) return;
        onSend(input.trim());
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                await onFileUpload(e.target.files[0]);
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    const hasContent = input.trim().length > 0;

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pb-4">
            {/* Main input container - ChatGPT style pill shape */}
            <div className={cn(
                "relative bg-white border border-slate-200 rounded-full shadow-sm",
                "focus-within:border-slate-300 focus-within:shadow-md transition-all",
                "overflow-hidden"
            )}>
                {/* Pending Files - shown above input when present */}
                {pendingFiles.length > 0 && (
                    <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto">
                        {pendingFiles.map(file => (
                            <div
                                key={file.id}
                                className="flex items-center gap-2 bg-slate-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 shrink-0"
                            >
                                <span className="truncate max-w-[100px]">{file.name}</span>
                                <button
                                    onClick={() => onRemoveFile?.(file.id)}
                                    className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input row */}
                <div className="flex items-center gap-2 px-4 py-3">
                    {/* Attachment button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || isUploading}
                        className={cn(
                            "p-1 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0",
                            (disabled || isUploading) && "opacity-50 cursor-not-allowed"
                        )}
                        title="Attach file"
                    >
                        {isUploading ? (
                            <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        )}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.txt,.docx,.md,.csv"
                    />

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        placeholder="Ask anything about your business..."
                        className={cn(
                            "flex-1 resize-none bg-transparent border-none outline-none",
                            "text-[16px] text-slate-800 placeholder:text-slate-400",
                            "min-h-[24px] max-h-[120px] py-0",
                            disabled && "opacity-50"
                        )}
                    />

                    {/* Right side buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Voice input (visual only) */}
                        <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors hidden sm:block"
                            title="Voice input"
                        >
                            <Mic size={24} />
                        </button>

                        {/* Send button - circular */}
                        <button
                            onClick={handleSubmit}
                            disabled={disabled || !hasContent}
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                hasContent
                                    ? "bg-slate-900 text-white hover:bg-slate-800"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            )}
                            title="Send message"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="rotate-90"
                            >
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer text */}
            <p className="text-center text-[11px] text-slate-400 mt-2.5">
                VocalScale can make mistakes. Please verify important information.
            </p>
        </div>
    );
};
