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
});
