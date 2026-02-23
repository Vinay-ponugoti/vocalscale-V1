/**
 * PromptInput — flagship input bar (Claude / Perplexity inspired)
 * Rounded rectangle, glow focus ring, blue send button, file chips
 */

import React, { useRef, useState, useEffect } from 'react';
import { X, Plus, Mic, ArrowUp, ChevronDown } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import type { FileAttachment } from '../../../../types/chat';

import type { ModelOption } from '../../../../types/chat';

interface PromptInputProps {
  onSend: (content: string, model: ModelOption) => void;
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
  placeholder,
}) => {
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelOption>('auto');
  const [showDropdown, setShowDropdown] = useState(false);

  const MODEL_ICONS: Record<ModelOption, React.ReactNode> = {
    'auto': <div className="w-4 h-4 bg-blue-500 rounded-full" />,
    'gemini-2.0-flash': <div className="w-4 h-4 bg-green-500 rounded-full" />,
    'gemini-2.5-pro': <div className="w-4 h-4 bg-purple-500 rounded-full" />,
    'imagen-4': <div className="w-4 h-4 bg-orange-500 rounded-full" />,
  };
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea (max 5 rows ≈ 120px)
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
    onSend(input.trim(), selectedModel);
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
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const hasContent = input.trim().length > 0;

  return (
    <div className="w-full">
      {/* ── Outer glow wrapper ── */}
      <div
        className={cn(
          'relative bg-white rounded-2xl',
          'border border-gray-200',
          'shadow-[0_2px_12px_rgba(0,0,0,0.06)]',
          'transition-all duration-200',
          'focus-within:border-blue-300',
          'focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.10),_0_2px_12px_rgba(0,0,0,0.06)]',
        )}
      >
        {/* ── Pending file chips ── */}
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1.5 border-b border-gray-100">
            {pendingFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg px-2.5 py-1 text-xs font-medium"
              >
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button
                  onClick={() => onRemoveFile?.(file.id)}
                  className="p-0.5 hover:bg-blue-100 rounded-full text-blue-400 hover:text-blue-600 transition-colors"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Main input row ── */}
        <div className="flex items-end gap-2 px-3 py-3">

          {/* Attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            title="Attach file"
            className={cn(
              'flex-shrink-0 p-2 rounded-xl transition-all mb-0.5',
              'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
              (disabled || isUploading) && 'opacity-40 cursor-not-allowed',
            )}
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            ) : (
              <Plus size={19} strokeWidth={2} />
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
            placeholder={placeholder || 'Ask anything'}
            className={cn(
              'flex-1 resize-none bg-transparent ring-0',
              'text-[15px] text-gray-900 placeholder:text-gray-400',
              'font-sans leading-relaxed',
              'min-h-[26px] max-h-[120px] py-0.5',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
            style={{ border: 'none', boxShadow: 'none', outline: 'none' }}
          />

          {/* Right actions */}
          <div className="flex items-center gap-1 flex-shrink-0 mb-0.5">
            {/* Mic */}
            <button
              type="button"
              title="Voice input"
              className="hidden sm:flex p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            >
              <Mic size={18} />
            </button>

            {/* Model selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                title="Select model"
              >
                <span className="text-xs font-medium">{selectedModel}</span>
                <ChevronDown size={14} />
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-200">
                  {Object.entries(MODEL_ICONS).map(([model, icon]) => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model as ModelOption);
                        setShowDropdown(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors',
                        selectedModel === model && 'bg-blue-50 text-blue-600'
                      )}
                    >
                      {icon}
                      <span className="text-sm font-medium">{model}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Send */}
            <button
              onClick={handleSubmit}
              disabled={disabled || !hasContent}
              title="Send message"
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150',
                hasContent && !disabled
                  ? [
                    'bg-blue-600 hover:bg-blue-700 text-white',
                    'shadow-[0_2px_8px_rgba(59,130,246,0.4)]',
                    'active:scale-[0.93]',
                  ]
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed',
              )}
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
