import type { BeatSlot, Chart, Measure } from '../core/model';

/**
 * Parse a minimal subset of the ChordPro format. Supports:
 *  - {title: My Song} directive for the chart title
 *  - Chords in square brackets, e.g. [C] or [Dm7]
 *  - Chords are collected sequentially and grouped into measures of 4 beats
 */
export function parseChordPro(input: string): Chart {
  const lines = input.split(/\r?\n/);
  let title = '';
  const chords: string[] = [];
  const chordRegex = /\[([^\]]+)\]/g;

  for (const line of lines) {
    const titleMatch = line.match(/\{title:\s*([^}]+)\}/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
    let m: RegExpExecArray | null;
    while ((m = chordRegex.exec(line)) !== null) {
      chords.push(m[1].trim());
    }
  }

  const measures: Measure[] = [];
  for (let i = 0; i < chords.length; i += 4) {
    const beats: BeatSlot[] = [];
    for (let j = 0; j < 4; j++) {
      beats.push({ chord: chords[i + j] ?? '' });
    }
    measures.push({ beats });
  }

  return {
    schemaVersion: 1,
    title,
    sections: [{ name: 'A', measures }],
  };
}
