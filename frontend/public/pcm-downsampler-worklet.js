// AudioWorklet used by the Settings > AI Voice web call preview.
// Downsamples mic input to 16kHz PCM16 and posts ~100ms chunks to the main
// thread, which forwards them over the call WebSocket. Served as a static
// file (not a blob URL) so it passes the site's script-src 'self' CSP.
class PCMDownsampler extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRate = 16000;
    this.pending = new Float32Array(0);
    this.outSamples = [];
    this.CHUNK = 1600; // 100ms at 16kHz
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (!channel) return true;

    const merged = new Float32Array(this.pending.length + channel.length);
    merged.set(this.pending);
    merged.set(channel, this.pending.length);

    const ratio = sampleRate / this.targetRate;
    const outLen = Math.floor((merged.length - 1) / ratio);
    if (outLen <= 0) {
      this.pending = merged;
      return true;
    }

    for (let i = 0; i < outLen; i++) {
      const pos = i * ratio;
      const i0 = Math.floor(pos);
      const frac = pos - i0;
      const sample = merged[i0] * (1 - frac) + merged[i0 + 1] * frac;
      const s = Math.max(-1, Math.min(1, sample));
      this.outSamples.push(s < 0 ? s * 0x8000 : s * 0x7fff);
    }
    this.pending = merged.slice(Math.floor(outLen * ratio));

    while (this.outSamples.length >= this.CHUNK) {
      const chunk = Int16Array.from(this.outSamples.splice(0, this.CHUNK));
      this.port.postMessage(chunk.buffer, [chunk.buffer]);
    }
    return true;
  }
}
registerProcessor('pcm-downsampler', PCMDownsampler);
