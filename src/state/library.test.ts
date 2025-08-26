import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveChart,
  listCharts,
  getChart,
  markFavorite,
  setStatus,
  backupCharts,
  restoreChartFromBackup,
} from './library';
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

  it('lists charts sorted by title', async () => {
    await saveChart(sampleChart('B Song'), 'B Song', []);
    await saveChart(sampleChart('A Song'), 'A Song', []);
    const charts = await listCharts();
    expect(charts.map((c) => c.title)).toEqual(['A Song', 'B Song']);
  });

  it('marks favorites and filters', async () => {
    const id1 = await saveChart(sampleChart('A'), 'A', []);
    const id2 = await saveChart(sampleChart('B'), 'B', []);
    await markFavorite(id2, true);
    const favs = await listCharts({ favorite: true });
    expect(favs).toHaveLength(1);
    expect(favs[0].id).toBe(id2);
    await markFavorite(id2, false);
    const none = await listCharts({ favorite: true });
    expect(none).toHaveLength(0);
    expect(id1).toBeDefined();
  });

  it('sets status and filters', async () => {
    const id = await saveChart(sampleChart('A'), 'A', []);
    await setStatus(id, 'archived');
    const archived = await listCharts({ status: 'archived' });
    expect(archived).toHaveLength(1);
    await setStatus(id, 'trashed');
    const trashed = await listCharts({ status: 'trashed' });
    expect(trashed).toHaveLength(1);
    const active = await listCharts();
    expect(active).toHaveLength(0);
  });

  it('backs up and restores chart', async () => {
    const id = await saveChart(sampleChart('A'), 'A', []);
    const ts = await backupCharts();
    await saveChart(sampleChart('B'), 'B', [], id);
    await restoreChartFromBackup(ts, id);
    const chart = await getChart(id);
    expect(chart?.title).toBe('A');
  });
});
