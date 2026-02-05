/**
 * Chat hooks for Knowledge Chat feature
 * Handles streaming responses, session management, and file uploads
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chat';
import type { ChatMessage, FileAttachment, BusinessContext } from '../types/chat';
import type { Skill } from '../types/skills';
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
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

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
  }, [businessState.data]);

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

  // Sync fetched messages when they arrive
  useEffect(() => {
    // Only overwrite if we have fetched messages and we're not currently streaming
    // Crucially: Don't overwrite with empty list if we're in the middle of a session
    if (fetchedMessages && !isStreaming) {
      if (fetchedMessages.length > 0) {
        setMessages(fetchedMessages);
      } else if (messages.length > 0 && sessionId) {
        // If we have local messages but the server returned empty, 
        // it might be an indexing lag. Don't clear!
        console.warn('[useChat] Server returned 0 messages for active session. Possible indexing lag.');
      }
    }
  }, [fetchedMessages, isStreaming, messages.length, sessionId]);

  // Reset messages when session changes
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      setStreamingContent('');
      setError(null);
    }
  }, [sessionId]);

  /**
   * Send a message and handle streaming response
   * Note: User authentication is handled by the backend via JWT token
   */
  const sendMessage = useCallback(async (content: string): Promise<string | null> => {
    if (!content.trim() || isStreaming) return null;

    setError(null);

    // Create optimistic user message
    const tempId = `temp-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: tempId,
      session_id: sessionId || 'new',
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      attachments: pendingFiles.length > 0 ? [...pendingFiles] : undefined,
    };

    // Add user message immediately (optimistic UI)
    setMessages(prev => [...prev, userMessage]);
    setStreamingContent('');
    setIsStreaming(true);

    // Clear pending files
    const attachmentIds = pendingFiles.map(f => f.id);
    setPendingFiles([]);

    let newSessionId: string | null = null;
    let accumulatedContent = '';

    try {
      await chatApi.sendMessageStream(
        {
          message: content.trim(),
          session_id: sessionId || undefined,
          attachments: attachmentIds.length > 0 ? attachmentIds : undefined,
          skill_id: selectedSkill?.id || undefined,
          business_context: businessContext,
        },
        // On chunk
        (text) => {
          accumulatedContent += text;
          setStreamingContent(accumulatedContent);
        },
        // On done
        (returnedSessionId, sources) => {
          console.log('[useChat] SSE Done. Returned Session ID:', returnedSessionId);
          newSessionId = returnedSessionId;

          // Create assistant message with full content
          const assistantMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            session_id: returnedSessionId,
            role: 'assistant',
            content: accumulatedContent,
            timestamp: new Date().toISOString(),
            sources: sources.length > 0 ? sources : undefined,
          };

          setMessages(prev => {
            // Check if last message is already assistant and identical (prevent dupes)
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content === accumulatedContent) {
              return prev;
            }
            return [...prev, assistantMessage];
          });
          setStreamingContent('');
          setIsStreaming(false);

          // Update session ID ref if new session was created
          if (!sessionId && returnedSessionId) {
            currentSessionIdRef.current = returnedSessionId;
          }

          // Refresh sessions list
          queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
        },
        // On error
        (err) => {
          setError(err.message);
          setIsStreaming(false);
          setStreamingContent('');
        }
      );

      return newSessionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      setIsStreaming(false);
      setStreamingContent('');
      return null;
    }
  }, [sessionId, isStreaming, pendingFiles, selectedSkill, queryClient, businessContext]);

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
    selectedSkill,
    setSelectedSkill,
    sendMessage,
    uploadFile,
    removeFile,
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
