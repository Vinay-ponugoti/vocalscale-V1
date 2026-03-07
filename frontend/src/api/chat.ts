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
  SocialContent,
  ModelOption,
} from '../types/chat';

const KNOWLEDGE_URL = env.KNOWLEDGE_API_URL;
console.log('[ChatAPI] Initialized with URL:', KNOWLEDGE_URL);

class ChatAPI {
  /**
   * Get the current user ID for header isolation
   */
  private async getUserId(): Promise<string | undefined> {
    try {
      const session = await getStoredSession();
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
   * Send a chat message and receive streaming response via SSE.
   * Handles text chunks, done events, image status, and image ready events.
   */
  async sendMessageStream(
    request: ChatRequest & { model?: ModelOption },
    onChunk: (text: string) => void,
    onDone: (data: DoneEvent) => void,
    onError: (error: Error) => void,
    onImageStatus?: (status: string) => void,
    onImageReady?: (
      images: GeneratedImage[],
      generationId: string,
      enhancedPrompt: string,
      availablePresets: Record<string, string>,
      socialContent: SocialContent | null,
    ) => void,
  ): Promise<void> {
    const userId = await this.getUserId();
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
        const errorMessage = typeof errorData.detail === 'string'
          ? errorData.detail
          : JSON.stringify(errorData.detail || errorData);
        throw new Error(errorMessage || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let currentEventType = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last potentially incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            // Track the current SSE event type for the following data line
            currentEventType = line.slice(7).trim();
            console.log(`[SSE] event header received: "${currentEventType}"`);
            continue;
          }

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              // Capture and clear event type before dispatching
              const evt = currentEventType;
              currentEventType = '';

              console.log(`[SSE] dispatching event: "${evt || '(no type)'}" | keys: [${Object.keys(data).join(', ')}]`);

              // Dispatch strictly by event type — never guess from payload shape
              // (the 'done' payload also contains images/generation_id so shape-guessing breaks)
              if (evt === 'chunk') {
                // ── Text chunk ─────────────────────────────────────────────
                if (data.text) onChunk(data.text);

              } else if (evt === 'image_status') {
                // ── Image status ────────────────────────────────────────────
                console.log(`[SSE] image_status → "${data.status}"`);
                onImageStatus?.(data.status ?? 'analyzing');

              } else if (evt === 'image_ready') {
                // ── Image ready ─────────────────────────────────────────────
                console.log(`[SSE] image_ready → images: ${data.images?.length ?? 0}, generation_id: ${data.generation_id}, has social_content: ${!!data.social_content}`);
                if (data.images?.length > 0) {
                  onImageReady?.(
                    data.images,
                    data.generation_id || '',
                    data.enhanced_prompt || '',
                    data.available_presets || {},
                    data.social_content ?? null,
                  );
                } else {
                  console.warn('[SSE] image_ready event received but images array is empty or missing!', data);
                }

              } else if (evt === 'done') {
                // ── Done ────────────────────────────────────────────────────
                console.log(`[SSE] done → session_id: ${data.session_id}, sources: ${data.sources?.length ?? 0}`);
                onDone({
                  session_id: data.session_id,
                  sources: data.sources || [],
                  intent: data.intent,
                  skill_used: data.skill_used,
                });

              } else if (evt === 'error') {
                // ── Error ───────────────────────────────────────────────────
                console.error(`[SSE] error event: ${data.error}`);
                onError(new Error(data.error || 'Unknown stream error'));

              } else {
                // ── Fallback: no event type — infer from payload ────────────
                console.log(`[SSE] no event type — inferring from payload shape. keys: [${Object.keys(data).join(', ')}]`);
                if (data.text) onChunk(data.text);
                else if (data.session_id !== undefined) {
                  onDone({ session_id: data.session_id, sources: data.sources || [] });
                } else if (data.error) {
                  onError(new Error(data.error));
                }
              }

            } catch {
              console.warn('[ChatAPI] Failed to parse SSE data:', line);
              currentEventType = '';
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
            onDone({ session_id: data.session_id, sources: data.sources || [] });
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
   * Upload a file to attach to chat
   */
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const userId = await this.getUserId();
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
    const userId = await this.getUserId();
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
    const userId = await this.getUserId();
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
    const userId = await this.getUserId();
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

  /**
   * Regenerate images for additional size presets.
   * Calls POST /chat/images/regenerate with generationId, sessionId, and desired preset names.
   * Returns { images: GeneratedImage[] }
   */
  async regenerateImage(
    generationId: string,
    sessionId: string,
    presetNames: string[],
  ): Promise<{ images: GeneratedImage[] }> {
    const userId = await this.getUserId();
    const headers = await getAuthHeader(userId);

    try {
      const response = await fetch(`${KNOWLEDGE_URL}/chat/images/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          generation_id: generationId,
          session_id: sessionId,
          presets: presetNames,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to regenerate image' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[ChatAPI] regenerateImage failed:', error);
      throw error;
    }
  }
}

export const chatApi = new ChatAPI();
