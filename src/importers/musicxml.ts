import { JSDOM } from 'jsdom';
import type { BeatSlot, Chart, Measure } from '../core/model';

/**
 * Parse a very small subset of MusicXML into a Chart.
 * It reads work title and harmony elements assuming 4/4 time
 * with up to four chords per measure.
 */
export function parseMusicXML(input: string): Chart {
  const doc = new JSDOM(input, { contentType: 'text/xml' }).window.document;
  const title =
    doc.getElementsByTagName('work-title')[0]?.textContent?.trim() ?? '';

  const measures: Measure[] = [];
  doc.querySelectorAll('measure').forEach((m) => {
    const beats: BeatSlot[] = [];
    m.querySelectorAll('harmony').forEach((h) => {
      if (beats.length >= 4) return;
      const rootStep = h.querySelector('root-step')?.textContent?.trim() ?? '';
      const alter = h.querySelector('root-alter')?.textContent?.trim();
      let root = rootStep;
      if (alter === '1') root += '#';
      else if (alter === '-1') root += 'b';
      const kindEl = h.querySelector('kind');
      const kind =
        kindEl?.getAttribute('text')?.trim() ??
        kindEl?.textContent?.trim() ??
        '';
      beats.push({ chord: `${root}${kind}` });
    });
    while (beats.length < 4) beats.push({ chord: '' });
    measures.push({ beats });
  });

  return {
    schemaVersion: 1,
    title,
    sections: [{ name: 'A', measures }],
  };
}
