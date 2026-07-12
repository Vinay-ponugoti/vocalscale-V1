import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Mic, PhoneCall, PhoneOff, ShieldCheck } from 'lucide-react';
import { env } from '@/config/env';
import { cn } from '@/lib/utils';
import TurnstileWidget from '@/components/ui/TurnstileWidget';

type TranscriptEntry = { role: 'user' | 'assistant'; text: string };
type CallState = 'idle' | 'verifying' | 'connecting' | 'live' | 'ended' | 'error';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

const OUTPUT_RATE = 24000; // agent TTS PCM16 sample rate from the gateway

// Served from public/ as a same-origin static file so it passes the
// script-src 'self' CSP (blob: worklet URLs are blocked).
const WORKLET_URL = '/pcm-downsampler-worklet.js';

const apiBase = env.API_URL.replace(/\/$/, '');
const buildWsUrl = (token: string) =>
    `${apiBase.replace(/^http/, 'ws')}/web-call/demo-stream?token=${encodeURIComponent(token)}`;

export function LiveCallDemo() {
    const [callState, setCallState] = useState<CallState>('idle');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

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
            try { src.stop(); } catch { /* already stopped */ }
        });
        activeSourcesRef.current.clear();
        nextPlayTimeRef.current = 0;
    }, []);

    const playChunk = useCallback((data: ArrayBuffer) => {
        const ctx = audioCtxRef.current;
        if (!ctx || ctx.state === 'closed') return;

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
        src.onended = () => activeSourcesRef.current.delete(src);
    }, []);

    const teardown = useCallback(() => {
        liveRef.current = false;
        clearPlayback();

        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }

        if (wsRef.current) {
            const ws = wsRef.current;
            wsRef.current = null;
            ws.onclose = null;
            ws.onmessage = null;
            if (ws.readyState === WebSocket.OPEN) {
                try { ws.send(JSON.stringify({ event: 'stop' })); } catch { /* closing */ }
            }
            ws.close();
        }

        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close().catch(() => undefined);
        }
        audioCtxRef.current = null;
    }, [clearPlayback]);

    useEffect(() => () => teardown(), [teardown]);

    const endCall = useCallback(() => {
        teardown();
        setSecondsLeft(null);
        setCallState('ended');
    }, [teardown]);

    const fail = useCallback((message: string) => {
        teardown();
        setSecondsLeft(null);
        setErrorMsg(message);
        setCallState('error');
    }, [teardown]);

    const connectCall = useCallback(async (turnstileToken: string) => {
        setErrorMsg('');
        setTranscript([]);
        setCallState('connecting');

        try {
            const resp = await fetch(`${apiBase}/web-call/demo-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ turnstile_token: turnstileToken }),
            });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok || !data.token) {
                fail(data.error || 'Could not start the demo. Please try again in a moment.');
                return;
            }

            const maxSeconds: number = typeof data.max_seconds === 'number' ? data.max_seconds : 90;

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            });
            streamRef.current = stream;

            const ctx = new AudioContext();
            audioCtxRef.current = ctx;
            await ctx.resume();
            await ctx.audioWorklet.addModule(WORKLET_URL);

            const ws = new WebSocket(buildWsUrl(data.token));
            ws.binaryType = 'arraybuffer';
            wsRef.current = ws;

            ws.onopen = () => {
                const source = ctx.createMediaStreamSource(stream);
                const worklet = new AudioWorkletNode(ctx, 'pcm-downsampler');
                worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
                    if (liveRef.current && ws.readyState === WebSocket.OPEN) {
                        ws.send(e.data);
                    }
                };
                source.connect(worklet);
                // Worklet output only feeds the socket — never the speakers.
            };

            ws.onmessage = (e: MessageEvent) => {
                if (typeof e.data !== 'string') {
                    playChunk(e.data as ArrayBuffer);
                    return;
                }
                try {
                    const msg = JSON.parse(e.data);
                    switch (msg.type) {
                        case 'ready':
                            liveRef.current = true;
                            setCallState('live');
                            setSecondsLeft(maxSeconds);
                            countdownRef.current = setInterval(() => {
                                setSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
                            }, 1000);
                            break;
                        case 'transcript':
                            setTranscript((prev) => [...prev, { role: msg.role === 'user' ? 'user' : 'assistant', text: msg.text }]);
                            break;
                        case 'clear':
                            clearPlayback();
                            break;
                        case 'ended':
                            endCall();
                            break;
                        case 'error':
                            fail(msg.message || 'The demo call failed.');
                            break;
                    }
                } catch { /* ignore malformed frames */ }
            };

            ws.onclose = () => {
                if (liveRef.current) {
                    endCall();
                } else if (wsRef.current === ws) {
                    fail('Could not start the demo call. Please try again in a moment.');
                }
            };

            ws.onerror = () => {
                fail('Could not connect to the demo. Please try again.');
            };
        } catch (err) {
            fail(err instanceof Error && err.name === 'NotAllowedError'
                ? 'Microphone access is needed for the live demo. Allow it and try again.'
                : 'Could not access your microphone. Check your browser settings and try again.');
        }
    }, [clearPlayback, endCall, fail, playChunk]);

    const isLive = callState === 'live';
    const isBusy = callState === 'connecting' || callState === 'verifying';

    return (
        <div className="relative">
            {/* Status bar */}
            <div className="absolute -top-8 right-0 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isLive && secondsLeft !== null ? (
                    <span className={cn('font-black tabular-nums', secondsLeft <= 15 ? 'text-rose-500' : 'text-slate-500')}>
                        0:{String(Math.max(secondsLeft, 0)).padStart(2, '0')} left
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
                        <h4 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Talk to our AI right now</h4>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-xs mb-6">
                            Have a real conversation with the same AI receptionist your callers would hear — right from your browser.
                        </p>
                        <button
                            type="button"
                            onClick={() => setCallState('verifying')}
                            className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-black transition-all active:scale-95 shadow-xl shadow-blue-500/20 flex items-center gap-2"
                        >
                            <PhoneCall className="w-4 h-4" />
                            Start Live Call
                        </button>
                        <p className="mt-4 text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Uses your microphone · Nothing is recorded
                        </p>
                    </div>
                )}

                {callState === 'verifying' && (
                    <div className="flex flex-col items-center text-center py-6">
                        <p className="text-sm font-semibold text-slate-600 mb-2">Quick security check…</p>
                        {TURNSTILE_SITE_KEY ? (
                            <TurnstileWidget
                                siteKey={TURNSTILE_SITE_KEY}
                                onVerify={(token) => connectCall(token)}
                                onError={() => fail('Security verification failed. Please refresh and try again.')}
                            />
                        ) : (
                            <p className="text-xs font-semibold text-rose-600">The live demo is not available right now.</p>
                        )}
                        <button
                            type="button"
                            onClick={() => setCallState('idle')}
                            className="mt-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {callState === 'connecting' && (
                    <div className="flex flex-col items-center text-center py-10">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                        <p className="text-sm font-bold text-slate-700">Connecting your call…</p>
                        <p className="text-xs font-medium text-slate-400 mt-1">Allow microphone access if prompted</p>
                    </div>
                )}

                {(isLive || callState === 'ended' || callState === 'error') && (
                    <div>
                        <div className="scrollbar-hide max-h-64 min-h-[10rem] space-y-3 overflow-y-auto pr-1">
                            {transcript.length === 0 && isLive && (
                                <p className="flex items-center gap-2 text-xs font-semibold text-slate-400 pt-2">
                                    <Mic className="h-3.5 w-3.5 animate-pulse" /> Say hello — the agent is listening.
                                </p>
                            )}
                            {transcript.map((entry, i) => (
                                <div key={i} className={cn('flex', entry.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    <div className={cn(
                                        'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed',
                                        entry.role === 'user'
                                            ? 'bg-slate-100 border border-slate-200 text-slate-700 rounded-tr-none'
                                            : 'bg-blue-600 text-white rounded-tl-none shadow-lg shadow-blue-500/20'
                                    )}>
                                        {entry.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={transcriptEndRef} />
                        </div>

                        {errorMsg && <p className="mt-4 text-xs font-bold text-rose-600">{errorMsg}</p>}
                        {callState === 'ended' && !errorMsg && (
                            <p className="mt-4 text-xs font-bold text-slate-500">
                                Call ended. Imagine this answering every call to your business — 24/7.
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={isLive ? endCall : () => { setTranscript([]); setErrorMsg(''); setCallState('verifying'); }}
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

            {isBusy && callState === 'connecting' && (
                <div className="sr-only" aria-live="polite">Connecting demo call</div>
            )}
        </div>
    );
}
