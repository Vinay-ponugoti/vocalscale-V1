/**
 * Support API Client
 * 
 * Handles all support widget API calls with persistence
 */

import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';
import type {
  Ticket,
  TicketMessage,
  TicketWithMessages,
  TicketListResponse,
  SupportChatRequest,
  SupportChatResponse,
  QuickActionsResponse,
  QuickAction,
  CreateTicketRequest,
  SendMessageRequest,
} from '../types/support';

const API_BASE_URL = env.API_URL;

// Storage key for session persistence
const SESSION_STORAGE_KEY = 'vocalscale_support_session';

/**
 * Support API class
 */
class SupportAPI {
  /**
   * Make authenticated request
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = await getAuthHeader();

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...options.headers,
      },
      credentials: 'include',
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.error || error.detail || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ============================================
  // Session Persistence
  // ============================================

  /**
   * Save session to localStorage
   */
  saveSession(ticketId: string, userId: string): void {
    const session = {
      ticketId,
      userId,
      lastActivity: Date.now(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  /**
   * Get stored session from localStorage
   */
  getStoredSession(): { ticketId: string; lastActivity: number; userId: string } | null {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored);
      
      // Check if session is recent (within 24 hours)
      const ageHours = (Date.now() - session.lastActivity) / (1000 * 60 * 60);
      if (ageHours > 24) {
        this.clearSession();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  /**
   * Clear stored session
   */
  clearSession(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  /**
   * Update session activity timestamp
   */
  touchSession(): void {
    const stored = this.getStoredSession();
    if (stored) {
      this.saveSession(stored.ticketId, stored.userId);
    }
  }

  // ============================================
  // Quick Actions
  // ============================================

  /**
   * Get quick action buttons
   */
  async getQuickActions(): Promise<QuickActionsResponse> {
    return this.request<QuickActionsResponse>('/support/quick-actions');
  }

  // ============================================
  // Tickets
  // ============================================

  /**
   * Create a new ticket
   */
  async createTicket(request: CreateTicketRequest): Promise<Ticket> {
    const ticket = await this.request<Ticket>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    // Save to localStorage
    if (ticket.id) {
      this.saveSession(ticket.id, ticket.user_id);
    }
    
    return ticket;
  }

  /**
   * Get user's active ticket
   */
  async getActiveTicket(): Promise<Ticket | null> {
    try {
      const ticket = await this.request<Ticket | null>('/support/tickets/active');
      
      // Update localStorage
      if (ticket) {
        this.saveSession(ticket.id, ticket.user_id);
      }
      
      return ticket;
    } catch {
      return null;
    }
  }

  /**
   * Get all user tickets
   */
  async getTickets(status?: string, limit: number = 20): Promise<TicketListResponse> {
    let url = `/support/tickets?limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.request<TicketListResponse>(url);
  }

  /**
   * Get ticket by ID
   */
  async getTicket(ticketId: string): Promise<Ticket> {
    return this.request<Ticket>(`/support/tickets/${ticketId}`);
  }

  /**
   * Get ticket with messages (for restoring chat history)
   */
  async getTicketMessages(ticketId: string): Promise<TicketWithMessages> {
    const result = await this.request<TicketWithMessages>(`/support/tickets/${ticketId}/messages`);
    
    // Update session activity
    this.touchSession();
    
    return result;
  }

  /**
   * Mark ticket as read
   */
  async markAsRead(ticketId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/support/tickets/${ticketId}/read`, {
      method: 'PATCH',
    });
  }

  /**
   * Close a ticket
   */
  async closeTicket(ticketId: string): Promise<{ success: boolean }> {
    const result = await this.request<{ success: boolean }>(`/support/tickets/${ticketId}/close`, {
      method: 'POST',
    });
    
    // Clear session
    this.clearSession();
    
    return result;
  }

  // ============================================
  // Messages
  // ============================================

  /**
   * Send a message to a ticket
   */
  async sendMessage(ticketId: string, request: SendMessageRequest): Promise<TicketMessage> {
    const message = await this.request<TicketMessage>(`/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    // Update session activity
    this.touchSession();
    
    return message;
  }

  // ============================================
  // AI Chat
  // ============================================

  /**
   * Send support chat message with AI response
   * This creates/reuses a ticket automatically
   */
  async chat(request: SupportChatRequest): Promise<SupportChatResponse> {
    const response = await this.request<SupportChatResponse>('/support/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    // Save/update session
    this.saveSession(response.ticket_id, request.user_metadata?.name || 'user');
    
    return response;
  }

  /**
   * Convenience method for widget chat
   * Handles ticket creation and message sending automatically
   */
  async sendSupportChat(
    message: string,
    history: Array<{ role: string; content: string }>,
    userInfo?: { name?: string; email?: string },
    existingTicketId?: string
  ): Promise<SupportChatResponse> {
    return this.chat({
      message,
      ticket_id: existingTicketId,
      history,
      user_metadata: userInfo,
      context: {
        source: 'dashboard_widget',
      },
    });
  }
}

// Export singleton instance
export const supportApi = new SupportAPI();

// Export class for testing
export { SupportAPI };