/**
 * Chat Input Component
 * Auto-resizing textarea with file upload support
 */

import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Paperclip, X, FileText, Loader2, ArrowUp } from 'lucide-react';
import type { FileAttachment } from '../../../../types/chat';
import { cn } from '../../../../lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  onFileUpload: (file: File) => Promise<FileAttachment | null>;
  pendingFiles: FileAttachment[];
  onRemoveFile: (id: string) => void;
  disabled: boolean;
}

const ChatInput = ({
  onSend,
  onFileUpload,
  pendingFiles,
  onRemoveFile,
  disabled,
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [message]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        await onFileUpload(file);
      } finally {
        setUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Pending files */}
      {pendingFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pendingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-electric/10 text-blue-electric rounded-lg text-sm"
            >
              <FileText size={14} />
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                onClick={() => onRemoveFile(file.id)}
                className="hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div
        className={cn(
          'relative flex items-end gap-2 p-3 rounded-xl',
          'bg-white border border-white-light shadow-sm',
          'focus-within:border-blue-electric focus-within:ring-2 focus-within:ring-blue-electric/10',
          'transition-all duration-200'
        )}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your knowledge base..."
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent text-charcoal placeholder:text-charcoal-light',
            'focus:outline-none text-sm leading-relaxed',
            'disabled:opacity-50'
          )}
        />

        <div className="flex items-center gap-1">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.txt,.docx,.md"
          />

          {/* Upload button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="text-charcoal-light hover:text-charcoal"
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Paperclip size={18} />
            )}
          </Button>

          {/* Send button */}
          <Button
            variant="default"
            size="icon-sm"
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="bg-blue-electric hover:bg-blue-dark shadow-sm"
          >
            <ArrowUp size={18} />
          </Button>
        </div>
      </div>

      {/* Helper text */}
      <p className="text-xs text-charcoal-light text-center">
        Press Enter to send, Shift+Enter for new line • Supports PDF, TXT, DOCX, MD
      </p>
    </div>
  );
};

export default ChatInput;
