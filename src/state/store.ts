import { Chart, schemaVersion } from '../core/model';

const STORAGE_KEY = 'jaireal.chart';

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
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.chart = this.load();
  }

  private load(): Chart {
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

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setChart(chart: Chart) {
    this.chart = chart;
    this.persist();
    this.listeners.forEach((l) => l());
  }

  toJSON() {
    return JSON.stringify(this.chart, null, 2);
  }

  fromJSON(json: string) {
    this.setChart(JSON.parse(json));
  }
}

export const store = new ChartStore();
