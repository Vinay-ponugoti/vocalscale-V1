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
  ModelOption,
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
  // Guard: when images arrive via stream, block the sync effect from overwriting
  // local messages (which already have images) with stale fetchedMessages (no images yet)
  const hasLocalImagesRef = useRef(false);

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
  // Guard: skip sync when local images exist (stream just delivered them) to
  // prevent race condition where stale fetchedMessages overwrites image state.
  useEffect(() => {
    if (fetchedMessages && !isStreaming) {
      console.log(`[useChat] Sync effect: fetchedMessages=${fetchedMessages.length}, hasLocalImages=${hasLocalImagesRef.current}`);
      if (hasLocalImagesRef.current) {
        console.log('[useChat] Sync skipped — local images present, waiting for backend to persist');
        return;
      }
      const mapped = fetchedMessages.map((msg) => {
        if (msg.image_data && msg.image_data.length > 0 && (!msg.images || msg.images.length === 0)) {
          console.log(`[useChat] Sync: mapping image_data→images for msg ${msg.id} (${msg.image_data.length} images)`);
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
  const sendMessage = useCallback(async (content: string, model: ModelOption = 'auto', aspectRatio?: string, imageStyle?: string): Promise<string | null> => {
    if (!content.trim()) return null;

    try {
      setIsStreaming(true);
      setError(null);
      setImageStatus(null);
      setPendingImages([]);
      hasLocalImagesRef.current = false; // reset for new message

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
      let receivedGenerationId: string | undefined = undefined;
      let receivedPresets: Record<string, string> = {};
      let receivedSocialContent: SocialContent | null = null;
      let receivedSuggestedQuestions: string[] | undefined = undefined;

      await chatApi.sendMessageStream(
        {
          message: content.trim(),
          session_id: sessionId || undefined,
          attachments: attachmentIds.length > 0 ? attachmentIds : undefined,
          business_context: businessContext,
          model: model,
          aspect_ratio: aspectRatio,
          image_style: imageStyle,
        },
        // onChunk
        (chunk) => {
          fullResponse += chunk;
          setStreamingContent(fullResponse);
        },
        // onDone
        (data) => {
          returnedSessionId = data.session_id || null;
          receivedSuggestedQuestions = data.suggested_questions;
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
          hasLocalImagesRef.current = true; // block sync effect overwrite
          setPendingImages(images);
          setImageStatus('complete');
          console.log(`[useChat] onImageReady: ${images.length} images, generation_id: ${generationId}, caption chars: ${socialContent?.caption?.length ?? 0}`);
          console.log('[useChat] onImageReady: first image url:', images[0]?.url?.slice(0, 80));
        },
      );

      console.log(`[useChat] Stream finished. receivedImages: ${receivedImages.length}, fullResponse length: ${fullResponse.length}`);

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
        suggested_questions: receivedSuggestedQuestions,
      };

      console.log(`[useChat] assistantMessage built. id: ${assistantMessage.id}, has images: ${!!assistantMessage.images}, count: ${assistantMessage.images?.length ?? 0}`);

      setMessages(prev => {
        const next = [...prev, assistantMessage];
        console.log(`[useChat] setMessages called. total messages: ${next.length}, last has images: ${!!next[next.length - 1]?.images}`);
        return next;
      });
      setStreamingContent('');
      setPendingFiles([]);

      setTimeout(() => {
        // Always refresh the sessions list (sidebar titles)
        if (returnedSessionId) queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
        // Only refetch messages when NO images were received — if images came through the
        // stream they are already in local state and a refetch would overwrite them before
        // the backend has persisted image_data (race condition).
        if (receivedImages.length === 0) {
          queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
        } else {
          console.log('[useChat] Skipping chat-messages invalidation — images are in local state');
          // After a longer delay, allow the sync effect to re-run (backend should have persisted by then)
          setTimeout(() => {
            console.log('[useChat] Releasing hasLocalImagesRef guard after 10s');
            hasLocalImagesRef.current = false;
          }, 10000);
        }
      }, 800);

      return returnedSessionId || sessionId;

    } catch (err) {
      console.error('[useChat] sendMessage error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return null;
    } finally {
      console.log('[useChat] finally block: setIsStreaming(false)');
      setIsStreaming(false);
      // Note: intentionally NOT clearing imageStatus here so 'complete' badge remains visible
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
