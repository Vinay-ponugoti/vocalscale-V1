import React, { useRef, useState, useEffect } from 'react';
import { X, Plus, Mic, ArrowUp } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import type { FileAttachment } from '../../../../types/chat';

interface PromptInputProps {
    onSend: (content: string) => void;
    onFileUpload: (file: File) => Promise<FileAttachment | null>;
    disabled?: boolean;
    pendingFiles?: FileAttachment[];
    onRemoveFile?: (fileId: string) => void;
    placeholder?: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({
    onSend,
    onFileUpload,
    disabled,
    pendingFiles = [],
    onRemoveFile,
    placeholder
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
        <div className="w-full">
            {/* Main input container - pill shape */}
            <div className={cn(
                "relative bg-white border border-gray-200 rounded-full",
                "shadow-sm focus-within:shadow-md focus-within:border-gray-300",
                "transition-all"
            )}>
                {/* Pending Files - shown above input when present */}
                {pendingFiles.length > 0 && (
                    <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto border-b border-gray-100">
                        {pendingFiles.map(file => (
                            <div
                                key={file.id}
                                className="flex items-center gap-2 bg-gray-100 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 shrink-0"
                            >
                                <span className="truncate max-w-[100px]">{file.name}</span>
                                <button
                                    onClick={() => onRemoveFile?.(file.id)}
                                    className="p-0.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input row */}
                <div className="flex items-center gap-2 px-4 py-3">
                    {/* Attachment button - Plus icon */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || isUploading}
                        className={cn(
                            "p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0",
                            (disabled || isUploading) && "opacity-50 cursor-not-allowed"
                        )}
                        title="Attach file"
                    >
                        {isUploading ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        ) : (
                            <Plus size={20} strokeWidth={2.5} />
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
                        placeholder={placeholder || "Ask anything"}
                        className={cn(
                            "flex-1 resize-none bg-transparent outline-none",
                            "text-[16px] text-gray-900 placeholder:text-gray-400 font-sans",
                            "min-h-[24px] max-h-[120px] py-1",
                            "focus:ring-0 focus:outline-none",
                            disabled && "opacity-50"
                        )}
                        style={{ border: 'none', boxShadow: 'none' }}
                    />

                    {/* Right side buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Voice input */}
                        <button
                            type="button"
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors hidden sm:flex"
                            title="Voice input"
                        >
                            <Mic size={20} />
                        </button>

                        {/* Send button - circular green/gray */}
                        <button
                            onClick={handleSubmit}
                            disabled={disabled || !hasContent}
                            className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                                hasContent && !disabled
                                    ? "bg-black text-white hover:bg-gray-800"
                                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                            )}
                            title="Send message"
                        >
                            <ArrowUp size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
