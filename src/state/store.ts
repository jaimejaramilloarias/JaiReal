import {
  type Chart,
  schemaVersion,
  type Measure,
  type Marker,
} from '../core/model';
import { transposeChord } from '../core/transpose';

type WaveType = 'sine' | 'square' | 'triangle' | 'sawtooth';

const STORAGE_KEY = 'jaireal.chart';
const SHOW_SECONDARY_KEY = 'jaireal.showSecondary';
const VIEW_KEY = 'jaireal.view';
const MANUAL_TRANSPOSE_KEY = 'jaireal.manualTranspose';
const TEMPO_KEY = 'jaireal.tempo';
const METRONOME_KEY = 'jaireal.metronome';
const METRONOME_VOLUME_KEY = 'jaireal.metronomeVolume';
const MASTER_VOLUME_KEY = 'jaireal.masterVolume';
const CHORD_VOLUME_KEY = 'jaireal.chordVolume';
const CHORD_WAVE_KEY = 'jaireal.chordWave';

type Instrument = 'C' | 'Bb' | 'Eb' | 'F';
const instrumentSemitones: Record<Instrument, number> = {
  C: 0,
  Bb: 2,
  Eb: 9,
  F: 7,
};

const demoChart = (): Chart => ({
  schemaVersion,
  title: 'Untitled',
  sections: [
    {
      name: 'A',
      measures: [
        { beats: [{ chord: '' }, { chord: '' }, { chord: '' }, { chord: '' }] },
      ],
    },
  ],
});

type Listener = () => void;

export class ChartStore {
  chart: Chart;
  showSecondary: boolean;
  instrument: Instrument;
  preferSharps: boolean;
  manualTranspose = 0;
  tempo: number;
  metronome: boolean;
  metronomeVolume: number;
  masterVolume: number;
  chordVolume: number;
  chordWave: WaveType;
  selectedSection: number | null = null;
  selectedMeasure: number | null = null;
  private listeners: Set<Listener> = new Set();
  private messageListeners: Set<(msg: string) => void> = new Set();

  constructor() {
    this.chart = this.loadChart();
    this.showSecondary = this.loadShowSecondary();
    const view = this.loadView();
    this.instrument = view.instrument;
    this.preferSharps = view.preferSharps;
    this.manualTranspose = this.loadManualTranspose();
    this.tempo = this.loadTempo();
    this.metronome = this.loadMetronome();
    this.metronomeVolume = this.loadMetronomeVolume();
    this.masterVolume = this.loadMasterVolume();
    this.chordVolume = this.loadChordVolume();
    this.chordWave = this.loadChordWave();
  }

  private loadChart(): Chart {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as Chart;
      }
    } catch {
      // ignore
    }
    return demoChart();
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.chart));
  }

  private loadShowSecondary(): boolean {
    try {
      const raw = localStorage.getItem(SHOW_SECONDARY_KEY);
      if (raw !== null) {
        return JSON.parse(raw) as boolean;
      }
    } catch {
      // ignore
    }
    return true;
  }

  private persistShowSecondary() {
    localStorage.setItem(
      SHOW_SECONDARY_KEY,
      JSON.stringify(this.showSecondary),
    );
  }

  private loadView(): { instrument: Instrument; preferSharps: boolean } {
    try {
      const raw = localStorage.getItem(VIEW_KEY);
      if (raw) {
        return JSON.parse(raw) as {
          instrument: Instrument;
          preferSharps: boolean;
        };
      }
    } catch {
      // ignore
    }
    return { instrument: 'C', preferSharps: true };
  }

  private persistView() {
    localStorage.setItem(
      VIEW_KEY,
      JSON.stringify({
        instrument: this.instrument,
        preferSharps: this.preferSharps,
      }),
    );
  }

  private loadTempo(): number {
    try {
      const raw = localStorage.getItem(TEMPO_KEY);
      if (raw) {
        return JSON.parse(raw) as number;
      }
    } catch {
      // ignore
    }
    return 120;
  }

  private persistTempo() {
    localStorage.setItem(TEMPO_KEY, JSON.stringify(this.tempo));
  }

  private loadManualTranspose(): number {
    try {
      const raw = localStorage.getItem(MANUAL_TRANSPOSE_KEY);
      if (raw) {
        return JSON.parse(raw) as number;
      }
    } catch {
      // ignore
    }
    return 0;
  }

  private persistManualTranspose() {
    localStorage.setItem(
      MANUAL_TRANSPOSE_KEY,
      JSON.stringify(this.manualTranspose),
    );
  }

  private loadMetronome(): boolean {
    try {
      const raw = localStorage.getItem(METRONOME_KEY);
      if (raw !== null) {
        return JSON.parse(raw) as boolean;
      }
    } catch {
      // ignore
    }
    return true;
  }

  private persistMetronome() {
    localStorage.setItem(METRONOME_KEY, JSON.stringify(this.metronome));
  }

  private loadMetronomeVolume(): number {
    try {
      const raw = localStorage.getItem(METRONOME_VOLUME_KEY);
      if (raw !== null) {
        return JSON.parse(raw) as number;
      }
    } catch {
      // ignore
    }
    return 1;
  }

  private loadMasterVolume(): number {
    try {
      const raw = localStorage.getItem(MASTER_VOLUME_KEY);
      if (raw !== null) {
        return JSON.parse(raw) as number;
      }
    } catch {
      // ignore
    }
    return 1;
  }

  private persistMasterVolume() {
    localStorage.setItem(MASTER_VOLUME_KEY, JSON.stringify(this.masterVolume));
  }

  private loadChordVolume(): number {
    try {
      const raw = localStorage.getItem(CHORD_VOLUME_KEY);
      if (raw !== null) {
        return JSON.parse(raw) as number;
      }
    } catch {
      // ignore
    }
    return 1;
  }

  private persistChordVolume() {
    localStorage.setItem(CHORD_VOLUME_KEY, JSON.stringify(this.chordVolume));
  }

  private loadChordWave(): WaveType {
    try {
      const raw = localStorage.getItem(CHORD_WAVE_KEY);
      if (raw) {
        return JSON.parse(raw) as WaveType;
      }
    } catch {
      // ignore
    }
    return 'sine';
  }

  private persistChordWave() {
    localStorage.setItem(CHORD_WAVE_KEY, JSON.stringify(this.chordWave));
  }

  private persistMetronomeVolume() {
    localStorage.setItem(
      METRONOME_VOLUME_KEY,
      JSON.stringify(this.metronomeVolume),
    );
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onMessage(listener: (msg: string) => void) {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  setChart(chart: Chart) {
    this.chart = chart;
    this.persist();
    this.listeners.forEach((l) => l());
  }

  selectMeasure(section: number | null, measure: number | null) {
    this.selectedSection = section;
    this.selectedMeasure = measure;
    this.listeners.forEach((l) => l());
  }

  updateSelectedMeasure(updater: (m: Measure) => void) {
    if (this.selectedSection === null || this.selectedMeasure === null) return;
    const section = this.chart.sections[this.selectedSection];
    const measure = section?.measures[this.selectedMeasure];
    if (measure) {
      updater(measure);
      this.setChart(this.chart);
    }
  }

  toggleSecondary() {
    this.showSecondary = !this.showSecondary;
    this.persistShowSecondary();
    this.listeners.forEach((l) => l());
  }

  toggleMetronome() {
    this.metronome = !this.metronome;
    this.persistMetronome();
    this.listeners.forEach((l) => l());
  }

  setMetronomeVolume(vol: number) {
    this.metronomeVolume = vol;
    this.persistMetronomeVolume();
    this.listeners.forEach((l) => l());
  }

  setMasterVolume(vol: number) {
    this.masterVolume = vol;
    this.persistMasterVolume();
    this.listeners.forEach((l) => l());
  }

  setChordVolume(vol: number) {
    this.chordVolume = vol;
    this.persistChordVolume();
    this.listeners.forEach((l) => l());
  }

  setChordWave(wave: WaveType) {
    this.chordWave = wave;
    this.persistChordWave();
    this.listeners.forEach((l) => l());
  }

  transpose(
    semitones: number,
    preferSharps: boolean = this.preferSharps,
    track = true,
  ) {
    this.chart.sections.forEach((section) => {
      section.measures.forEach((m) => {
        m.beats.forEach((b) => {
          b.chord = transposeChord(b.chord, semitones, preferSharps);
          if (b.secondary) {
            b.secondary = transposeChord(b.secondary, semitones, preferSharps);
          }
        });
      });
    });
    if (track) {
      this.manualTranspose += semitones;
      this.persistManualTranspose();
    }
    this.setChart(this.chart);
  }

  setInstrument(instrument: Instrument, preferSharps = this.preferSharps) {
    const diff =
      instrumentSemitones[instrument] - instrumentSemitones[this.instrument];
    this.transpose(diff, preferSharps, false);
    this.instrument = instrument;
    this.preferSharps = preferSharps;
    this.persistView();
  }

  resetTranspose() {
    if (this.manualTranspose !== 0) {
      this.transpose(-this.manualTranspose, this.preferSharps, false);
      this.manualTranspose = 0;
      this.persistManualTranspose();
      this.listeners.forEach((l) => l());
    }
  }

  setTempo(bpm: number) {
    this.tempo = bpm;
    this.persistTempo();
    this.listeners.forEach((l) => l());
  }

  toJSON() {
    return JSON.stringify(this.chart, null, 2);
  }

  fromJSON(json: string) {
    this.setChart(JSON.parse(json));
  }

  private notify(message: string) {
    if (this.messageListeners.size) {
      this.messageListeners.forEach((l) => l(message));
      return;
    }
    if (
      typeof window !== 'undefined' &&
      typeof window.alert === 'function' &&
      !process.env.VITEST
    ) {
      try {
        window.alert(message);
        return;
      } catch {
        // ignore
      }
    }
    console.warn(message);
  }

  private validateMarker(
    marker: Marker,
    sectionIndex: number,
    measureIndex: number,
  ): [boolean, string?] {
    const markers: Marker[] = [];
    this.chart.sections.forEach((s, si) => {
      s.measures.forEach((m, mi) => {
        if (si === sectionIndex && mi === measureIndex) return;
        if (m.markers) markers.push(...m.markers);
      });
    });
    const has = (m: Marker) => markers.includes(m);
    switch (marker) {
      case 'Segno':
        if (has('Segno')) return [false, 'Solo puede haber un Segno.'];
        return [true];
      case 'Coda':
        if (has('Coda')) return [false, 'Solo puede haber una Coda.'];
        return [true];
      case 'Fine':
        if (has('Fine')) return [false, 'Solo puede haber un Fine.'];
        if (!has('D.C.') && !has('D.S.'))
          return [false, 'Fine requiere D.C. o D.S.'];
        return [true];
      case 'D.S.':
        if (has('D.S.')) return [false, 'Solo puede haber un D.S.'];
        if (!has('Segno')) return [false, 'D.S. requiere un Segno.'];
        return [true];
      case 'To Coda':
        if (has('To Coda')) return [false, 'Solo puede haber un To Coda.'];
        if (!has('Coda')) return [false, 'To Coda requiere una Coda.'];
        return [true];
      case 'D.C.':
        if (has('D.C.')) return [false, 'Solo puede haber un D.C.'];
        return [true];
      default:
        return [true];
    }
  }

  setMarker(marker: Marker | ''): boolean {
    if (this.selectedSection === null || this.selectedMeasure === null)
      return false;
    const section = this.chart.sections[this.selectedSection];
    const measure = section?.measures[this.selectedMeasure];
    if (!measure) return false;
    if (marker) {
      const [ok, msg] = this.validateMarker(
        marker,
        this.selectedSection,
        this.selectedMeasure,
      );
      if (!ok) {
        if (msg) this.notify(msg);
        return false;
      }
      measure.markers = [marker];
    } else {
      delete measure.markers;
    }
    this.setChart(this.chart);
    return true;
  }

  setVolta(sectionIndex: number, number: 1 | 2, from: number, to: number) {
    const section = this.chart.sections[sectionIndex];
    if (!section) return;
    section.measures.forEach((m) => {
      if (m.volta?.number === number) delete m.volta;
    });
    if (from < 0 || to >= section.measures.length || from > to) return;
    section.measures[from].volta = { number, from, to };
    this.setChart(this.chart);
  }

  clearVolta(sectionIndex: number, number: 1 | 2) {
    const section = this.chart.sections[sectionIndex];
    if (!section) return;
    let changed = false;
    section.measures.forEach((m) => {
      if (m.volta?.number === number) {
        delete m.volta;
        changed = true;
      }
    });
    if (changed) this.setChart(this.chart);
  }
}

export const store = new ChartStore();
