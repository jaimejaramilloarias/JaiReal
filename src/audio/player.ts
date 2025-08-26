import type { Chart } from '../core/model';

let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!audioCtx) {
    if (typeof window === 'undefined') {
      throw new Error('Web Audio API no disponible');
    }
    const AC = (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext) as typeof AudioContext;
    audioCtx = new AC();
  }
  return audioCtx;
}

const noteFreq: Record<string, number> = {
  C: 261.63,
  'C#': 277.18,
  Db: 277.18,
  D: 293.66,
  'D#': 311.13,
  Eb: 311.13,
  E: 329.63,
  F: 349.23,
  'F#': 369.99,
  Gb: 369.99,
  G: 392.0,
  'G#': 415.3,
  Ab: 415.3,
  A: 440.0,
  'A#': 466.16,
  Bb: 466.16,
  B: 493.88,
};

function parseChord(chord: string): number[] {
  const match = chord.match(/^([A-G](?:#|b)?)(.*)$/);
  if (!match) return [];
  const [, root, rest] = match;
  const base = noteFreq[root];
  if (!base) return [];
  const intervals: number[] = [0];
  const minor = /^m(?!aj)/i.test(rest);
  intervals.push(minor ? 3 : 4); // third
  intervals.push(7); // fifth
  if (/7/.test(rest)) intervals.push(10); // seventh
  return intervals.map((i) => base * 2 ** (i / 12));
}

function scheduleChord(freqs: number[], start: number, duration: number) {
  const ctx = getCtx();
  freqs.forEach((f) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime + start;
    const end = t + duration;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.5, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.start(t);
    osc.stop(end);
  });
}

function scheduleClick(start: number, accent: boolean) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = accent ? 1000 : 800;
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  const t = ctx.currentTime + start;
  const end = t + 0.05;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(accent ? 0.7 : 0.5, t + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  osc.start(t);
  osc.stop(end);
}

export function playChart(chart: Chart, tempo = 120) {
  const ctx = getCtx();
  if (ctx.state === 'suspended') void ctx.resume();
  const beatDur = 60 / tempo;
  let time = 0;
  chart.sections.forEach((section) => {
    section.measures.forEach((m) => {
      m.beats.forEach((b, i) => {
        scheduleClick(time, i === 0);
        if (b.chord) {
          const freqs = parseChord(b.chord);
          if (freqs.length) scheduleChord(freqs, time, beatDur);
        }
        time += beatDur;
      });
    });
  });
}

export function stopPlayback() {
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
}
