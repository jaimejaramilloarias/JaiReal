import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { saveChart, listCharts, getChart } from './library';
import { schemaVersion, type Chart } from '../core/model';

function sampleChart(title: string): Chart {
  return {
    schemaVersion,
    title,
    sections: [
      {
        name: 'A',
        measures: [
          {
            beats: [{ chord: '' }, { chord: '' }, { chord: '' }, { chord: '' }],
          },
        ],
      },
    ],
  };
}

describe('library', () => {
  beforeEach(() => {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase('jaireal-library');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
  it('saves and retrieves chart', async () => {
    const id = await saveChart(sampleChart('Test'), 'Test', ['jazz']);
    const charts = await listCharts();
    expect(charts).toHaveLength(1);
    expect(charts[0].title).toBe('Test');
    const chart = await getChart(id);
    expect(chart?.title).toBe('Test');
  });

  it('searches by title and tags', async () => {
    await saveChart(sampleChart('Blues'), 'Blues', ['jazz']);
    await saveChart(sampleChart('Rock Song'), 'Rock Song', ['rock']);
    const byTag = await listCharts({ tag: 'jazz' });
    expect(byTag).toHaveLength(1);
    expect(byTag[0].title).toBe('Blues');
    const byTitle = await listCharts({ title: 'rock' });
    expect(byTitle).toHaveLength(1);
    expect(byTitle[0].title).toBe('Rock Song');
  });

  it('filters by title and tag simultaneously', async () => {
    await saveChart(sampleChart('Jazz Rock'), 'Jazz Rock', ['jazz', 'rock']);
    await saveChart(sampleChart('Jazz Blues'), 'Jazz Blues', ['jazz']);
    const filtered = await listCharts({ title: 'jazz', tag: 'rock' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Jazz Rock');
  });
});
