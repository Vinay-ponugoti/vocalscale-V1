/**
 * Chat types for Knowledge Chat feature
 */

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: FileAttachment[];
  sources?: Source[];
}

export interface FileAttachment {
  id: string;
  name: string;
}

export interface Source {
  name: string;
  excerpt?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  last_message: string;
  updated_at: string;
  message_count: number;
}

export interface ChatRequest {
  message: string;
  session_id?: string | null;
  attachments?: string[];
  skill_id?: string | null;
}

export interface SessionsResponse {
  sessions: ChatSession[];
}

export interface MessagesResponse {
  session_id: string;
  messages: ChatMessage[];
}

export interface FileUploadResponse {
  file_id: string;
  filename: string;
  status: string;
}

// SSE Event types
export interface ChunkEvent {
  text: string;
}

export interface DoneEvent {
  session_id: string;
  sources: Source[];
  intent?: string;
  skill_used?: string;
}

export interface ErrorEvent {
  error: string;
}
