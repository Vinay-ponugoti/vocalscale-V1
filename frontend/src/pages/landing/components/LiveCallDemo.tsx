import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Mic, PhoneCall, PhoneOff, ShieldCheck } from 'lucide-react';
import { env } from '@/config/env';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import TurnstileWidget from '@/components/ui/TurnstileWidget';

type TranscriptEntry = { role: 'user' | 'assistant'; text: string };
type CallState = 'idle' | 'verifying' | 'connecting' | 'live' | 'ended' | 'error';
type CallAttempt = { controller: AbortController; connecting: boolean };

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

const OUTPUT_RATE = 24000; // agent TTS PCM16 sample rate from the gateway
const CONNECTION_TIMEOUT_MS = 30_000;
const VERIFICATION_TIMEOUT_MS = 60_000;

// Served from public/ as a same-origin static file so it passes the
// script-src 'self' CSP (blob: worklet URLs are blocked).
const WORKLET_URL = '/pcm-downsampler-worklet.js';

const apiBase = env.API_URL.replace(/\/$/, '');
const buildWsUrl = (token: string) =>
    `${apiBase.replace(/^http/, 'ws')}/web-call/demo-stream?token=${encodeURIComponent(token)}`;

export function LiveCallDemo({ onStart }: { onStart?: () => void }) {
    const [callState, setCallState] = useState<CallState>('idle');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
    const [verificationAttempt, setVerificationAttempt] = useState<CallAttempt | null>(null);

    const attemptRef = useRef<CallAttempt | null>(null);
    const mountedRef = useRef(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const workletRef = useRef<AudioWorkletNode | null>(null);
    const inputRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const nextPlayTimeRef = useRef(0);
    const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const liveRef = useRef(false);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [transcript]);

    const clearPlayback = useCallback(() => {
        activeSourcesRef.current.forEach((src) => {
            src.onended = null;
            try { src.stop(); } catch { /* already stopped */ }
            src.disconnect();
        });
        activeSourcesRef.current.clear();
        nextPlayTimeRef.current = 0;
    }, []);

    const playChunk = useCallback((data: ArrayBuffer, attempt: CallAttempt) => {
        const ctx = audioCtxRef.current;
        if (attemptRef.current !== attempt || attempt.controller.signal.aborted || !liveRef.current || !ctx || ctx.state === 'closed' || data.byteLength % 2 !== 0) return;

        const int16 = new Int16Array(data);
        if (int16.length === 0) return;

        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;

        const buffer = ctx.createBuffer(1, float32.length, OUTPUT_RATE);
        buffer.getChannelData(0).set(float32);

        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(ctx.destination);

        const startAt = Math.max(ctx.currentTime, nextPlayTimeRef.current);
        src.start(startAt);
        nextPlayTimeRef.current = startAt + buffer.duration;

        activeSourcesRef.current.add(src);
        src.onended = () => {
            if (attemptRef.current !== attempt || attempt.controller.signal.aborted) return;
            activeSourcesRef.current.delete(src);
            src.disconnect();
        };
    }, []);

    const teardown = useCallback(() => {
        const attempt = attemptRef.current;
        attemptRef.current = null;
        attempt?.controller.abort();
        liveRef.current = false;
        clearPlayback();

        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (countdownRef.current !== null) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }

        if (wsRef.current) {
            const ws = wsRef.current;
            wsRef.current = null;
            ws.onclose = null;
            ws.onmessage = null;
            ws.onopen = null;
            ws.onerror = null;
            if (ws.readyState === WebSocket.OPEN) {
                try { ws.send(JSON.stringify({ event: 'stop' })); } catch { /* closing */ }
            }
            try { ws.close(); } catch { /* already closing */ }
        }

        if (workletRef.current) {
            workletRef.current.port.onmessage = null;
            workletRef.current.port.close();
            workletRef.current.disconnect();
            workletRef.current = null;
        }
        inputRef.current?.disconnect();
        inputRef.current = null;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close().catch(() => undefined);
        }
        audioCtxRef.current = null;
    }, [clearPlayback]);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            teardown();
        };
    }, [teardown]);

    const endCall = useCallback(() => {
        if (!mountedRef.current) return;
        teardown();
        setSecondsLeft(null);
        setCallState('ended');
    }, [teardown]);

    const fail = useCallback((message: string) => {
        if (!mountedRef.current) return;
        teardown();
        setSecondsLeft(null);
        setErrorMsg(message);
        setCallState('error');
    }, [teardown]);

    const startCall = () => {
        if (!mountedRef.current || attemptRef.current) return;
        onStart?.();
        if (!mountedRef.current) return;
        trackEvent('live_demo_requested', { event_category: 'engagement' });
        setErrorMsg('');
        setTranscript([]);
        setSecondsLeft(null);
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia ||
            typeof AudioContext === 'undefined' || typeof AudioWorkletNode === 'undefined' ||
            !('audioWorklet' in AudioContext.prototype) || typeof WebSocket === 'undefined') {
            fail('Live calls need a supported browser with microphone and audio worklet access over HTTPS. Try an up-to-date Chrome, Edge, Firefox, or Safari.');
            return;
        }
        if (!TURNSTILE_SITE_KEY) {
            fail('The live demo is not available right now. Please try again later.');
            return;
        }
        const attempt: CallAttempt = { controller: new AbortController(), connecting: false };
        attemptRef.current = attempt;
        setVerificationAttempt(attempt);
        setCallState('verifying');
        timeoutRef.current = setTimeout(() => {
            if (attemptRef.current !== attempt || attempt.controller.signal.aborted) return;
            fail('Security verification timed out. Please try again.');
        }, VERIFICATION_TIMEOUT_MS);
    };

    const cancelCall = () => {
        teardown();
        setVerificationAttempt(null);
        setSecondsLeft(null);
        setCallState('idle');
    };

    const connectCall = useCallback(async (turnstileToken: string, attempt: CallAttempt) => {
        const isCurrent = () => attemptRef.current === attempt && !attempt.controller.signal.aborted;
        if (!isCurrent() || attempt.connecting) return;
        attempt.connecting = true;
        if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (isCurrent()) fail('Connecting took too long. Please check microphone permissions and try again.');
        }, CONNECTION_TIMEOUT_MS);
        setErrorMsg('');
        setTranscript([]);
        setCallState('connecting');

        try {
            const resp = await fetch(`${apiBase}/web-call/demo-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ turnstile_token: turnstileToken }),
                signal: attempt.controller.signal,
            });
            if (!isCurrent()) return;
            const data = await resp.json().catch(() => ({}));
            if (!isCurrent()) return;
            if (!resp.ok || typeof data?.token !== 'string' || !data.token) {
                fail(typeof data?.error === 'string' ? data.error : 'Could not start the demo. Please try again in a moment.');
                return;
            }

            const maxSeconds = typeof data.max_seconds === 'number' && Number.isFinite(data.max_seconds) && data.max_seconds > 0
                ? Math.max(1, Math.floor(data.max_seconds)) : 90;

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            });
            // getUserMedia cannot be aborted; release permission results arriving after cancellation.
            if (!isCurrent()) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }
            streamRef.current = stream;

            const ctx = new AudioContext();
            audioCtxRef.current = ctx;
            await ctx.resume();
            if (!isCurrent()) return;
            await ctx.audioWorklet.addModule(WORKLET_URL);
            if (!isCurrent()) return;

            const ws = new WebSocket(buildWsUrl(data.token));
            ws.binaryType = 'arraybuffer';
            wsRef.current = ws;

            ws.onopen = () => {
                if (!isCurrent() || inputRef.current) return;
                try {
                    const source = ctx.createMediaStreamSource(stream);
                    inputRef.current = source;
                    const worklet = new AudioWorkletNode(ctx, 'pcm-downsampler');
                    workletRef.current = worklet;
                    worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
                        if (!isCurrent() || !liveRef.current || ws.readyState !== WebSocket.OPEN) return;
                        try { ws.send(e.data); } catch {
                            fail('The demo connection was interrupted. Please try again.');
                        }
                    };
                    source.connect(worklet);
                    // Worklet output only feeds the socket, never the speakers.
                } catch {
                    if (isCurrent()) fail('Could not initialize microphone audio. Please try another browser.');
                }
            };

            ws.onmessage = (e: MessageEvent) => {
                if (!isCurrent()) return;
                if (typeof e.data !== 'string') {
                    if (e.data instanceof ArrayBuffer) playChunk(e.data, attempt);
                    return;
                }
                try {
                    const msg = JSON.parse(e.data);
                    switch (msg.type) {
                        case 'ready': {
                            if (liveRef.current) return;
                            if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
                            timeoutRef.current = null;
                            liveRef.current = true;
                            setCallState('live');
                            setSecondsLeft(maxSeconds);
                            const endsAt = Date.now() + maxSeconds * 1000;
                            countdownRef.current = setInterval(() => {
                                if (!isCurrent()) return;
                                const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
                                if (remaining === 0) endCall();
                                else setSecondsLeft(remaining);
                            }, 1000);
                            trackEvent('live_demo_start', { event_category: 'engagement' });
                            break;
                        }
                        case 'transcript':
                            if (typeof msg.text === 'string' && msg.text.trim()) {
                                setTranscript((prev) => [...prev, { role: msg.role === 'user' ? 'user' : 'assistant', text: msg.text }]);
                            }
                            break;
                        case 'clear':
                            clearPlayback();
                            break;
                        case 'ended':
                            endCall();
                            break;
                        case 'error':
                            fail(typeof msg.message === 'string' ? msg.message : 'The demo call failed.');
                            break;
                    }
                } catch { /* ignore malformed frames */ }
            };

            ws.onclose = () => {
                if (!isCurrent()) return;
                if (liveRef.current) {
                    endCall();
                } else if (wsRef.current === ws) {
                    fail('Could not start the demo call. Please try again in a moment.');
                }
            };

            ws.onerror = () => {
                if (!isCurrent()) return;
                fail('Could not connect to the demo. Please try again.');
            };
        } catch (err) {
            if (!isCurrent()) return;
            fail(err instanceof Error && err.name === 'NotAllowedError'
                ? 'Microphone access is needed for the live demo. Allow it and try again.'
                : err instanceof Error && (err.name === 'NotFoundError' || err.name === 'NotReadableError')
                    ? 'No available microphone was found. Check your microphone and browser settings, then try again.'
                    : 'Could not connect the demo. Check your connection and browser audio support, then try again.');
        }
    }, [clearPlayback, endCall, fail, playChunk]);

    const isLive = callState === 'live';
    const statusText = {
        idle: 'Live demo ready to start.',
        verifying: 'Verifying security check.',
        connecting: 'Connecting demo call. Allow microphone access if prompted.',
        live: 'Call connected. The agent is listening.',
        ended: 'Demo call ended.',
        error: 'Demo call could not continue.',
    }[callState];

    return (
        <div className="relative">
            <div role="status" aria-atomic="true" className="sr-only">{statusText}</div>
            {/* Status bar */}
            <div className="mb-3 flex items-center justify-end gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                {isLive && secondsLeft !== null ? (
                    <span role="timer" aria-label="Time remaining" className={cn('font-black tabular-nums', secondsLeft <= 15 ? 'text-rose-700' : 'text-slate-600')}>
                        {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')} left
                    </span>
                ) : (
                    <>
                        <span className="relative flex h-2 w-2">
                            <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-75', isLive ? 'animate-ping bg-green-400' : 'bg-slate-300')} />
                            <span className={cn('relative inline-flex rounded-full h-2 w-2', isLive ? 'bg-green-500' : 'bg-slate-400')} />
                        </span>
                        Live Demo
                    </>
                )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                {callState === 'idle' && (
                    <div className="flex flex-col items-center text-center py-6">
                        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                            <Mic className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Talk to our AI right now</h3>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-xs mb-6">
                            Have a real conversation with the same AI receptionist your callers would hear — right from your browser.
                        </p>
                        <button
                            type="button"
                            onClick={startCall}
                            className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-black transition-all active:scale-95 shadow-xl shadow-blue-500/20 flex items-center gap-2"
                        >
                            <PhoneCall className="w-4 h-4" />
                            Start Live Call
                        </button>
                        <p className="mt-4 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Uses your microphone for a live AI conversation
                        </p>
                    </div>
                )}

                {callState === 'verifying' && (
                    <div className="flex flex-col items-center text-center py-6">
                        <p className="text-sm font-semibold text-slate-600 mb-2">Quick security check…</p>
                        {TURNSTILE_SITE_KEY && verificationAttempt && (
                            <TurnstileWidget
                                siteKey={TURNSTILE_SITE_KEY}
                                onVerify={(token) => void connectCall(token, verificationAttempt)}
                                onError={() => {
                                    if (attemptRef.current !== verificationAttempt || verificationAttempt.controller.signal.aborted || verificationAttempt.connecting) return;
                                    fail('Security verification failed. Please try again.');
                                }}
                                onExpire={() => {
                                    if (attemptRef.current !== verificationAttempt || verificationAttempt.controller.signal.aborted || verificationAttempt.connecting) return;
                                    fail('Security verification expired. Please try again.');
                                }}
                            />
                        )}
                        <button
                            type="button"
                            onClick={cancelCall}
                            className="mt-2 min-h-11 px-4 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {callState === 'connecting' && (
                    <div className="flex flex-col items-center text-center py-10">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                        <p className="text-sm font-bold text-slate-700">Connecting your call…</p>
                        <p className="text-sm font-medium text-slate-600 mt-1">Allow microphone access if prompted</p>
                        <button type="button" onClick={cancelCall} className="mt-4 min-h-11 px-4 text-sm font-bold text-slate-600 hover:text-slate-900">
                            Cancel
                        </button>
                    </div>
                )}

                {(isLive || callState === 'ended' || callState === 'error') && (
                    <div>
                        <div role="log" aria-label="Live call transcript" aria-live="polite" aria-relevant="additions" tabIndex={0} className="scrollbar-hide max-h-64 min-h-[10rem] space-y-3 overflow-y-auto pr-1">
                            {transcript.length === 0 && isLive && (
                                <p className="flex items-center gap-2 text-sm font-semibold text-slate-600 pt-2">
                                    <Mic className="h-3.5 w-3.5 animate-pulse" /> Say hello — the agent is listening.
                                </p>
                            )}
                            {transcript.map((entry, i) => (
                                <div key={i} className={cn('flex', entry.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    <div className={cn(
                                        'max-w-[85%] break-words rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed',
                                        entry.role === 'user'
                                            ? 'bg-slate-100 border border-slate-200 text-slate-700 rounded-tr-none'
                                            : 'bg-blue-600 text-white rounded-tl-none shadow-lg shadow-blue-500/20'
                                    )}>
                                        <span className="sr-only">{entry.role === 'user' ? 'You' : 'AI receptionist'}: </span>{entry.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={transcriptEndRef} />
                        </div>

                        {errorMsg && <p role="alert" className="mt-4 text-sm font-semibold text-rose-700">{errorMsg}</p>}
                        {callState === 'ended' && !errorMsg && (
                            <p className="mt-4 text-sm font-semibold text-slate-600">
                                Call ended. Imagine this answering every call to your business — 24/7.
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={isLive ? endCall : startCall}
                            className={cn(
                                'mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-black transition-all active:scale-95',
                                isLive
                                    ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-xl shadow-rose-500/20'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                            )}
                        >
                            {isLive ? (<><PhoneOff className="w-4 h-4" /> End Call</>) : (<><PhoneCall className="w-4 h-4" /> Talk to our AI</>)}
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}
