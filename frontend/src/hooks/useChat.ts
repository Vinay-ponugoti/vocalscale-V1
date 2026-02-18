/**
 * Chat hooks for Knowledge Chat feature
 * Handles streaming responses, session management, image generation, and social content.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chat';
import type {
  ChatMessage,
  FileAttachment,
  BusinessContext,
  GeneratedImage,
  SocialContent,
} from '../types/chat';
import { useAuth } from '../context/AuthContext';
import { useBusinessSetup } from '../context/BusinessSetupContext';

// Image generation status shown to the user
export type ImageStatus = 'analyzing' | 'generating' | 'complete' | null;

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
  const [imageStatus, setImageStatus] = useState<ImageStatus>(null);
  const [pendingImages, setPendingImages] = useState<GeneratedImage[]>([]);

  const currentSessionIdRef = useRef<string | null>(sessionId);

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
      services: data.services?.map(s => ({ name: s.name, price: s.price, description: s.description })),
      business_hours: data.business_hours?.map(h => ({
        day_of_week: h.day_of_week,
        open_time: h.open_time,
        close_time: h.close_time,
        enabled: h.enabled,
      })),
    };
  }, [businessState]);

  useEffect(() => { currentSessionIdRef.current = sessionId; }, [sessionId]);

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

  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      setStreamingContent('');
      setError(null);
      setImageStatus(null);
      setPendingImages([]);
    }
  }, [sessionId]);

  // Sync fetched messages — map image_data → images, preserve social_content
  useEffect(() => {
    if (fetchedMessages && !isStreaming) {
      const mapped = fetchedMessages.map((msg) => {
        if (msg.image_data && msg.image_data.length > 0 && (!msg.images || msg.images.length === 0)) {
          return { ...msg, images: msg.image_data };
        }
        return msg;
      });
      setMessages(mapped);
    }
  }, [fetchedMessages, isStreaming]);

  /**
   * Send a message and handle full streaming response including images + captions
   */
  const sendMessage = useCallback(async (content: string): Promise<string | null> => {
    if (!content.trim()) return null;

    try {
      setIsStreaming(true);
      setError(null);
      setImageStatus(null);
      setPendingImages([]);

      const optimId = `optim-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: optimId,
        session_id: sessionId || 'temp',
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }]);
      setStreamingContent('');

      const attachmentIds = pendingFiles.length > 0 ? pendingFiles.map(f => f.id) : [];

      let fullResponse = '';
      let returnedSessionId: string | null = null;
      let receivedImages: GeneratedImage[] = [];
      let receivedGenerationId: string | undefined;
      let receivedPresets: Record<string, string> = {};
      let receivedSocialContent: SocialContent | null = null;

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
        // onDone
        (data) => {
          returnedSessionId = data.session_id || null;
        },
        // onError
        (err) => { throw err; },
        // onImageStatus
        (status) => {
          setImageStatus(status as ImageStatus);
          console.log(`[useChat] Image status: ${status}`);
        },
        // onImageReady
        (images, generationId, _enhancedPrompt, availablePresets, socialContent) => {
          receivedImages = images;
          receivedGenerationId = generationId;
          receivedPresets = availablePresets;
          receivedSocialContent = socialContent ?? null;
          setPendingImages(images);
          setImageStatus('complete');
          console.log(`[useChat] Images ready: ${images.length}, caption chars: ${socialContent?.caption?.length ?? 0}`);
        },
      );

      const assistantMessage: ChatMessage = {
        id: `resp-${Date.now()}`,
        session_id: returnedSessionId || sessionId || 'temp',
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString(),
        images: receivedImages.length > 0 ? receivedImages : undefined,
        generation_id: receivedGenerationId,
        available_presets: Object.keys(receivedPresets).length > 0 ? receivedPresets : undefined,
        social_content: receivedSocialContent,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingContent('');
      setPendingFiles([]);

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
        if (returnedSessionId) queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      }, 800);

      return returnedSessionId || sessionId;

    } catch (err) {
      console.error('[useChat] sendMessage error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return null;
    } finally {
      setIsStreaming(false);
      setImageStatus(null);
    }
  }, [sessionId, pendingFiles, queryClient, businessContext]);

  const stopGenerating = useCallback(() => {
    if (isStreaming) {
      setIsStreaming(false);
      if (streamingContent) {
        setMessages(prev => [...prev, {
          id: `aborted-${Date.now()}`,
          session_id: sessionId || 'temp',
          role: 'assistant',
          content: streamingContent,
          timestamp: new Date().toISOString(),
        }]);
      }
      setStreamingContent('');
    }
  }, [sessionId, isStreaming, streamingContent]);

  const uploadFile = useCallback(async (file: File): Promise<FileAttachment | null> => {
    try {
      const result = await chatApi.uploadFile(file);
      const attachment: FileAttachment = { id: result.file_id, name: result.filename };
      setPendingFiles(prev => [...prev, attachment]);
      return attachment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      return null;
    }
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const clearError = useCallback(() => setError(null), []);

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

  const { data: sessions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => chatApi.getSessions(),
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) => chatApi.deleteSession(sessionId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['chat-sessions'] }); },
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
