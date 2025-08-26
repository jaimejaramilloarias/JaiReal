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

  it('transposes chords across the chart', () => {
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
                { chord: 'F#', secondary: 'G' },
                { chord: '', secondary: '' },
                { chord: '' },
              ],
            },
          ],
        },
      ],
    });
    s.transpose(2);
    const beats = s.chart.sections[0].measures[0].beats;
    expect(beats[0].chord).toBe('D');
    expect(beats[1].chord).toBe('G#');
    expect(beats[1].secondary).toBe('A');
  });

  it('sets instrument views and accidental preference', () => {
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
                { chord: 'Db' },
                { chord: '', secondary: '' },
                { chord: '' },
              ],
            },
          ],
        },
      ],
    });
    s.setInstrument('Bb');
    let beats = s.chart.sections[0].measures[0].beats;
    expect(beats[0].chord).toBe('D');
    expect(beats[1].chord).toBe('D#');

    s.setInstrument('Bb', false);
    beats = s.chart.sections[0].measures[0].beats;
    expect(beats[1].chord).toBe('Eb');

    s.setInstrument('C');
    beats = s.chart.sections[0].measures[0].beats;
    expect(beats[0].chord).toBe('C');
  });

  it('persists instrument settings', () => {
    const s = new ChartStore();
    s.setInstrument('Eb', false);
    const s2 = new ChartStore();
    expect(s2.instrument).toBe('Eb');
    expect(s2.preferSharps).toBe(false);
  });

  it('syncs manual transpose with instrument view and tracks amount', () => {
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
    s.setInstrument('C', false);
    s.transpose(1);
    let beat = s.chart.sections[0].measures[0].beats[0];
    expect(beat.chord).toBe('Db');
    expect(s.manualTranspose).toBe(1);
    s.resetTranspose();
    beat = s.chart.sections[0].measures[0].beats[0];
    expect(beat.chord).toBe('C');
    expect(s.manualTranspose).toBe(0);
  });
});
