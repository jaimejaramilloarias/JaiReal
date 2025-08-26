import type { BeatSlot, Chart, Measure } from '../core/model';

/**
 * Parse a simple CSV representation of a chart. The CSV format is:
 *   Optional header line: `title,My Song`
 *   Each subsequent line represents a measure with up to four comma-separated chords.
 *   Missing chords are filled with empty strings.
 */
export function parseCSV(input: string): Chart {
  const lines = input
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let title = '';
  const measures: Measure[] = [];

  lines.forEach((line, idx) => {
    const cells = line.split(',').map((c) => c.trim());
    if (idx === 0 && cells[0].toLowerCase() === 'title') {
      title = cells[1] ?? '';
      return;
    }
    const beats: BeatSlot[] = [];
    for (let i = 0; i < 4; i++) {
      beats.push({ chord: cells[i] ?? '' });
    }
    measures.push({ beats });
  });

  return {
    schemaVersion: 1,
    title,
    sections: [{ name: 'A', measures }],
  };
}
