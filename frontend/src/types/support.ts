/**
 * Support System Types
 * 
 * Types for the enterprise-level support widget
 */

// ============================================
// Enums
// ============================================

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'general' | 'technical' | 'billing' | 'account' | 'feature_request';
export type MessageRole = 'user' | 'assistant' | 'system';

// ============================================
// Ticket Types
// ============================================

export interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  unread_count: number;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string;
  metadata?: Record<string, any>;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  role: MessageRole;
  content: string;
  sender_name: string;
  created_at?: string;
  metadata?: Record<string, any>;
}

export interface TicketWithMessages {
  ticket: Ticket;
  messages: TicketMessage[];
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
}

// ============================================
// Chat Types
// ============================================

export interface SupportChatRequest {
  message: string;
  ticket_id?: string;
  history?: Array<{ role: string; content: string }>;
  user_metadata?: {
    name?: string;
    email?: string;
  };
  context?: Record<string, any>;
}

export interface SupportChatResponse {
  draft: string;
  ticket_id: string;
  confidence: 'low' | 'medium' | 'high';
  category: TicketCategory;
  priority: TicketPriority;
  is_new_ticket: boolean;
}

// ============================================
// Quick Actions
// ============================================

export interface QuickAction {
  id: string;
  label: string;
  icon?: string;
  action: string;
  category: TicketCategory;
}

export interface QuickActionsResponse {
  actions: QuickAction[];
}

// ============================================
// Widget State
// ============================================

export interface WidgetState {
  isOpen: boolean;
  isLoading: boolean;
  isTyping: boolean;
  messages: TicketMessage[];
  ticket: Ticket | null;
  error: string | null;
}

export interface StoredSession {
  ticketId: string;
  lastActivity: number;
  userId: string;
}

// ============================================
// Message Status (for UI)
// ============================================

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageWithStatus extends TicketMessage {
  status?: MessageStatus;
  isOptimistic?: boolean;
}

// ============================================
// API Request Types
// ============================================

export interface CreateTicketRequest {
  subject?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  initial_message?: string;
  metadata?: Record<string, any>;
}

export interface SendMessageRequest {
  content: string;
  metadata?: Record<string, any>;
}