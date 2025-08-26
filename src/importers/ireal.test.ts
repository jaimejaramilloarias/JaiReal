import { describe, expect, it } from 'vitest';
import { parseIReal } from './ireal';

describe('iReal importer', () => {
  it('parses title and measures from iReal text', () => {
    const text = `My Song\nC F | G C\nDm G | C F`;
    const chart = parseIReal(text);
    expect(chart.title).toBe('My Song');
    expect(chart.sections).toHaveLength(1);
    expect(chart.sections[0].measures).toHaveLength(2);
    expect(chart.sections[0].measures[0].beats[1].chord).toBe('F');
    expect(chart.sections[0].measures[1].beats[2].chord).toBe('C');
  });
});
