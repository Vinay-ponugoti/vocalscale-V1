import { useState, useRef, useEffect } from 'react';
import { supportApi } from '../api/support';
import { useAuth } from '../context/AuthContext';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export function useSupportChat() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Initial greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    role: 'system',
                    content: 'Hi there! I am the VocalScale Support Bot. How can I help you today?',
                    timestamp: Date.now()
                }
            ]);
        }
    }, [isOpen]);

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        const userMsg: ChatMessage = {
            role: 'user',
            content,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Prepare history for API (exclude system messages if backend doesn't support them, but our RAG does)
            // draft_generator expects: list of dicts { role, content }
            const history = messages
                .filter(m => m.role !== 'system')
                .map(m => ({ role: m.role, content: m.content }));

            history.push({ role: 'user', content });

            const response = await supportApi.sendSupportChat(
                content,
                history,
                {
                    name: user?.full_name,
                    email: user?.email
                }
            );

            const botMsg: ChatMessage = {
                role: 'assistant',
                content: response.draft, // The backend returns { draft: "..." }
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error('Support Chat Error:', error);
            setMessages(prev => [...prev, {
                role: 'system',
                content: 'Sorry, I encountered an error. Please try again later.',
                timestamp: Date.now()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        isLoading,
        sendMessage,
        isOpen,
        setIsOpen,
        setMessages // exposed for clearing chat
    };
}
