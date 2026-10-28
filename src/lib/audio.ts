"use client";

/**
 * Synthesizes a pleasant 5-star royal kitchen order chime via the Browser Web Audio API.
 * Requires zero external .mp3 assets.
 */
export function playRoyalKitchenChime(): void {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playNote = (
      freq: number,
      startTime: number,
      duration: number,
      peakGain: number
    ) => {
      const osc = ctx.createOscillator();
      const harmonic = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      harmonic.type = "triangle";
      harmonic.frequency.setValueAtTime(freq * 2, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      harmonic.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      harmonic.start(startTime);
      osc.stop(startTime + duration);
      harmonic.stop(startTime + duration);
    };

    // Royal two-tone bell chime: D5 (587.33 Hz) -> A5 (880 Hz) -> D6 (1174.66 Hz)
    playNote(587.33, now, 0.55, 0.18);
    playNote(880.0, now + 0.18, 0.7, 0.22);
    playNote(1174.66, now + 0.36, 0.95, 0.14);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1500);
  } catch {
    // Ignore audio autoplay blocks until user interacts
  }
}
