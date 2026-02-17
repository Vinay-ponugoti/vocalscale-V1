/**
 * Chat Sidebar Component
 * ChatGPT-style mobile-friendly drawer with conversation list
 */

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Trash2, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { ChatSession } from '../../../../types/chat';
import { cn } from '../../../../lib/utils';

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 500;
const DEFAULT_SIDEBAR_WIDTH = 280;

interface ChatSidebarProps {
  sessions: ChatSession[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean; // Mobile sidebar open state
  onClose?: () => void; // Mobile sidebar close handler
  loading: boolean;
  isDesktopOpen: boolean; // Desktop sidebar open state
  onToggleDesktopSidebar: () => void; // Desktop sidebar toggle handler
}

const ChatSidebar = ({
  sessions,
  selectedId,
  onSelect,
  onNewChat,
  onDelete,
  isOpen,
  onClose,
  loading,
  isDesktopOpen,
  onToggleDesktopSidebar,
}: ChatSidebarProps) => {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = e.clientX - (sidebarRef.current?.offsetLeft || 0);
    if (newWidth > MIN_SIDEBAR_WIDTH && newWidth < MAX_SIDEBAR_WIDTH) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);
  const handleSelectSession = (id: string) => {
    onSelect(id);
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "sidebar-overlay fixed inset-0 bg-black/50 z-[100] transition-all duration-300 lg:hidden",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={onClose}
      />

      {/* Sidebar — always visible on desktop, drawer on mobile */}
      <aside
        ref={sidebarRef}
        className={cn(
          "mobile-sidebar fixed lg:relative left-0 top-0 bottom-0 z-[101] lg:z-auto",
          "bg-white",
          "flex flex-col overflow-y-auto",
          "transition-transform duration-300 ease-out",
          // Desktop: always visible with border
          "lg:border-r lg:border-gray-200",
          // Mobile: slide in/out
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: open/closed
          isDesktopOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full lg:w-0'
        )}
        style={{ width: isDesktopOpen ? sidebarWidth : 0 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <span className="font-semibold text-gray-900">Chats</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
            {/* Desktop toggle button */}
            <button
              onClick={onToggleDesktopSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg hidden lg:block transition-colors"
              title={isDesktopOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isDesktopOpen ? (
                <PanelLeftClose size={20} className="text-gray-500" />
              ) : (
                <PanelLeftOpen size={20} className="text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-2">
          <button
            onClick={() => {
              onNewChat();
              onClose?.();
            }}
            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span className="text-gray-700">New chat</span>
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-2">
          {loading ? (
            <div className="p-2 space-y-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse h-10 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No conversations yet</p>
            </div>
          ) : (
            <>
              <div className="mt-4 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recent
              </div>
              <div className="mt-2 space-y-1">
                {sessions.map(session => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isSelected={selectedId === session.id}
                    onSelect={handleSelectSession}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </>
          )}
        </div>

      </aside>

      {/* Resizer */}
      {isDesktopOpen && (
        <div
          className="hidden lg:block w-2 bg-transparent cursor-ew-resize absolute right-0 top-0 bottom-0 z-[102]"
          onMouseDown={handleMouseDown}
        />
      )}
    </>
  );
};

// Session item component
const SessionItem = ({
  session,
  isSelected,
  onSelect,
  onDelete,
}: {
  session: ChatSession;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <button
      onClick={() => onSelect(session.id)}
      className={cn(
        "w-full group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left text-sm",
        isSelected
          ? "bg-gray-100"
          : "hover:bg-gray-100"
      )}
    >
      <MessageSquare size={16} className="text-gray-400 flex-shrink-0" />
      <span className="flex-1 text-gray-700 truncate">
        {session.title || 'New conversation'}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(session.id);
        }}
        className={cn(
          "p-1 rounded-md transition-all",
          "opacity-0 group-hover:opacity-100",
          "text-gray-400 hover:text-red-500 hover:bg-red-50"
        )}
      >
        <Trash2 size={14} />
      </button>
    </button>
  );
};

export default ChatSidebar;
