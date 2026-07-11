import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Mic, PhoneCall, PhoneOff } from 'lucide-react';
import { env } from '../../config/env';
import { getAuthTokenAsync } from '../../utils/sessionUtils';

type TranscriptEntry = { role: 'user' | 'assistant'; text: string };
type CallState = 'idle' | 'connecting' | 'live' | 'ended' | 'error';

const OUTPUT_RATE = 24000; // agent TTS PCM16 sample rate from the gateway

// Served from public/ as a same-origin static file so it passes the
// script-src 'self' CSP (blob: worklet URLs are blocked).
const WORKLET_URL = '/pcm-downsampler-worklet.js';

const buildWsUrl = (token: string) => {
  const base = env.API_URL.replace(/^http/, 'ws').replace(/\/$/, '');
  return `${base}/web-call/stream?token=${encodeURIComponent(token)}`;
};

export const WebCallPreview: React.FC = () => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextPlayTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const liveRef = useRef(false);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setCallState('ended');
  }, [teardown]);

  const startCall = useCallback(async () => {
    setErrorMsg('');
    setTranscript([]);
    setCallState('connecting');

    try {
      const token = await getAuthTokenAsync();
      if (!token) throw new Error('Not signed in. Refresh the page and try again.');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      await ctx.resume();

      await ctx.audioWorklet.addModule(WORKLET_URL);

      const ws = new WebSocket(buildWsUrl(token));
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
        // Worklet output is not routed to speakers — it only feeds the socket.
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
              setErrorMsg(msg.message || 'The preview call failed.');
              teardown();
              setCallState('error');
              break;
          }
        } catch { /* ignore malformed frames */ }
      };

      ws.onclose = () => {
        if (liveRef.current) {
          endCall();
        } else if (wsRef.current === ws) {
          // Closed before "ready" — auth failure, usage limit, or agent init error.
          setErrorMsg('Could not start the call. Please try again in a moment.');
          teardown();
          setCallState('error');
        }
      };

      ws.onerror = () => {
        setErrorMsg('Could not connect to the call service.');
        teardown();
        setCallState('error');
      };
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Microphone access failed.');
      teardown();
      setCallState('error');
    }
  }, [clearPlayback, endCall, playChunk, teardown]);

  const isBusy = callState === 'connecting';
  const isLive = callState === 'live';

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isLive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            <PhoneCall className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Call preview</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Talk to your AI agent in the browser — a real conversation, just like a phone call.
            </p>
          </div>
        </div>
        {isLive && (
          <span className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" />
            Live
          </span>
        )}
      </div>

      {(isLive || transcript.length > 0) && (
        <div className="scrollbar-hide mt-4 max-h-56 space-y-2 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3">
          {transcript.length === 0 && (
            <p className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Mic className="h-3.5 w-3.5" /> Say something — the agent is listening.
            </p>
          )}
          {transcript.map((entry, i) => (
            <div key={i} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs font-medium leading-5 ${entry.role === 'user'
                ? 'bg-cyan-600 text-white'
                : 'border border-slate-200 bg-white text-slate-800'
                }`}>
                {entry.text}
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      )}

      {errorMsg && <p className="mt-3 text-xs font-semibold text-rose-600">{errorMsg}</p>}
      {callState === 'ended' && !errorMsg && (
        <p className="mt-3 text-xs font-semibold text-slate-500">Call ended.</p>
      )}

      <button
        type="button"
        onClick={isLive || isBusy ? endCall : startCall}
        className={`mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${isLive || isBusy
          ? 'bg-rose-600 text-white hover:bg-rose-700'
          : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
      >
        {isBusy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Connecting…
          </>
        ) : isLive ? (
          <>
            <PhoneOff className="h-4 w-4" /> End call
          </>
        ) : (
          <>
            <PhoneCall className="h-4 w-4" /> Start test call
          </>
        )}
      </button>
      <p className="mt-2 text-center text-[11px] font-medium text-slate-400">
        Uses your saved voice settings — save changes first. Max 5 minutes.
      </p>
    </section>
  );
};
