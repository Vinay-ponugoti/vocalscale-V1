/**
 * PromptInput — Premium search / chat input bar
 * Claude × Perplexity × Vercel-AI inspired
 * Uses shadcn/ui patterns with glass-morphism and animated glow
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  X, Plus, Mic, ArrowUp, ChevronDown, Frame, Palette,
  Sparkles, Zap, ImageIcon, Bot,
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import type { FileAttachment, ModelOption } from '../../../../types/chat';

interface PromptInputProps {
  onSend: (content: string, model: ModelOption, aspectRatio?: string, imageStyle?: string) => void;
  onFileUpload: (file: File) => Promise<FileAttachment | null>;
  disabled?: boolean;
  pendingFiles?: FileAttachment[];
  onRemoveFile?: (fileId: string) => void;
  placeholder?: string;
}

// ─── Model metadata ──────────────────────────────────────────────────────────
const MODELS: { value: ModelOption; label: string; short: string; color: string; icon: React.ReactNode }[] = [
  {
    value: 'auto',
    label: 'Auto',
    short: 'Auto',
    color: 'bg-blue-500',
    icon: <Sparkles size={13} />,
  },
  {
    value: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    short: 'Flash',
    color: 'bg-emerald-500',
    icon: <Zap size={13} />,
  },
  {
    value: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    short: '2.5 Pro',
    color: 'bg-purple-500',
    icon: <Bot size={13} />,
  },
  {
    value: 'imagen-4',
    label: 'Imagen 4',
    short: 'Imagen',
    color: 'bg-orange-500',
    icon: <ImageIcon size={13} />,
  },
];

const SLASH_COMMANDS = [
  { command: '/image', description: 'Generate an image', model: 'imagen-4' as ModelOption, icon: <ImageIcon size={14} className="text-orange-500" />, prefix: 'Create an image of ' },
  { command: '/social', description: 'Write a social media post', model: 'gemini-2.5-pro' as ModelOption, icon: <Sparkles size={14} className="text-purple-500" />, prefix: 'Write a social media post about ' },
  { command: '/email', description: 'Draft an email', model: 'gemini-2.5-pro' as ModelOption, icon: <Bot size={14} className="text-purple-500" />, prefix: 'Draft an email regarding ' },
  { command: '/fast', description: 'Quick answer', model: 'gemini-2.0-flash' as ModelOption, icon: <Zap size={14} className="text-emerald-500" />, prefix: '' },
];

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const IMAGE_STYLES = ['cinematic', 'photorealistic', 'anime', '3d-render', 'sketch'];

// ─── Component ────────────────────────────────────────────────────────────────
export const PromptInput: React.FC<PromptInputProps> = ({
  onSend,
  onFileUpload,
  disabled,
  pendingFiles = [],
  onRemoveFile,
  placeholder,
}) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelOption>('auto');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [slashSearch, setSlashSearch] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageStyle, setImageStyle] = useState('cinematic');
  const [showAspectDropdown, setShowAspectDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = MODELS.find(m => m.value === selectedModel) ?? MODELS[0];
  const hasContent = input.trim().length > 0;
  const isImageMode = selectedModel === 'imagen-4';

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  // Focus on mount
  useEffect(() => { textareaRef.current?.focus(); }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowAspectDropdown(false);
        setShowStyleDropdown(false);
        setShowSlashCommands(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.startsWith('/')) {
      setShowSlashCommands(true);
      setSlashSearch(val.substring(1).toLowerCase());
    } else {
      setShowSlashCommands(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSlashCommands && e.key === 'Escape') {
      setShowSlashCommands(false);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = useCallback(() => {
    if (disabled || !input.trim()) return;
    onSend(input.trim(), selectedModel, aspectRatio, imageStyle);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [disabled, input, selectedModel, aspectRatio, imageStyle, onSend]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setIsUploading(true);
      try { await onFileUpload(e.target.files[0]); }
      finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const closeAllDropdowns = () => {
    setShowDropdown(false);
    setShowAspectDropdown(false);
    setShowStyleDropdown(false);
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      <div
        className={cn(
          // Base
          'relative bg-white rounded-2xl',
          'border transition-all duration-300',
          // Shadow layers
          'shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_4px_16px_rgba(0,0,0,0.06)]',
          // Idle border
          !isFocused && 'border-gray-200',
          // Focus state — blue glow
          isFocused && [
            'border-blue-400/70',
            'shadow-[0_0_0_3px_rgba(59,130,246,0.12),_0_1px_3px_rgba(0,0,0,0.05),_0_4px_16px_rgba(0,0,0,0.06)]',
          ],
        )}
      >
        {/* ── Subtle inner gradient top edge (glass feel) ── */}
        <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

        {/* ── Pending file chips ── */}
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3 pb-2 border-b border-gray-100/80">
            {pendingFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg px-2.5 py-1 text-xs font-medium max-w-[160px]"
              >
                <span className="truncate">{file.name}</span>
                <button
                  onClick={() => onRemoveFile?.(file.id)}
                  className="p-0.5 hover:bg-blue-100 rounded-full text-blue-400 hover:text-blue-600 transition-colors flex-shrink-0"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Slash Commands Dropdown ── */}
        {showSlashCommands && (
          <div className="absolute left-3 bottom-[calc(100%+10px)] w-72 bg-white rounded-xl shadow-2xl border border-gray-200/80 py-2 overflow-hidden z-[60]">
            <p className="px-3 pb-1.5 pt-0.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Quick Actions
            </p>
            <div className="h-px bg-gray-100 mb-1.5" />
            {SLASH_COMMANDS.filter(c => c.command.includes(slashSearch)).map((cmd) => (
              <button
                key={cmd.command}
                type="button"
                onClick={() => {
                  setSelectedModel(cmd.model);
                  setInput(cmd.prefix);
                  setShowSlashCommands(false);
                  textareaRef.current?.focus();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {cmd.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{cmd.command}</div>
                  <div className="text-xs text-gray-500 truncate">{cmd.description}</div>
                </div>
              </button>
            ))}
            {SLASH_COMMANDS.filter(c => c.command.includes(slashSearch)).length === 0 && (
              <div className="px-3 py-4 text-xs text-gray-400 text-center">No matching commands</div>
            )}
          </div>
        )}

        {/* ── Main textarea row ── */}
        <div className="flex items-end gap-2 px-3 py-3">

          {/* Attach */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            title="Attach file"
            className={cn(
              'flex-shrink-0 mb-0.5 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150',
              'text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:scale-95',
              (disabled || isUploading) && 'opacity-40 cursor-not-allowed',
            )}
          >
            {isUploading
              ? <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              : <Plus size={18} strokeWidth={2} />
            }
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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={placeholder || (isImageMode ? 'Describe an image to generate…' : 'Ask anything… or type / for commands')}
            className={cn(
              'flex-1 resize-none bg-transparent outline-none ring-0 border-none',
              'text-[15px] text-gray-900 placeholder:text-gray-400/90',
              'font-sans leading-relaxed tracking-[0.01em]',
              'min-h-[26px] max-h-[160px] py-1.5',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
            style={{ boxShadow: 'none' }}
          />

          {/* Right actions cluster */}
          <div className="flex items-center gap-1.5 flex-shrink-0 mb-0.5">

            {/* Mic button */}
            <button
              type="button"
              title="Voice input"
              className="hidden sm:flex w-8 h-8 items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all active:scale-95"
            >
              <Mic size={16} />
            </button>

            {/* Imagen options */}
            {isImageMode && (
              <>
                {/* Aspect ratio pill */}
                <div className="relative hidden md:block z-40">
                  <button
                    type="button"
                    onClick={() => { setShowAspectDropdown(v => !v); setShowStyleDropdown(false); setShowDropdown(false); }}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold uppercase tracking-wide transition-all duration-150',
                      showAspectDropdown
                        ? 'bg-orange-50 border-orange-200 text-orange-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700',
                    )}
                  >
                    <Frame size={12} />
                    {aspectRatio}
                  </button>
                  {showAspectDropdown && (
                    <div className="absolute right-0 bottom-[calc(100%+8px)] w-28 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                      {ASPECT_RATIOS.map((r) => (
                        <button
                          key={r}
                          onClick={() => { setAspectRatio(r); setShowAspectDropdown(false); }}
                          className={cn(
                            'w-full text-left px-3 py-2 text-xs uppercase tracking-wider transition-colors',
                            r === aspectRatio ? 'bg-orange-50 text-orange-700 font-semibold' : 'text-gray-600 hover:bg-gray-50',
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Style pill */}
                <div className="relative hidden md:block z-40">
                  <button
                    type="button"
                    onClick={() => { setShowStyleDropdown(v => !v); setShowAspectDropdown(false); setShowDropdown(false); }}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold uppercase tracking-wide transition-all duration-150 max-w-[90px]',
                      showStyleDropdown
                        ? 'bg-orange-50 border-orange-200 text-orange-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700',
                    )}
                  >
                    <Palette size={12} />
                    <span className="truncate">{imageStyle}</span>
                  </button>
                  {showStyleDropdown && (
                    <div className="absolute right-0 bottom-[calc(100%+8px)] w-40 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                      {IMAGE_STYLES.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setImageStyle(s); setShowStyleDropdown(false); }}
                          className={cn(
                            'w-full text-left px-3 py-2 text-xs uppercase tracking-wider transition-colors',
                            s === imageStyle ? 'bg-orange-50 text-orange-700 font-semibold' : 'text-gray-600 hover:bg-gray-50',
                          )}
                        >
                          {s.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Model selector pill */}
            <div className="relative z-40">
              <button
                type="button"
                onClick={() => { setShowDropdown(v => !v); closeAllDropdowns(); setShowDropdown(v => !v); }}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-150',
                  showDropdown
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700',
                )}
              >
                {/* Colored dot indicator */}
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', currentModel.color)} />
                <span className="hidden sm:block">{currentModel.short}</span>
                <ChevronDown size={11} className={cn('transition-transform duration-200 flex-shrink-0', showDropdown && 'rotate-180')} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 bottom-[calc(100%+8px)] w-52 bg-white rounded-xl shadow-2xl border border-gray-200/80 py-1.5 z-50 overflow-hidden">
                  <div className="px-3 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    Model
                  </div>
                  <div className="h-px bg-gray-100 mb-1" />
                  {MODELS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => { setSelectedModel(m.value); setShowDropdown(false); }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                        selectedModel === m.value
                          ? 'bg-blue-50/70 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50',
                      )}
                    >
                      <span className={cn('w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-white', m.color)}>
                        {m.icon}
                      </span>
                      <div>
                        <div className={cn('text-xs font-semibold', selectedModel === m.value ? 'text-blue-700' : 'text-gray-800')}>
                          {m.label}
                        </div>
                      </div>
                      {selectedModel === m.value && (
                        <span className="ml-auto text-[10px] font-semibold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-md">
                          ON
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Send button */}
            <button
              onClick={handleSubmit}
              disabled={disabled || !hasContent}
              title="Send  (Enter)"
              className={cn(
                'relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0',
                hasContent && !disabled
                  ? [
                    'bg-blue-600 text-white',
                    'shadow-[0_2px_12px_rgba(59,130,246,0.45)]',
                    'hover:bg-blue-700 hover:shadow-[0_4px_18px_rgba(59,130,246,0.5)]',
                    'active:scale-[0.91] active:shadow-none',
                  ]
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed',
              )}
            >
              <ArrowUp size={17} strokeWidth={2.5} />
              {/* Pulse ring when active */}
              {hasContent && !disabled && (
                <span className="absolute inset-0 rounded-xl animate-ping bg-blue-400/20 pointer-events-none" />
              )}
            </button>
          </div>
        </div>

        {/* ── Footer hint bar ── */}
        <div className={cn(
          'flex items-center justify-between px-4 pb-2.5 transition-all duration-300',
          isFocused || hasContent ? 'opacity-100' : 'opacity-0',
        )}>
          <span className="text-[10px] text-gray-400 select-none">
            <kbd className="px-1 py-0.5 rounded bg-gray-100 text-[10px] font-mono text-gray-500">Enter</kbd>
            {' '}to send  ·
            <kbd className="px-1 py-0.5 rounded bg-gray-100 text-[10px] font-mono text-gray-500 mx-1">Shift+Enter</kbd>
            for newline  ·  type
            <kbd className="px-1 py-0.5 rounded bg-gray-100 text-[10px] font-mono text-gray-500 mx-1">/</kbd>
            for commands
          </span>
          {input.length > 200 && (
            <span className={cn('text-[10px] tabular-nums', input.length > 4000 ? 'text-red-400' : 'text-gray-300')}>
              {input.length} / 4000
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
