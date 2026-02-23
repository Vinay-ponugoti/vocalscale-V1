/**
 * PromptInput — flagship input bar (Claude / Perplexity inspired)
 * Rounded rectangle, glow focus ring, blue send button, file chips
 */

import React, { useRef, useState, useEffect } from 'react';
import { X, Plus, Mic, ArrowUp, ChevronDown, Frame, Palette } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import type { FileAttachment } from '../../../../types/chat';

import type { ModelOption } from '../../../../types/chat';

interface PromptInputProps {
  onSend: (content: string, model: ModelOption, aspectRatio?: string, imageStyle?: string) => void;
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
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [slashSearch, setSlashSearch] = useState('');

  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [imageStyle, setImageStyle] = useState<string>('cinematic');
  const [showAspectDropdown, setShowAspectDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);

  const MODEL_ICONS: Record<ModelOption, React.ReactNode> = {
    'auto': <div className="w-4 h-4 bg-blue-500 rounded-full" />,
    'gemini-2.0-flash': <div className="w-4 h-4 bg-green-500 rounded-full" />,
    'gemini-2.5-pro': <div className="w-4 h-4 bg-purple-500 rounded-full" />,
    'imagen-4': <div className="w-4 h-4 bg-orange-500 rounded-full" />,
  };

  const SLASH_COMMANDS = [
    { command: '/image', description: 'Generate an image', model: 'imagen-4', icon: <Frame size={14} className="text-orange-600" /> },
    { command: '/social', description: 'Write a social media post', model: 'gemini-2.5-pro', icon: <div className="w-3.5 h-3.5 bg-purple-500 rounded-full" /> },
    { command: '/email', description: 'Draft an email', model: 'gemini-2.5-pro', icon: <div className="w-3.5 h-3.5 bg-purple-500 rounded-full" /> },
    { command: '/fast', description: 'Quick answer', model: 'gemini-2.0-flash', icon: <div className="w-3.5 h-3.5 bg-green-500 rounded-full" /> },
  ];
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea (max 5 rows ≈ 120px)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    // Check if we should show slash commands
    if (val.startsWith('/')) {
      setShowSlashCommands(true);
      setSlashSearch(val.substring(1).toLowerCase());
    } else {
      setShowSlashCommands(false);
    }
  };

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSlashCommands) {
      if (e.key === 'Escape') {
        setShowSlashCommands(false);
        return;
      }
      // Extremely basic keyboard support could go here, but omitted for brevity
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (disabled || !input.trim()) return;
    onSend(input.trim(), selectedModel, aspectRatio, imageStyle);
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

        {/* ── Slash Commands Dropdown ── */}
        {showSlashCommands && (
          <div className="absolute left-4 bottom-[calc(100%+8px)] w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 overflow-hidden z-[60]">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
              Actions
            </div>
            {SLASH_COMMANDS.filter(cmd => cmd.command.includes(slashSearch)).map((cmd) => (
              <button
                key={cmd.command}
                type="button"
                onClick={() => {
                  setSelectedModel(cmd.model as ModelOption);
                  const prefix = cmd.command === '/image' ? 'Create an image of ' :
                    cmd.command === '/social' ? 'Write a social media post about ' :
                      cmd.command === '/email' ? 'Draft an email regarding ' : '';
                  setInput(prefix);
                  setShowSlashCommands(false);
                  textareaRef.current?.focus();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="p-1.5 bg-gray-100 rounded-lg flex-shrink-0">
                  {cmd.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{cmd.command}</div>
                  <div className="text-xs text-gray-500">{cmd.description}</div>
                </div>
              </button>
            ))}
            {SLASH_COMMANDS.filter(cmd => cmd.command.includes(slashSearch)).length === 0 && (
              <div className="px-3 py-3 text-xs text-gray-500 text-center">No matching commands</div>
            )}
          </div>
        )}

        {/* ── Main input row ── */}
        <div className="flex items-end gap-3 px-3.5 py-3">

          {/* Attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            title="Attach file"
            className={cn(
              'flex-shrink-0 p-2.5 rounded-xl transition-all mb-0.5',
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
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder || 'Ask anything'}
            className={cn(
              'flex-1 resize-none bg-transparent ring-0',
              'text-[15px] text-gray-900 placeholder:text-gray-400',
              'font-sans leading-relaxed',
              'min-h-[24px] max-h-[150px] py-1.5',
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

            {/* Settings for Imagen */}
            {selectedModel === 'imagen-4' && (
              <>
                {/* Aspect Ratio selector */}
                <div className="relative mb-0.5 hidden md:block z-40">
                  <button
                    type="button"
                    onClick={() => { setShowAspectDropdown(!showAspectDropdown); setShowStyleDropdown(false); setShowDropdown(false); }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border",
                      showAspectDropdown ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300"
                    )}
                    title="Aspect Ratio"
                  >
                    <Frame size={13} />
                    <span className="text-[11px] font-semibold tracking-wide uppercase">{aspectRatio}</span>
                  </button>
                  {showAspectDropdown && (
                    <div className="absolute right-0 bottom-[calc(100%+12px)] w-32 bg-white rounded-xl shadow-xl border border-gray-200 py-1 overflow-hidden">
                      {['1:1', '16:9', '9:16', '4:3', '3:4'].map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => { setAspectRatio(ratio); setShowAspectDropdown(false); }}
                          className={cn('w-full flex items-center px-4 py-2.5 text-left hover:bg-gray-50 transition-colors', aspectRatio === ratio && 'bg-orange-50 text-orange-700 font-medium')}
                        >
                          <span className="text-xs uppercase tracking-wider">{ratio}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Style selector */}
                <div className="relative mb-0.5 hidden md:block z-40">
                  <button
                    type="button"
                    onClick={() => { setShowStyleDropdown(!showStyleDropdown); setShowAspectDropdown(false); setShowDropdown(false); }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border",
                      showStyleDropdown ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300"
                    )}
                    title="Image Style"
                  >
                    <Palette size={13} />
                    <span className="text-[11px] font-semibold tracking-wide uppercase max-w-[80px] truncate">{imageStyle}</span>
                  </button>
                  {showStyleDropdown && (
                    <div className="absolute right-0 bottom-[calc(100%+12px)] w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1 overflow-hidden">
                      {['cinematic', 'photorealistic', 'anime', '3d-render', 'sketch'].map((style) => (
                        <button
                          key={style}
                          onClick={() => { setImageStyle(style); setShowStyleDropdown(false); }}
                          className={cn('w-full flex items-center px-4 py-2.5 text-left hover:bg-gray-50 transition-colors', imageStyle === style && 'bg-orange-50 text-orange-700 font-medium')}
                        >
                          <span className="text-xs uppercase tracking-wider">{style.replace('-', ' ')}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Model selector */}
            <div className="relative mb-0.5 z-40">
              <button
                type="button"
                onClick={() => { setShowDropdown(!showDropdown); setShowAspectDropdown(false); setShowStyleDropdown(false); }}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border",
                  showDropdown
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300"
                )}
                title="Select model"
              >
                {MODEL_ICONS[selectedModel]}
                <span className="text-[11px] font-semibold tracking-wide uppercase hidden sm:block">
                  {selectedModel === 'auto' ? 'Auto' : selectedModel.replace(/-/g, ' ')}
                </span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 bottom-[calc(100%+12px)] w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 overflow-hidden z-50">
                  {Object.entries(MODEL_ICONS).map(([model, icon]) => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model as ModelOption);
                        setShowDropdown(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors',
                        selectedModel === model && 'bg-blue-50/50 text-blue-700 font-medium'
                      )}
                    >
                      {icon}
                      <span className="text-xs uppercase tracking-wider">{model === 'auto' ? 'Auto' : model.replace(/-/g, ' ')}</span>
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
                'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
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
