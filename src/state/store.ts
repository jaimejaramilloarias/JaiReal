import {
  type Chart,
  schemaVersion,
  type Measure,
  type Marker,
} from '../core/model';

const STORAGE_KEY = 'jaireal.chart';
const SHOW_SECONDARY_KEY = 'jaireal.showSecondary';

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
  selectedSection: number | null = null;
  selectedMeasure: number | null = null;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.chart = this.loadChart();
    this.showSecondary = this.loadShowSecondary();
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

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
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

  toJSON() {
    return JSON.stringify(this.chart, null, 2);
  }

  fromJSON(json: string) {
    this.setChart(JSON.parse(json));
  }

  private notify(message: string) {
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
}

export const store = new ChartStore();
