import { act, StrictMode } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type Verification = { onVerify: (token: string) => void; onError: () => void; onExpire: () => void };
const mocks = vi.hoisted(() => ({ trackEvent: vi.fn(), verification: null as Verification | null }));
vi.mock('@/lib/analytics', () => ({ trackEvent: mocks.trackEvent }));
vi.mock('@/config/env', () => ({ env: { API_URL: 'https://demo.invalid' } }));
vi.mock('@/components/ui/TurnstileWidget', () => ({
    default: (props: Verification) => {
        mocks.verification = props;
        return <div>Mock security check</div>;
    },
}));

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
}

class MockSocket {
    static OPEN = 1;
    static instances: MockSocket[] = [];
    readyState = 0;
    binaryType = '';
    onopen: (() => void) | null = null;
    onmessage: ((event: { data: string | ArrayBuffer }) => void) | null = null;
    onclose: (() => void) | null = null;
    onerror: (() => void) | null = null;
    send = vi.fn();
    close = vi.fn(() => { this.readyState = 3; });
    url: string;
    constructor(url: string) { this.url = url; MockSocket.instances.push(this); }
    open() { this.readyState = 1; this.onopen?.(); }
    message(data: object) { this.onmessage?.({ data: JSON.stringify(data) }); }
}

const resume = vi.fn();
const addModule = vi.fn();
const closeAudio = vi.fn();
const stopTrack = vi.fn();
const disconnectInput = vi.fn();
const createInput = vi.fn(() => ({ connect: vi.fn(), disconnect: disconnectInput }));
const createBuffer = vi.fn();
class MockAudioContext {
    state = 'running';
    resume = resume;
    close = closeAudio;
    createMediaStreamSource = createInput;
    createBuffer = createBuffer;
    get audioWorklet() { return { addModule }; }
}
class MockWorklet {
    static instances: MockWorklet[] = [];
    port = { onmessage: null as ((event: { data: ArrayBuffer }) => void) | null, close: vi.fn() };
    disconnect = vi.fn();
    constructor() { MockWorklet.instances.push(this); }
}

let LiveCallDemo: typeof import('./LiveCallDemo').LiveCallDemo;
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;
let getUserMedia: ReturnType<typeof vi.fn<MediaDevices['getUserMedia']>>;
const stream = { getTracks: () => [{ stop: stopTrack }] } as unknown as MediaStream;
const tokenResponse = (maxSeconds = 90) => ({
    ok: true,
    json: async () => ({ token: 'mock/token', max_seconds: maxSeconds }),
}) as Response;

const mountedViews = new Set<() => void>();
function render(element: ReactNode) {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    act(() => root.render(element));
    const unmount = () => {
        act(() => root.unmount());
        container.remove();
        mountedViews.delete(unmount);
    };
    mountedViews.add(unmount);
    return { unmount };
}
function clickButton(name: RegExp | string) {
    const button = Array.from(document.querySelectorAll('button')).find((button) =>
        typeof name === 'string' ? button.textContent.trim() === name : name.test(button.textContent));
    expect(button).toBeDefined();
    act(() => button!.click());
}

beforeAll(async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'test-only-site-key');
    ({ LiveCallDemo } = await import('./LiveCallDemo'));
});
afterAll(() => vi.unstubAllEnvs());
beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mocks.verification = null;
    MockSocket.instances = [];
    MockWorklet.instances = [];
    resume.mockResolvedValue(undefined);
    addModule.mockResolvedValue(undefined);
    closeAudio.mockResolvedValue(undefined);
    fetchMock = vi.fn<typeof fetch>().mockResolvedValue(tokenResponse());
    getUserMedia = vi.fn<MediaDevices['getUserMedia']>().mockResolvedValue(stream);
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('isSecureContext', true);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    vi.stubGlobal('AudioContext', MockAudioContext);
    vi.stubGlobal('AudioWorkletNode', MockWorklet);
    vi.stubGlobal('WebSocket', MockSocket);
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
});
afterEach(() => {
    mountedViews.forEach((unmount) => unmount());
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

function requestCall() {
    clickButton(/Start Live Call|Talk to our AI/);
    return mocks.verification!;
}
async function verify(verification = mocks.verification!) {
    await act(async () => { verification.onVerify('mock-verification'); });
}
async function connect() {
    requestCall();
    await verify();
    const socket = MockSocket.instances[0];
    act(() => socket.open());
    return socket;
}

describe('LiveCallDemo', () => {
    it('requires an explicit click and invokes onStart before verification or network access', async () => {
        const onStart = vi.fn(() => {
            expect(fetchMock).not.toHaveBeenCalled();
            expect(mocks.verification).toBeNull();
        });
        render(<StrictMode><LiveCallDemo onStart={onStart} /></StrictMode>);
        expect(fetchMock).not.toHaveBeenCalled();
        expect(getUserMedia).not.toHaveBeenCalled();
        expect(MockSocket.instances).toHaveLength(0);
        requestCall();
        expect(onStart).toHaveBeenCalledOnce();
        expect(mocks.trackEvent).toHaveBeenCalledWith('live_demo_requested', { event_category: 'engagement' });
        const verification = mocks.verification!;
        await act(async () => {
            verification.onVerify('mock-verification');
            verification.onVerify('duplicate');
        });
        expect(fetchMock).toHaveBeenCalledOnce();
        expect(fetchMock).toHaveBeenCalledWith('https://demo.invalid/web-call/demo-token', expect.objectContaining({
            method: 'POST', body: JSON.stringify({ turnstile_token: 'mock-verification' }), signal: expect.any(AbortSignal),
        }));
        expect(addModule).toHaveBeenCalledWith('/pcm-downsampler-worklet.js');
        expect(MockSocket.instances[0].url).toBe('wss://demo.invalid/web-call/demo-stream?token=mock%2Ftoken');
        expect(mocks.trackEvent).not.toHaveBeenCalledWith('live_demo_start', expect.anything());
    });

    it('ignores old verification callbacks after cancellation and a new request', async () => {
        render(<LiveCallDemo />);
        const old = requestCall();
        clickButton('Cancel');
        requestCall();
        await act(async () => { old.onVerify('stale'); old.onError(); old.onExpire(); });
        expect(fetchMock).not.toHaveBeenCalled();
        expect(document.querySelector('[role="status"]')).toHaveTextContent('Verifying');
        await verify();
        expect(fetchMock).toHaveBeenCalledOnce();
    });

    it('aborts a pending token request and ignores its late response', async () => {
        const pending = deferred<Response>();
        fetchMock.mockReturnValueOnce(pending.promise);
        render(<LiveCallDemo />);
        requestCall();
        await verify();
        const signal = fetchMock.mock.calls[0][1]!.signal!;
        clickButton('Cancel');
        expect(signal.aborted).toBe(true);
        requestCall();
        await act(async () => pending.resolve(tokenResponse()));
        expect(getUserMedia).not.toHaveBeenCalled();
        expect(document.querySelector('[role="status"]')).toHaveTextContent('Verifying');
    });

    it('ignores a token body that resolves after unmount', async () => {
        const body = deferred<object>();
        fetchMock.mockResolvedValueOnce({ ok: true, json: () => body.promise } as Response);
        const view = render(<LiveCallDemo />);
        requestCall();
        await verify();
        view.unmount();
        await act(async () => body.resolve({ token: 'late-token' }));
        expect(getUserMedia).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });

    it.each(['cancel', 'unmount', 'timeout'])('stops a late microphone stream after %s', async (action) => {
        const pending = deferred<MediaStream>();
        getUserMedia.mockReturnValueOnce(pending.promise);
        const view = render(<LiveCallDemo />);
        requestCall();
        await verify();
        if (action === 'cancel') clickButton('Cancel');
        else if (action === 'unmount') view.unmount();
        else act(() => vi.advanceTimersByTime(30_000));
        await act(async () => pending.resolve(stream));
        expect(stopTrack).toHaveBeenCalledOnce();
        expect(resume).not.toHaveBeenCalled();
        expect(MockSocket.instances).toHaveLength(0);
    });

    it.each(['resume', 'worklet'])('ignores late audio %s initialization after cancellation', async (stage) => {
        const pending = deferred<void>();
        (stage === 'resume' ? resume : addModule).mockReturnValueOnce(pending.promise);
        render(<LiveCallDemo />);
        requestCall();
        await verify();
        clickButton('Cancel');
        await act(async () => pending.resolve(undefined));
        expect(closeAudio).toHaveBeenCalledOnce();
        expect(stopTrack).toHaveBeenCalledOnce();
        expect(MockSocket.instances).toHaveLength(0);
        if (stage === 'resume') expect(addModule).not.toHaveBeenCalled();
    });

    it('times out verification and connections that never become ready', async () => {
        render(<LiveCallDemo />);
        requestCall();
        act(() => vi.advanceTimersByTime(60_000));
        expect(document.querySelector('[role="alert"]')).toHaveTextContent('Security verification timed out');
        expect(fetchMock).not.toHaveBeenCalled();
        const socket = await connect();
        act(() => vi.advanceTimersByTime(30_000));
        expect(document.querySelector('[role="alert"]')).toHaveTextContent('Connecting took too long');
        expect(socket.close).toHaveBeenCalledOnce();
        expect(stopTrack).toHaveBeenCalledOnce();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('tracks ready once, formats mm:ss, and ends locally without a gateway ended frame', async () => {
        render(<LiveCallDemo />);
        const socket = await connect();
        act(() => { socket.message({ type: 'ready' }); socket.message({ type: 'ready' }); });
        expect(document.querySelector('[role="timer"]')).toHaveTextContent('01:30 left');
        expect(mocks.trackEvent.mock.calls.filter(([event]) => event === 'live_demo_start')).toHaveLength(1);
        expect(vi.getTimerCount()).toBe(1);
        act(() => vi.advanceTimersByTime(31_000));
        expect(document.querySelector('[role="timer"]')).toHaveTextContent('00:59 left');
        act(() => vi.advanceTimersByTime(59_000));
        expect(document.querySelector('[role="status"]')).toHaveTextContent('Demo call ended');
        expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ event: 'stop' }));
        expect(socket.close).toHaveBeenCalledOnce();
        expect(stopTrack).toHaveBeenCalledOnce();
        expect(vi.getTimerCount()).toBe(0);
    });

    it.each(['cancel', 'unmount'])('guards retained socket and worklet callbacks after %s', async (action) => {
        const view = render(<LiveCallDemo />);
        const socket = await connect();
        const oldOpen = socket.onopen!;
        const oldMessage = socket.onmessage!;
        const oldError = socket.onerror!;
        const oldClose = socket.onclose!;
        const worklet = MockWorklet.instances[0];
        const oldAudio = worklet.port.onmessage!;
        if (action === 'cancel') {
            clickButton('Cancel');
            requestCall();
        } else view.unmount();
        const sendsAfterTeardown = socket.send.mock.calls.length;
        act(() => {
            oldOpen();
            oldMessage({ data: JSON.stringify({ type: 'ready' }) });
            oldMessage({ data: JSON.stringify({ type: 'transcript', text: 'stale transcript' }) });
            oldMessage({ data: new ArrayBuffer(4) });
            oldError();
            oldClose();
            oldAudio({ data: new ArrayBuffer(4) });
        });
        expect(createInput).toHaveBeenCalledOnce();
        expect(createBuffer).not.toHaveBeenCalled();
        expect(socket.send).toHaveBeenCalledTimes(sendsAfterTeardown);
        expect(worklet.port.close).toHaveBeenCalledOnce();
        expect(worklet.disconnect).toHaveBeenCalledOnce();
        expect(disconnectInput).toHaveBeenCalledOnce();
        expect(socket.onopen).toBeNull();
        expect(socket.onerror).toBeNull();
        expect(socket.onmessage).toBeNull();
        expect(socket.onclose).toBeNull();
        expect(mocks.trackEvent.mock.calls.filter(([event]) => event === 'live_demo_start')).toHaveLength(0);
        if (action === 'cancel') expect(document.querySelector('[role="status"]')).toHaveTextContent('Verifying');
    });

    it('sends microphone PCM only when live and exposes transcript speakers and errors', async () => {
        render(<LiveCallDemo />);
        const socket = await connect();
        const audio = new ArrayBuffer(4);
        act(() => MockWorklet.instances[0].port.onmessage?.({ data: audio }));
        expect(socket.send).not.toHaveBeenCalled();
        act(() => {
            socket.message({ type: 'ready' });
            MockWorklet.instances[0].port.onmessage?.({ data: audio });
            socket.message({ type: 'transcript', role: 'user', text: 'Hello' });
            socket.message({ type: 'transcript', role: 'assistant', text: 'How can I help?' });
            socket.message({ type: 'transcript', text: { invalid: true } });
        });
        expect(socket.send).toHaveBeenCalledWith(audio);
        const log = document.querySelector('[role="log"]');
        expect(log).toHaveAccessibleName('Live call transcript');
        expect(log).toHaveAttribute('aria-live', 'polite');
        expect(log).toHaveTextContent('You: Hello');
        expect(log).toHaveTextContent('AI receptionist: How can I help?');
        act(() => socket.message({ type: 'error', message: 'Gateway unavailable' }));
        expect(document.querySelector('[role="alert"]')).toHaveTextContent('Gateway unavailable');
        expect(vi.getTimerCount()).toBe(0);
    });

    it.each(['insecure', 'no microphone API', 'no audio worklet'])('handles an unsupported browser: %s', (reason) => {
        if (reason === 'insecure') vi.stubGlobal('isSecureContext', false);
        else if (reason === 'no microphone API') vi.stubGlobal('navigator', {});
        else vi.stubGlobal('AudioWorkletNode', undefined);
        render(<LiveCallDemo />);
        requestCall();
        expect(document.querySelector('[role="alert"]')).toHaveTextContent('supported browser');
        expect(fetchMock).not.toHaveBeenCalled();
        expect(getUserMedia).not.toHaveBeenCalled();
    });
});
