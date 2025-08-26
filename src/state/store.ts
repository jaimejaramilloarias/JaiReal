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

  setMarker(marker: Marker | '') {
    this.updateSelectedMeasure((m) => {
      if (marker) {
        m.markers = [marker];
      } else {
        delete m.markers;
      }
    });
  }
}

export const store = new ChartStore();
