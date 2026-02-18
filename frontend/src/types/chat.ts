/**
 * Chat types for Knowledge Chat feature
 */

// Image Generation types
export interface GeneratedImage {
  url: string;
  aspect_ratio: string;
  preset: string;
  preset_label: string;
  dimensions: string;
}

export interface SocialContent {
  caption: string;
  hashtags: string;
  ideas: string;
}

export interface ImageStatusEvent {
  status: 'enhancing_prompt' | 'generating' | 'uploading' | 'complete';
}

export interface ImageReadyEvent {
  images: GeneratedImage[];
  generation_id: string;
  enhanced_prompt: string;
  available_presets: Record<string, string>;
  social_content?: SocialContent | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: FileAttachment[];
  sources?: Source[];
  images?: GeneratedImage[];
  generation_id?: string;
  available_presets?: Record<string, string>;
  social_content?: SocialContent | null;
  // Persisted from Supabase — mapped back to `images` on load
  image_data?: GeneratedImage[];
}

export interface FileAttachment {
  id: string;
  name: string;
}

export interface Source {
  name: string;
  excerpt?: string;
  layer?: 'identity' | 'episodic' | 'semantic';
  url?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  last_message: string;
  updated_at: string;
  message_count: number;
}

export interface BusinessContext {
  business_name?: string;
  category?: string;
  phone?: string;
  address?: string;
  description?: string;
  email?: string;
  website?: string;
  timezone?: string;
  services?: Array<{
    name: string;
    price?: number;
    description?: string;
  }>;
  business_hours?: Array<{
    day_of_week: string;
    open_time?: string;
    close_time?: string;
    enabled: boolean;
  }>;
}

export interface ChatRequest {
  message: string;
  session_id?: string | null;
  attachments?: string[];
  skill_id?: string | null;
  business_context?: BusinessContext;
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
  tokens_used?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  cost_cents?: number;
  images?: GeneratedImage[];
  generation_id?: string;
}

export interface ErrorEvent {
  error: string;
}
