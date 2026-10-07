"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Soft, rain-like ambience synthesised on the fly: looped brown noise
 * through a low-pass filter with a slow "gust" LFO. No audio files.
 */
export function useRainSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [playing, setPlaying] = useState(false);

  const start = useCallback(() => {
    if (!ctxRef.current) {
      const ctx = new AudioContext();
      const seconds = 4;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1100;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 350;
      lfo.connect(lfoDepth).connect(filter.frequency);

      const gain = ctx.createGain();
      gain.gain.value = 0;

      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      lfo.start();

      ctxRef.current = ctx;
      gainRef.current = gain;
    }

    const ctx = ctxRef.current;
    const gain = gainRef.current!;
    void ctx.resume();
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setTargetAtTime(0.5, ctx.currentTime, 1.2);
    setPlaying(true);
  }, []);

  const stop = useCallback(() => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
    setPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      void ctxRef.current?.close();
    };
  }, []);

  return { playing, toggle: playing ? stop : start };
}
