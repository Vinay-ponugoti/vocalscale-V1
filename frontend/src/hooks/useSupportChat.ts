/**
 * useSupportChat Hook
 * 
 * Enterprise-level support chat hook with:
 * - Message persistence across page refreshes
 * - Cross-device sync via database
 * - Automatic ticket creation
 * - Typing indicators
 * - Quick actions support
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supportApi } from '../api/support';
import { useAuth } from '../context/AuthContext';
import type { 
  Ticket, 
  TicketMessage, 
  QuickAction,
  TicketCategory 
} from '../types/support';

// Constants
const GREETING_MESSAGE: TicketMessage = {
  id: 'greeting',
  ticket_id: '',
  role: 'assistant',
  content: "Hi there! 👋 I'm the VocalScale Support Bot. How can I help you today?",
  sender_name: 'VocalScale Bot',
  created_at: new Date().toISOString(),
};

interface UseSupportChatReturn {
  // State
  messages: TicketMessage[];
  ticket: Ticket | null;
  isLoading: boolean;
  isTyping: boolean;
  isOpen: boolean;
  error: string | null;
  quickActions: QuickAction[];
  showQuickActions: boolean;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  handleQuickAction: (action: QuickAction) => Promise<void>;
  setIsOpen: (open: boolean) => void;
  startNewConversation: () => void;
  closeTicket: () => Promise<void>;
}

export function useSupportChat(): UseSupportChatReturn {
  const { user } = useAuth();
  
  // State
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  // Refs
  const initialized = useRef(false);
  const restoringSession = useRef(false);

  /**
   * Initialize: Load quick actions and restore session if exists
   */
  useEffect(() => {
    if (isOpen && !initialized.current) {
      initialized.current = true;
      
      // Load quick actions
      loadQuickActions();
      
      // Try to restore previous session
      restoreSession();
    }
  }, [isOpen]);

  /**
   * Show quick actions only for new conversations
   */
  useEffect(() => {
    setShowQuickActions(messages.length <= 1 && !ticket);
  }, [messages.length, ticket]);

  /**
   * Load quick action buttons
   */
  const loadQuickActions = async () => {
    try {
      const response = await supportApi.getQuickActions();
      setQuickActions(response.actions);
    } catch (err) {
      console.error('Failed to load quick actions:', err);
    }
  };

  /**
   * Restore previous session from localStorage or database
   */
  const restoreSession = async () => {
    if (restoringSession.current) return;
    restoringSession.current = true;
    
    setIsLoading(true);
    
    try {
      // Check localStorage first
      const storedSession = supportApi.getStoredSession();
      
      if (storedSession?.ticketId) {
        // Fetch messages from database
        const result = await supportApi.getTicketMessages(storedSession.ticketId);
        
        if (result.messages.length > 0) {
          setTicket(result.ticket);
          setMessages(result.messages);
          setError(null);
          return;
        }
      }
      
      // Try to get active ticket from database
      const activeTicket = await supportApi.getActiveTicket();
      
      if (activeTicket) {
        const result = await supportApi.getTicketMessages(activeTicket.id);
        setTicket(result.ticket);
        setMessages(result.messages);
      } else {
        // No existing session, show greeting
        setMessages([GREETING_MESSAGE]);
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
      // Show greeting on error
      setMessages([GREETING_MESSAGE]);
    } finally {
      setIsLoading(false);
      restoringSession.current = false;
    }
  };

  /**
   * Send a message
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return;
    
    setError(null);
    
    // Add optimistic user message
    const optimisticUserMessage: TicketMessage = {
      id: `temp-${Date.now()}`,
      ticket_id: ticket?.id || '',
      role: 'user',
      content: content.trim(),
      sender_name: user?.full_name || 'User',
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, optimisticUserMessage]);
    setShowQuickActions(false);
    setIsTyping(true);
    
    try {
      // Build history from existing messages
      const history = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));
      
      // Add current message to history
      history.push({ role: 'user', content: content.trim() });
      
      // Send to API
      const response = await supportApi.sendSupportChat(
        content.trim(),
        history,
        {
          name: user?.full_name,
          email: user?.email,
        },
        ticket?.id
      );
      
      // Update ticket info
      if (!ticket) {
        setTicket({
          id: response.ticket_id,
          user_id: user?.id || '',
          subject: content.trim().slice(0, 100),
          status: 'open',
          priority: response.priority,
          category: response.category,
          unread_count: 0,
        });
      }
      
      // Remove optimistic message and add real messages
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== optimisticUserMessage.id);
        
        // Add user message (real one from DB)
        const realUserMessage: TicketMessage = {
          id: `user-${Date.now()}`,
          ticket_id: response.ticket_id,
          role: 'user',
          content: content.trim(),
          sender_name: user?.full_name || 'User',
          created_at: new Date().toISOString(),
        };
        
        // Add bot response
        const botMessage: TicketMessage = {
          id: `bot-${Date.now()}`,
          ticket_id: response.ticket_id,
          role: 'assistant',
          content: response.draft,
          sender_name: 'VocalScale Bot',
          created_at: new Date().toISOString(),
          metadata: {
            confidence: response.confidence,
            category: response.category,
          },
        };
        
        return [...filtered, realUserMessage, botMessage];
      });
      
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticUserMessage.id));
    } finally {
      setIsTyping(false);
    }
  }, [messages, ticket, user, isTyping]);

  /**
   * Handle quick action button click
   */
  const handleQuickAction = useCallback(async (action: QuickAction) => {
    await sendMessage(action.action);
  }, [sendMessage]);

  /**
   * Start a new conversation
   */
  const startNewConversation = useCallback(() => {
    supportApi.clearSession();
    setTicket(null);
    setMessages([GREETING_MESSAGE]);
    setError(null);
    setShowQuickActions(true);
  }, []);

  /**
   * Close current ticket
   */
  const closeTicket = useCallback(async () => {
    if (!ticket) return;
    
    try {
      await supportApi.closeTicket(ticket.id);
      setTicket(null);
      setMessages([GREETING_MESSAGE]);
      setShowQuickActions(true);
    } catch (err) {
      console.error('Failed to close ticket:', err);
    }
  }, [ticket]);

  /**
   * Update session activity on unmount
   */
  useEffect(() => {
    return () => {
      if (ticket) {
        supportApi.touchSession();
      }
    };
  }, [ticket]);

  return {
    // State
    messages,
    ticket,
    isLoading,
    isTyping,
    isOpen,
    error,
    quickActions,
    showQuickActions,
    
    // Actions
    sendMessage,
    handleQuickAction,
    setIsOpen,
    startNewConversation,
    closeTicket,
  };
}