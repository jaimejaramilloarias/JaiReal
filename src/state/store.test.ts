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

  it('validates marker dependencies', () => {
    const s = new ChartStore();
    s.setChart({
      schemaVersion: 1,
      title: 't',
      sections: [
        {
          name: 'A',
          measures: [{ beats: [{ chord: 'C' }] }, { beats: [{ chord: 'D' }] }],
        },
      ],
    });
    s.selectMeasure(0, 0);
    expect(s.setMarker('D.S.')).toBe(false);
    expect(s.chart.sections[0].measures[0].markers).toBeUndefined();

    s.selectMeasure(0, 1);
    expect(s.setMarker('Segno')).toBe(true);

    s.selectMeasure(0, 0);
    expect(s.setMarker('D.S.')).toBe(true);
  });

  it('ensures single occurrence markers', () => {
    const s = new ChartStore();
    s.setChart({
      schemaVersion: 1,
      title: 't',
      sections: [
        {
          name: 'A',
          measures: [{ beats: [{ chord: 'C' }] }, { beats: [{ chord: 'D' }] }],
        },
      ],
    });
    s.selectMeasure(0, 0);
    expect(s.setMarker('Coda')).toBe(true);
    s.selectMeasure(0, 1);
    expect(s.setMarker('Coda')).toBe(false);
    expect(s.chart.sections[0].measures[1].markers).toBeUndefined();
  });

  it('notifies on invalid markers', () => {
    const s = new ChartStore();
    let msg = '';
    s.onMessage((m) => {
      msg = m;
    });
    s.setChart({
      schemaVersion: 1,
      title: 't',
      sections: [{ name: 'A', measures: [{ beats: [{ chord: 'C' }] }] }],
    });
    s.selectMeasure(0, 0);
    s.setMarker('D.S.');
    expect(msg).toBe('D.S. requiere un Segno.');
  });
});
