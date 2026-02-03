import React, { useRef, useState, useEffect } from 'react';
import { Send, Paperclip, Mic, Globe, ChevronDown, Sparkles, X } from 'lucide-react';
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (disabled || !input.trim()) return;
        onSend(input);
        setInput('');
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await onFileUpload(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pb-4">
            <div className="relative bg-white border border-slate-200 rounded-3xl shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden">

                {/* Pending Files */}
                {pendingFiles.length > 0 && (
                    <div className="flex gap-2 p-3 border-b border-slate-50 bg-slate-50/50 overflow-x-auto">
                        {pendingFiles.map(file => (
                            <div key={file.id} className="flex items-center gap-2 bg-white border rounded-lg px-2 py-1.5 text-xs text-slate-700 shadow-sm shrink-0">
                                <span className="truncate max-w-[120px]">{file.name}</span>
                                <button
                                    onClick={() => onRemoveFile?.(file.id)}
                                    className="p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Text Area */}
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder="Ask anything..."
                    className="w-full px-5 py-4 bg-transparent border-none focus:ring-0 resize-none text-slate-800 placeholder:text-slate-400 max-h-[200px]"
                    style={{ minHeight: '60px' }}
                />

                {/* Footer Actions */}
                <div className="flex items-center justify-between px-3 pb-3">
                    <div className="flex items-center gap-1">
                        {/* Visual-only Actions for "Premium" feel */}
                        <button
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all group relative"
                            title="Attach file"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Paperclip size={18} />
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </button>
                        <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                            <Mic size={18} />
                        </button>
                        <div className="h-4 w-px bg-slate-200 mx-1" />
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                            <Sparkles size={14} className="text-blue-500" />
                            <span>GPT-4o</span>
                            <ChevronDown size={12} />
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={disabled || !input.trim()}
                        className={cn(
                            "p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center",
                            input.trim()
                                ? "bg-slate-900 text-white shadow-md hover:bg-slate-800 hover:translate-y-[-1px]"
                                : "bg-slate-100 text-slate-300 cursor-not-allowed"
                        )}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            <div className="text-center mt-3">
                <p className="text-[10px] text-slate-400">
                    VocalScale can make mistakes. Please check important info.
                </p>
            </div>
        </div>
    );
};
