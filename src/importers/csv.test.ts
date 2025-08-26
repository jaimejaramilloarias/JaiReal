import { describe, expect, it } from 'vitest';
import { parseCSV } from './csv';

describe('CSV importer', () => {
  it('parses title and measures from CSV', () => {
    const csv = 'title,My Song\nC,F,G,C\nDm,G,C,F';
    const chart = parseCSV(csv);
    expect(chart.title).toBe('My Song');
    expect(chart.sections).toHaveLength(1);
    expect(chart.sections[0].measures).toHaveLength(2);
    expect(chart.sections[0].measures[0].beats[1].chord).toBe('F');
    expect(chart.sections[0].measures[1].beats[2].chord).toBe('C');
  });
});
