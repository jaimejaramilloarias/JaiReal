import type { BeatSlot, Chart, Measure } from '../core/model';

/**
 * Parse a simple text-based iReal format. Supports:
 *  - First line as the chart title
 *  - Remaining lines contain chords separated by spaces and optional '|' for measure breaks
 *  - Chords are grouped into measures of 4 beats
 */
export function parseIReal(input: string): Chart {
  const lines = input
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const title = lines.shift() ?? '';
  const chordTokens = lines
    .join(' ')
    .split(/\s+|\|/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const measures: Measure[] = [];
  for (let i = 0; i < chordTokens.length; i += 4) {
    const beats: BeatSlot[] = [];
    for (let j = 0; j < 4; j++) {
      beats.push({ chord: chordTokens[i + j] ?? '' });
    }
    measures.push({ beats });
  }

  return {
    schemaVersion: 1,
    title,
    sections: [{ name: 'A', measures }],
  };
}
