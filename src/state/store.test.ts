import { beforeEach, describe, expect, it } from 'vitest';
import { ChartStore } from './store';

describe('ChartStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists to localStorage', () => {
    const s = new ChartStore();
    s.setChart({ schemaVersion: 1, title: 't', sections: [] });
    const raw = localStorage.getItem('jaireal.chart');
    expect(raw).toBeTruthy();
  });

  it('stores secondary line per beat', () => {
    const s = new ChartStore();
    s.setChart({
      schemaVersion: 1,
      title: 't',
      sections: [
        { name: 'A', measures: [{ beats: [{ chord: 'C', secondary: 'b' }] }] },
      ],
    });
    const s2 = new ChartStore();
    expect(s2.chart.sections[0].measures[0].beats[0].secondary).toBe('b');
  });

  it('toggles and persists secondary visibility', () => {
    const s = new ChartStore();
    expect(s.showSecondary).toBe(true);
    s.toggleSecondary();
    expect(s.showSecondary).toBe(false);
    const s2 = new ChartStore();
    expect(s2.showSecondary).toBe(false);
  });

  it('selects measures and applies markers', () => {
    const s = new ChartStore();
    s.setChart({
      schemaVersion: 1,
      title: 't',
      sections: [
        {
          name: 'A',
          measures: [
            {
              beats: [
                { chord: 'C' },
                { chord: '' },
                { chord: '' },
                { chord: '' },
              ],
            },
          ],
        },
      ],
    });
    s.selectMeasure(0, 0);
    expect(s.selectedSection).toBe(0);
    expect(s.selectedMeasure).toBe(0);
    s.setMarker('%');
    expect(s.chart.sections[0].measures[0].markers).toEqual(['%']);
    s.setMarker('');
    expect(s.chart.sections[0].measures[0].markers).toBeUndefined();
  });
});
