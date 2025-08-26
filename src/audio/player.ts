import type { Chart } from '../core/model';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let masterVolume = 1;
let loopTimeout: ReturnType<typeof setTimeout> | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    if (typeof window === 'undefined') {
      throw new Error('Web Audio API no disponible');
    }
    const AC = (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext) as typeof AudioContext;
    audioCtx = new AC();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = masterVolume;
    masterGain.connect(audioCtx.destination);
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

function scheduleChord(
  freqs: number[],
  start: number,
  duration: number,
  volume: number,
) {
  const ctx = getCtx();
  freqs.forEach((f) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGain ?? ctx.destination);
    const t = ctx.currentTime + start;
    const end = t + duration;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.5 * volume, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.start(t);
    osc.stop(end);
  });
}

export const internal = {
  scheduleClick(start: number, accent: boolean, volume = 1) {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = accent ? 1000 : 800;
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGain ?? ctx.destination);
    const t = ctx.currentTime + start;
    const end = t + 0.05;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(
      (accent ? 0.7 : 0.5) * volume,
      t + 0.001,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.start(t);
    osc.stop(end);
  },
};

export function playChart(
  chart: Chart,
  tempo = 120,
  metronome = true,
  metronomeVolume = 1,
  chordVol = 1,
  countIn = 0,
) {
  const ctx = getCtx();
  if (ctx.state === 'suspended') void ctx.resume();
  const beatDur = 60 / tempo;
  let time = 0;
  for (let i = 0; i < countIn; i++) {
    if (metronome) internal.scheduleClick(time, i === 0, metronomeVolume);
    time += beatDur;
  }
  chart.sections.forEach((section) => {
    section.measures.forEach((m) => {
      m.beats.forEach((b, i) => {
        if (metronome) internal.scheduleClick(time, i === 0, metronomeVolume);
        if (b.chord) {
          const freqs = parseChord(b.chord);
          if (freqs.length) scheduleChord(freqs, time, beatDur, chordVol);
        }
        time += beatDur;
      });
    });
  });
}

export function playSectionLoop(
  chart: Chart,
  sectionIndex: number,
  tempo = 120,
  metronome = true,
  metronomeVolume = 1,
  chordVol = 1,
  countIn = 0,
) {
  const section = chart.sections[sectionIndex];
  if (!section) return;
  const subChart: Chart = {
    ...chart,
    sections: [section],
  };
  playChart(subChart, tempo, metronome, metronomeVolume, chordVol, countIn);
  const beats = section.measures.reduce((sum, m) => sum + m.beats.length, 0);
  const duration = (60 / tempo) * (beats + countIn);
  loopTimeout = setTimeout(
    () =>
      playSectionLoop(
        chart,
        sectionIndex,
        tempo,
        metronome,
        metronomeVolume,
        chordVol,
        0,
      ),
    duration * 1000,
  );
}

export function stopPlayback() {
  if (loopTimeout) {
    clearTimeout(loopTimeout);
    loopTimeout = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
    masterGain = null;
  }
}

export function isPlaying() {
  return audioCtx !== null;
}

export function setMasterVolume(vol: number) {
  masterVolume = vol;
  if (masterGain) masterGain.gain.value = vol;
}

export function getMasterVolume() {
  return masterVolume;
}
