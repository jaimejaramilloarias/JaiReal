import { getTemplate } from './templates';
import { describe, it, expect } from 'vitest';

describe('templates', () => {
  it('creates AABA chart', () => {
    const chart = getTemplate('AABA');
    expect(chart.sections.length).toBe(4);
    expect(chart.sections[0].measures.length).toBe(8);
  });

  it('creates Blues chart', () => {
    const chart = getTemplate('Blues');
    expect(chart.sections[0].measures.length).toBe(12);
    expect(chart.sections[0].measures[0].beats[0].chord).toBe('I7');
  });
});
