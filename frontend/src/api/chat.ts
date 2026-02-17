/* eslint-disable @typescript-eslint/no-explicit-any */
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
  GeneratedImage,
  DoneEvent,
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
    onDone: (data: DoneEvent) => void,
    onError: (error: Error) => void,
    onImageStatus?: (status: string) => void,
    onImageReady?: (images: GeneratedImage[], generationId: string, enhancedPrompt: string, availablePresets: Record<string, string>) => void
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
      let currentEvent = 'message'; // default SSE event type

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
          // Track the event type for the next data line
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
            continue;
          }

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (currentEvent) {
                case 'chunk':
                  if (data.text) {
                    onChunk(data.text);
                  }
                  break;

                case 'image_status':
                  if (data.status && onImageStatus) {
                    onImageStatus(data.status);
                  }
                  break;

                case 'image_ready':
                  if (data.images && onImageReady) {
                    onImageReady(
                      data.images,
                      data.generation_id || '',
                      data.enhanced_prompt || '',
                      data.available_presets || {}
                    );
                  }
                  break;

                case 'done':
                  onDone({
                    session_id: data.session_id,
                    sources: data.sources || [],
                    intent: data.intent,
                    skill_used: data.skill_used,
                    tokens_used: data.tokens_used,
                    prompt_tokens: data.prompt_tokens,
                    completion_tokens: data.completion_tokens,
                    cost_cents: data.cost_cents,
                    images: data.images,
                    generation_id: data.generation_id,
                  });
                  break;

                case 'error':
                  if (data.error) {
                    onError(new Error(data.error));
                  }
                  break;

                default:
                  // Fallback: handle data without event type (backwards compat)
                  if (data.text) {
                    onChunk(data.text);
                  }
                  if (data.session_id !== undefined && data.sources !== undefined) {
                    onDone({
                      session_id: data.session_id,
                      sources: data.sources || [],
                    });
                  }
                  if (data.error) {
                    onError(new Error(data.error));
                  }
                  break;
              }

              // Reset event type after processing data
              currentEvent = 'message';
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
          if (data.session_id !== undefined) {
            onDone({
              session_id: data.session_id,
              sources: data.sources || [],
            });
          }
        } catch {
          // Ignore parse errors for final buffer
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Regenerate images with different presets
   */
  async regenerateImage(
    generationId: string,
    sessionId: string,
    presetNames: string[],
    enhancedPrompt?: string
  ): Promise<{ images: GeneratedImage[]; generation_id: string; cost_cents: number }> {
    const userId = this.getUserId();
    const headers = await getAuthHeader(userId);

    const response = await fetch(`${KNOWLEDGE_URL}/chat/images/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        generation_id: generationId,
        session_id: sessionId,
        preset_names: presetNames,
        enhanced_prompt: enhancedPrompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Image regeneration failed' }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
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
