import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';
import { getStoredSession } from '../utils/sessionUtils';
import type {
  ChatRequest,
  ChatSession,
  ChatMessage,
  SessionsResponse,
  MessagesResponse,
  FileUploadResponse,
  Source,
} from '../types/chat';

const KNOWLEDGE_URL = env.KNOWLEDGE_API_URL;
console.log('[ChatAPI] Initialized with URL:', KNOWLEDGE_URL);

class ChatAPI {
  /**
   * Get the current user ID for header isolation
   */
  private getUserId(): string | undefined {
    try {
      const session = getStoredSession();
      // Check both id and user_id fields (Supabase vs our API format)
      const userId = session?.user?.id || (session?.user as any)?.user_id || (session?.user as any)?.sub;

      if (!userId && session?.user) {
        console.warn('[ChatAPI] No user ID found in session user object.', {
          availableFields: Object.keys(session.user)
        });
      }

      return userId;
    } catch (e) {
      console.error('[ChatAPI] Failed to get session from utils:', e);
      return undefined;
    }
  }

  /**
   * Send a chat message and receive streaming response via SSE
   */
  async sendMessageStream(
    request: ChatRequest,
    onChunk: (text: string) => void,
    onDone: (sessionId: string, sources: Source[]) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const userId = this.getUserId();
    const headers = await getAuthHeader(userId);

    try {
      const response = await fetch(`${KNOWLEDGE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(request),
      });
      // ... (rest of the content)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last potentially incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            // SSE event type line - we'll use it to parse the next data line
            continue;
          }

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.text) {
                onChunk(data.text);
              }

              if (data.session_id !== undefined && data.sources !== undefined) {
                onDone(data.session_id, data.sources || []);
              }

              if (data.error) {
                onError(new Error(data.error));
              }
            } catch {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }

      // Process any remaining data in buffer
      if (buffer.startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.slice(6));
          if (data.text) onChunk(data.text);
          if (data.session_id !== undefined) onDone(data.session_id, data.sources || []);
        } catch {
          // Ignore parse errors for final buffer
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Upload a file to attach to chat
   */
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const userId = this.getUserId();
    const headers = await getAuthHeader(userId);
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${KNOWLEDGE_URL}/chat/upload`, {
      method: 'POST',
      headers: {
        ...headers,
        // Don't set Content-Type - let browser set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get list of chat sessions
   */
  async getSessions(): Promise<ChatSession[]> {
    const userId = this.getUserId();
    const headers = await getAuthHeader(userId);

    const response = await fetch(`${KNOWLEDGE_URL}/chat/sessions`, {
      headers: {
        ...headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to load sessions' }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    const data: SessionsResponse = await response.json();
    return data.sessions;
  }

  /**
   * Get messages for a specific session
   */
  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const userId = this.getUserId();
    const headers = await getAuthHeader(userId);

    const response = await fetch(`${KNOWLEDGE_URL}/chat/sessions/${sessionId}/messages`, {
      headers: {
        ...headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to load messages' }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    const data: MessagesResponse = await response.json();
    return data.messages;
  }

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const userId = this.getUserId();
    const headers = await getAuthHeader(userId);

    const response = await fetch(`${KNOWLEDGE_URL}/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        ...headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to delete session' }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
  }
}

export const chatApi = new ChatAPI();
