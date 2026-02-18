import { useState, useCallback, useRef } from 'react';

interface UseVoicePreviewReturn {
    isLoading: boolean;
    isPlaying: boolean;
    error: string | null;
    playVoice: (sampleUrl: string) => Promise<void>;
    stopVoice: () => void;
}

export const useVoicePreview = (): UseVoicePreviewReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentUrlRef = useRef<string | null>(null);

    const stopVoice = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        setIsPlaying(false);
        currentUrlRef.current = null;
    }, []);

    const playVoice = useCallback(async (sampleUrl: string) => {
        try {
            // If already playing this voice, stop it
            if (isPlaying && currentUrlRef.current === sampleUrl) {
                stopVoice();
                return;
            }

            // Stop any currently playing audio
            stopVoice();

            if (!sampleUrl) {
                setError('No sample URL provided');
                return;
            }

            setIsLoading(true);
            setError(null);
            currentUrlRef.current = sampleUrl;

            // Create and play audio from static URL
            const audio = new Audio(sampleUrl);
            audioRef.current = audio;

            audio.onloadeddata = () => {
                setIsLoading(false);
            };

            audio.onended = () => {
                setIsPlaying(false);
                currentUrlRef.current = null;
            };

            audio.onerror = () => {
                setError('Failed to load or play audio');
                setIsPlaying(false);
                setIsLoading(false);
                currentUrlRef.current = null;
            };

            await audio.play();
            setIsPlaying(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to play voice sample');
            setIsLoading(false);
            setIsPlaying(false);
            currentUrlRef.current = null;
        }
    }, [isPlaying, stopVoice]);

    return {
        isLoading,
        isPlaying,
        error,
        playVoice,
        stopVoice,
    };
};
