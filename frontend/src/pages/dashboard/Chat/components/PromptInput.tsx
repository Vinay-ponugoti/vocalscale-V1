/**
 * PromptInput — Zola-inspired design
 * Rounded pill container · textarea top · actions bar bottom
 * Keeps all VocalScale models & features
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  X, Paperclip, ArrowUp, ChevronDown,
  Frame, Palette, Sparkles, Zap, Bot, ImageIcon,
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

// ─── Model config ─────────────────────────────────────────────────────────────
const MODELS: {
  value: ModelOption;
  label: string;
  short: string;
  dot: string;
  icon: React.ReactNode;
}[] = [
    { value: 'auto', label: 'Auto', short: 'Auto', dot: 'bg-blue-500', icon: <Sparkles size={12} /> },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', short: 'Flash', dot: 'bg-emerald-500', icon: <Zap size={12} /> },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', short: '2.5 Pro', dot: 'bg-violet-500', icon: <Bot size={12} /> },
    { value: 'imagen-4', label: 'Imagen 4', short: 'Imagen', dot: 'bg-orange-500', icon: <ImageIcon size={12} /> },
  ];

const SLASH_COMMANDS = [
  { command: '/image', description: 'Generate an image', model: 'imagen-4' as ModelOption, prefix: 'Create an image of ', icon: <ImageIcon size={13} className="text-orange-500" /> },
  { command: '/social', description: 'Write a social media post', model: 'gemini-2.5-pro' as ModelOption, prefix: 'Write a social media post about ', icon: <Sparkles size={13} className="text-violet-500" /> },
  { command: '/email', description: 'Draft an email', model: 'gemini-2.5-pro' as ModelOption, prefix: 'Draft an email regarding ', icon: <Bot size={13} className="text-violet-500" /> },
  { command: '/fast', description: 'Quick answer', model: 'gemini-2.0-flash' as ModelOption, prefix: '', icon: <Zap size={13} className="text-emerald-500" /> },
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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelOption>('auto');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [slashSearch, setSlashSearch] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageStyle, setImageStyle] = useState('cinematic');
  const [showAspectMenu, setShowAspectMenu] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const currentModel = MODELS.find(m => m.value === selectedModel) ?? MODELS[0];
  const hasContent = input.trim().length > 0;
  const isImageMode = selectedModel === 'imagen-4';

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  // Focus on mount
  useEffect(() => { textareaRef.current?.focus(); }, []);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setShowModelMenu(false);
        setShowAspectMenu(false);
        setShowStyleMenu(false);
        setShowSlash(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeAllMenus = () => {
    setShowModelMenu(false);
    setShowAspectMenu(false);
    setShowStyleMenu(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.startsWith('/')) {
      setShowSlash(true);
      setSlashSearch(val.substring(1).toLowerCase());
    } else {
      setShowSlash(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSlash && e.key === 'Escape') { setShowSlash(false); return; }
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

  // ─── Dropdown panels ──────────────────────────────────────────────────────

  const ModelMenu = () => (
    <div className="absolute left-0 bottom-[calc(100%+8px)] w-52 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200/80 dark:border-zinc-700/80 py-1.5 z-50 overflow-hidden">
      {MODELS.map((m) => (
        <button
          key={m.value}
          onClick={() => { setSelectedModel(m.value); setShowModelMenu(false); }}
          className={cn(
            'w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-sm transition-colors',
            selectedModel === m.value
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60',
          )}
        >
          <span className={cn('w-5 h-5 rounded-md flex items-center justify-center text-white flex-shrink-0', m.dot)}>
            {m.icon}
          </span>
          <span>{m.label}</span>
          {selectedModel === m.value && (
            <span className="ml-auto text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">active</span>
          )}
        </button>
      ))}
    </div>
  );

  const AspectMenu = () => (
    <div className="absolute left-0 bottom-[calc(100%+8px)] w-28 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-200/80 dark:border-zinc-700/80 py-1 z-50">
      {ASPECT_RATIOS.map((r) => (
        <button
          key={r}
          onClick={() => { setAspectRatio(r); setShowAspectMenu(false); }}
          className={cn(
            'w-full text-left px-3.5 py-2 text-xs font-medium tracking-wide transition-colors',
            r === aspectRatio
              ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
              : 'text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/60',
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );

  const StyleMenu = () => (
    <div className="absolute left-0 bottom-[calc(100%+8px)] w-40 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-200/80 dark:border-zinc-700/80 py-1 z-50">
      {IMAGE_STYLES.map((s) => (
        <button
          key={s}
          onClick={() => { setImageStyle(s); setShowStyleMenu(false); }}
          className={cn(
            'w-full text-left px-3.5 py-2 text-xs font-medium tracking-wide capitalize transition-colors',
            s === imageStyle
              ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
              : 'text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/60',
          )}
        >
          {s.replace('-', ' ')}
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-full px-0" ref={wrapperRef}>

      {/* ── Slash command palette — floats above ── */}
      {showSlash && (
        <div className="mb-2 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-zinc-700 overflow-hidden">
          <p className="px-4 py-2.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest border-b border-gray-100 dark:border-zinc-800">
            Quick actions
          </p>
          {SLASH_COMMANDS
            .filter(c => c.command.includes(slashSearch))
            .map((cmd) => (
              <button
                key={cmd.command}
                type="button"
                onClick={() => {
                  setSelectedModel(cmd.model);
                  setInput(cmd.prefix);
                  setShowSlash(false);
                  textareaRef.current?.focus();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  {cmd.icon}
                </span>
                <div>
                  <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{cmd.command}</div>
                  <div className="text-xs text-zinc-500">{cmd.description}</div>
                </div>
              </button>
            ))
          }
          {SLASH_COMMANDS.filter(c => c.command.includes(slashSearch)).length === 0 && (
            <p className="px-4 py-4 text-xs text-zinc-400 text-center">No matching commands</p>
          )}
        </div>
      )}

      {/* ── Main pill container ── */}
      <div
        className={cn(
          // Zola signature: rounded-3xl, popover bg, blur, border, subtle shadow
          'relative flex flex-col w-full',
          'rounded-3xl border border-zinc-200/80 dark:border-zinc-700/60',
          'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl',
          'shadow-[0_2px_20px_rgba(0,0,0,0.06)]',
          'transition-all duration-200',
          '!focus-within:ring-0 !focus-within:outline-none !focus:outline-none',
        )}
        onClick={() => textareaRef.current?.focus()}
      >

        {/* ── File chips ── */}
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1">
            {pendingFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg px-2.5 py-1 text-xs font-medium max-w-[160px]"
              >
                <span className="truncate">{file.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveFile?.(file.id); }}
                  className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full flex-shrink-0 text-zinc-400 hover:text-zinc-600"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Textarea ── */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={
            placeholder
            || (isImageMode ? 'Describe an image…' : 'Ask anything… or type / for commands')
          }
          className={cn(
            'w-full resize-none bg-transparent border-none outline-none ring-0',
            '!focus:outline-none !focus:ring-0 !focus-visible:outline-none !focus-visible:ring-0',
            'min-h-[44px] max-h-[200px]',
            'px-4 pt-3 pb-2',
            'text-[15px] leading-[1.5] text-zinc-900 dark:text-zinc-100',
            'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          style={{ boxShadow: 'none' }}
        />

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.txt,.docx,.md,.csv"
        />

        {/* ── Bottom action bar (Zola layout) ── */}
        <div className="flex items-center justify-between px-2 pb-2 pt-0.5 gap-2">

          {/* Left: attach + model + (imagen options) */}
          <div className="flex items-center gap-1">

            {/* Attach */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              disabled={disabled || isUploading}
              title="Attach file"
              className={cn(
                'h-8 w-8 flex items-center justify-center rounded-full transition-colors',
                'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800',
                (disabled || isUploading) && 'opacity-40 cursor-not-allowed',
              )}
            >
              {isUploading
                ? <div className="w-4 h-4 border-2 border-zinc-300 border-t-blue-500 rounded-full animate-spin" />
                : <Paperclip size={16} strokeWidth={2} />
              }
            </button>

            {/* Model selector */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => { setShowModelMenu(v => !v); setShowAspectMenu(false); setShowStyleMenu(false); }}
                className={cn(
                  'flex items-center gap-1.5 h-8 pl-2 pr-2.5 rounded-full border text-xs font-medium transition-all',
                  showModelMenu
                    ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300',
                )}
              >
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', currentModel.dot)} />
                <span className="hidden sm:block">{currentModel.short}</span>
                <ChevronDown
                  size={12}
                  className={cn('transition-transform duration-150 flex-shrink-0', showModelMenu && 'rotate-180')}
                />
              </button>
              {showModelMenu && <ModelMenu />}
            </div>

            {/* Imagen-only: aspect ratio + style */}
            {isImageMode && (
              <>
                <div className="relative hidden md:block" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => { setShowAspectMenu(v => !v); setShowModelMenu(false); setShowStyleMenu(false); }}
                    className={cn(
                      'flex items-center gap-1 h-8 px-2.5 rounded-full border text-xs font-medium transition-all',
                      showAspectMenu
                        ? 'bg-orange-50 border-orange-300 text-orange-700'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300',
                    )}
                  >
                    <Frame size={12} />
                    <span>{aspectRatio}</span>
                  </button>
                  {showAspectMenu && <AspectMenu />}
                </div>

                <div className="relative hidden md:block" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => { setShowStyleMenu(v => !v); setShowModelMenu(false); setShowAspectMenu(false); }}
                    className={cn(
                      'flex items-center gap-1 h-8 px-2.5 rounded-full border text-xs font-medium transition-all',
                      showStyleMenu
                        ? 'bg-orange-50 border-orange-300 text-orange-700'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300',
                    )}
                  >
                    <Palette size={12} />
                    <span className="max-w-[72px] truncate capitalize">{imageStyle.replace('-', ' ')}</span>
                  </button>
                  {showStyleMenu && <StyleMenu />}
                </div>
              </>
            )}
          </div>

          {/* Right: send button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
            disabled={disabled || !hasContent}
            title="Send (Enter)"
            className={cn(
              'h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
              hasContent && !disabled
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-85 active:scale-90 shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed',
            )}
          >
            <ArrowUp size={17} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Keyboard hint ── */}
      <p className="mt-2 text-center text-[11px] text-zinc-400 dark:text-zinc-600 select-none">
        <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for newline · <kbd className="font-mono">/</kbd> for commands
      </p>
    </div>
  );
};
