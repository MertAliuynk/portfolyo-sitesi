let audioCtx: AudioContext | null = null;

/** Tiny, dependency-free feedback beep — no audio assets needed. */
export function beep(frequency: number, duration = 0.15) {
  if (typeof window === "undefined") return;
  // browsers block audio before the first click/tap — stay quiet until then
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
    return;
  }

  try {
    audioCtx ??= new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.16, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + duration,
    );

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // Audio isn't critical to gameplay — fail silently.
  }
}
