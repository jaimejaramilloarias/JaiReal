import { describe, expect, it } from 'vitest';
import { emptyChart, schemaVersion } from './model';

describe('model', () => {
  it('empty chart uses schemaVersion', () => {
    const chart = emptyChart();
    expect(chart.schemaVersion).toBe(schemaVersion);
    expect(chart.sections).toEqual([]);
  });
});
