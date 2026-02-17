/**
 * Chat hooks for Knowledge Chat feature
 * Handles streaming responses, session management, and file uploads
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chat';
import type { ChatMessage, FileAttachment, BusinessContext, GeneratedImage, DoneEvent } from '../types/chat';
import { useAuth } from '../context/AuthContext';
import { useBusinessSetup } from '../context/BusinessSetupContext';

/**
 * Hook for managing chat messages and streaming
 */
export function useChat(sessionId: string | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { state: businessState } = useBusinessSetup();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<FileAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<GeneratedImage[]>([]);

  // Track the actual session ID (may be updated when new session is created)
  const currentSessionIdRef = useRef<string | null>(sessionId);

  // Memoize business context to avoid unnecessary re-renders
  const businessContext = useMemo<BusinessContext | undefined>(() => {
    const { data } = businessState;
    if (!data?.business?.business_name) return undefined;

    return {
      business_name: data.business.business_name,
      category: data.business.category,
      phone: data.business.phone,
      address: data.business.address,
      description: data.business.description,
      email: data.business.email,
      website: data.business.website,
      timezone: data.business.timezone,
      services: data.services?.map(s => ({
        name: s.name,
        price: s.price,
        description: s.description,
      })),
      business_hours: data.business_hours?.map(h => ({
        day_of_week: h.day_of_week,
        open_time: h.open_time,
        close_time: h.close_time,
        enabled: h.enabled,
      })),
    };
  }, [businessState]);

  // Update ref when prop changes
  useEffect(() => {
    currentSessionIdRef.current = sessionId;
  }, [sessionId]);

  // Load messages when session changes
  const { data: fetchedMessages, isLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      console.log(`[useChat] Fetching messages for session: ${sessionId}`);
      const msgs = await chatApi.getMessages(sessionId);
      console.log(`[useChat] Fetched ${msgs.length} messages`);
      return msgs;
    },
    enabled: !!sessionId && !!user?.id,
    staleTime: 0,
  });

  // Clear messages when starting a new chat (sessionId becomes null)
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      setStreamingContent('');
      setError(null);
    }
  }, [sessionId]);

  // Sync fetched messages when they arrive from Supabase
  useEffect(() => {
    if (fetchedMessages && !isStreaming) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages, isStreaming]);



  /**
   * Send a message and handle streaming response
   * Note: User authentication is handled by the backend via JWT token
   * Returns the session_id (new or existing) so the parent can track it
   */
  const sendMessage = useCallback(async (content: string): Promise<string | null> => {
    if (!content.trim()) return null;

    try {
      setIsStreaming(true);
      setError(null);

      // Optimistically add user message
      const optimId = `optim-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: optimId,
        session_id: sessionId || 'temp',
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);
      setStreamingContent(''); // Reset streaming buffer

      // Check if we have attachments
      const attachmentIds = pendingFiles.length > 0 ? pendingFiles.map(f => f.id) : [];

      // Send to API — capture session_id from SSE done event
      let fullResponse = '';
      let returnedSessionId: string | null = null;
      let receivedImages: GeneratedImage[] = [];
      let receivedGenerationId: string | undefined;
      let receivedPresets: Record<string, string> = {};

      console.log('[useChat] Starting message send...');
      setImageStatus(null);
      setPendingImages([]);

      await chatApi.sendMessageStream(
        {
          message: content.trim(),
          session_id: sessionId || undefined,
          attachments: attachmentIds.length > 0 ? attachmentIds : undefined,
          business_context: businessContext,
        },
        // onChunk
        (chunk) => {
          fullResponse += chunk;
          setStreamingContent(fullResponse);
        },
        // onDone — capture the full done event data
        (doneData: DoneEvent) => {
          returnedSessionId = doneData.session_id;
          // Capture images from done event if present
          if (doneData.images && doneData.images.length > 0) {
            receivedImages = doneData.images;
          }
          if (doneData.generation_id) {
            receivedGenerationId = doneData.generation_id;
          }
          console.log(`[useChat] SSE done: session_id=${doneData.session_id}, sources=${doneData.sources?.length || 0}, images=${doneData.images?.length || 0}`);
        },
        // onError
        (err) => {
          throw err;
        },
        // onImageStatus
        (status) => {
          setImageStatus(status);
          console.log(`[useChat] Image status: ${status}`);
        },
        // onImageReady
        (images, generationId, _enhancedPrompt, availablePresets) => {
          receivedImages = images;
          receivedGenerationId = generationId;
          receivedPresets = availablePresets;
          setPendingImages(images);
          setImageStatus('complete');
          console.log(`[useChat] Images ready: ${images.length} images, generation_id=${generationId}`);
          console.log(`[useChat] Image URLs:`, images.map((img: GeneratedImage) => img.url));
        }
      );

      // Once complete, add assistant message and clear streaming
      const resolvedSessionId = returnedSessionId || sessionId || 'temp';
      const assistantMessage: ChatMessage = {
        id: `resp-${Date.now()}`,
        session_id: resolvedSessionId,
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString(),
        images: receivedImages.length > 0 ? receivedImages : undefined,
        generation_id: receivedGenerationId,
        available_presets: Object.keys(receivedPresets).length > 0 ? receivedPresets : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingContent('');
      setPendingFiles([]); // Clear attachments
      setImageStatus(null);
      setPendingImages([]);

      // Update the ref so subsequent messages use the correct session
      if (returnedSessionId) {
        currentSessionIdRef.current = returnedSessionId;
      }

      // Refetch messages and sessions list to show the new conversation
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
        queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      }, 500);

      // Return the session_id (not the response text) so parent can update state
      return returnedSessionId;

    } catch (err) {
      console.error('Failed to send message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      return null;
    } finally {
      setIsStreaming(false);
    }
  }, [sessionId, pendingFiles, queryClient, businessContext]);

  /**
   * Cancel streaming generation
   */
  const stopGenerating = useCallback(() => {
    if (isStreaming) {
      // Logic to cancel stream would go here
      // content-client doesn't support cancellation yet
      setIsStreaming(false);

      // Save what we have so far
      if (streamingContent) {
        setMessages(prev => [
          ...prev,
          {
            id: `aborted-${Date.now()}`,
            session_id: sessionId || 'temp',
            role: 'assistant',
            content: streamingContent,
            timestamp: new Date().toISOString()
          }
        ]);
      }

      setStreamingContent('');
      return null;
    }
  }, [sessionId, isStreaming, streamingContent]);

  /**
   * Upload a file to attach to the next message
   * Note: User authentication is handled by the backend via JWT token
   */
  const uploadFile = useCallback(async (file: File): Promise<FileAttachment | null> => {
    try {
      const result = await chatApi.uploadFile(file);
      const attachment: FileAttachment = {
        id: result.file_id,
        name: result.filename,
      };
      setPendingFiles(prev => [...prev, attachment]);
      return attachment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      return null;
    }
  }, []);

  /**
   * Remove a pending file attachment
   */
  const removeFile = useCallback((fileId: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    streamingContent,
    isStreaming,
    isLoading,
    pendingFiles,
    error,
    imageStatus,
    pendingImages,
    sendMessage,
    uploadFile,
    removeFile,
    stopGenerating,
    clearError,
    refetchMessages,
  };
}

/**
 * Hook for managing chat sessions list
 */
export function useChatSessions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => chatApi.getSessions(),
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
  });

  // Delete session mutation
  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) => chatApi.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });

  const deleteSession = useCallback((sessionId: string) => {
    deleteMutation.mutate(sessionId);
  }, [deleteMutation]);

  return {
    sessions,
    isLoading,
    error: error instanceof Error ? error.message : null,
    deleteSession,
    isDeleting: deleteMutation.isPending,
    refetch,
  };
}
