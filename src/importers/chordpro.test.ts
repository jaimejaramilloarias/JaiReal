import { describe, expect, it } from 'vitest';
import { parseChordPro } from './chordpro';

describe('ChordPro importer', () => {
  it('parses title and chords from ChordPro format', () => {
    const input = `{title: My Song}\n[C][F][G][C]\n[Dm][G][C][F]\n`;
    const chart = parseChordPro(input);
    expect(chart.title).toBe('My Song');
    expect(chart.sections).toHaveLength(1);
    expect(chart.sections[0].measures).toHaveLength(2);
    expect(chart.sections[0].measures[0].beats[1].chord).toBe('F');
    expect(chart.sections[0].measures[1].beats[2].chord).toBe('C');
  });
});
