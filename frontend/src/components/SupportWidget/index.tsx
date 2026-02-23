/**
 * SupportWidget - Enterprise Level
 * 
 * Features:
 * - Chat persistence across refreshes
 * - Quick action buttons
 * - Typing indicator
 * - Ticket status display
 * - Professional UI like Intercom/Zendesk
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  Loader2, 
  Minimize2,
  Check,
  CheckCheck,
  AlertCircle,
  Clock,
  MoreVertical,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useSupportChat } from '../../hooks/useSupportChat';
import type { TicketMessage, QuickAction, Ticket } from '../../types/support';

// ============================================
// Sub-components
// ============================================

/**
 * Typing indicator animation
 */
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    <motion.span 
      className="w-2 h-2 bg-slate-400 rounded-full"
      animate={{ opacity: [0.4, 1, 0.4], y: [0, -2, 0] }}
      transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
    />
    <motion.span 
      className="w-2 h-2 bg-slate-400 rounded-full"
      animate={{ opacity: [0.4, 1, 0.4], y: [0, -2, 0] }}
      transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
    />
    <motion.span 
      className="w-2 h-2 bg-slate-400 rounded-full"
      animate={{ opacity: [0.4, 1, 0.4], y: [0, -2, 0] }}
      transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
    />
  </div>
);

/**
 * Quick action buttons
 */
const QuickActionButtons = ({ 
  actions, 
  onSelect 
}: { 
  actions: QuickAction[]; 
  onSelect: (action: QuickAction) => void;
}) => (
  <div className="px-4 pb-3 space-y-2">
    <p className="text-xs text-slate-500 font-medium">Quick actions:</p>
    <div className="grid grid-cols-2 gap-2">
      {actions.slice(0, 4).map((action) => (
        <button
          key={action.id}
          onClick={() => onSelect(action)}
          className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all text-left"
        >
          {action.label}
        </button>
      ))}
    </div>
    {actions.length > 4 && (
      <button
        onClick={() => onSelect(actions[4])}
        className="w-full px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
      >
        {actions[4].label}
      </button>
    )}
  </div>
);

/**
 * Ticket status badge
 */
const TicketStatusBadge = ({ ticket }: { ticket: Ticket | null }) => {
  if (!ticket) return null;
  
  const statusColors = {
    open: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-slate-100 text-slate-600',
    closed: 'bg-slate-100 text-slate-500',
  };
  
  const priorityColors = {
    low: 'text-slate-500',
    medium: 'text-blue-500',
    high: 'text-orange-500',
    urgent: 'text-red-500',
  };
  
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase ${statusColors[ticket.status]}`}>
          {ticket.status.replace('_', ' ')}
        </span>
        <span className={`text-[10px] font-medium ${priorityColors[ticket.priority]}`}>
          {ticket.priority} priority
        </span>
      </div>
      <span className="text-[10px] text-slate-400">
        Ticket #{ticket.id.slice(0, 8)}
      </span>
    </div>
  );
};

/**
 * Message bubble
 */
const MessageBubble = ({ message }: { message: TicketMessage }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  if (isSystem) {
    return (
      <div className="flex justify-center w-full my-2">
        <div className="px-3 py-1 text-xs text-center text-amber-700 bg-amber-50 border border-amber-100 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] px-4 py-2.5 shadow-sm text-sm ${
        isUser 
          ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
          : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-md'
      }`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

/**
 * Widget menu dropdown
 */
const WidgetMenu = ({ 
  onNewChat, 
  onCloseTicket, 
  hasTicket 
}: { 
  onNewChat: () => void; 
  onCloseTicket: () => void;
  hasTicket: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
      >
        <MoreVertical size={16} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
          >
            <button
              onClick={() => {
                onNewChat();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <RefreshCw size={14} />
              New Chat
            </button>
            {hasTicket && (
              <button
                onClick={() => {
                  onCloseTicket();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <XCircle size={14} />
                Close Ticket
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// Main Widget Component
// ============================================

const SupportWidget = () => {
  const {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    isOpen,
    setIsOpen,
    error,
    quickActions,
    showQuickActions,
    ticket,
    handleQuickAction,
    startNewConversation,
    closeTicket,
  } = useSupportChat();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || isTyping) return;

    const text = inputValue;
    setInputValue('');
    await sendMessage(text);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="mb-4 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-slate-950 p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">Support</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <p className="text-[11px] text-slate-400 font-medium">AI Assistant • Online</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <WidgetMenu 
                    onNewChat={startNewConversation} 
                    onCloseTicket={closeTicket}
                    hasTicket={!!ticket}
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                  >
                    <Minimize2 size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {/* Loading state */}
                {isLoading && messages.length === 0 && (
                  <div className="flex justify-center items-center h-full">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      <span className="text-sm text-slate-500">Loading conversation...</span>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {!isLoading && messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start w-full">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md shadow-sm">
                      <TypingIndicator />
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="flex justify-center w-full">
                    <div className="px-4 py-2 text-xs text-center text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {showQuickActions && quickActions.length > 0 && !isLoading && (
                <QuickActionButtons 
                  actions={quickActions} 
                  onSelect={handleQuickAction} 
                />
              )}

              {/* Ticket Status */}
              <TicketStatusBadge ticket={ticket} />

              {/* Input */}
              <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border-slate-200 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
                    disabled={isLoading || isTyping}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading || isTyping}
                    className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Launcher Button */}
      <motion.button
        className="pointer-events-auto w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle size={28} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default SupportWidget;