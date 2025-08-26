import { describe, it, expect } from 'vitest';
import { transposeChord, transposeNote } from './transpose';

describe('transposeNote', () => {
  it('transposes up with sharps by default', () => {
    expect(transposeNote('C', 1)).toBe('C#');
  });
  it('transposes down with flats when preferred', () => {
    expect(transposeNote('C', -1, false)).toBe('B');
    expect(transposeNote('B', -1, false)).toBe('Bb');
  });
});

describe('transposeChord', () => {
  it('transposes chord roots', () => {
    expect(transposeChord('Cmaj7', 2)).toBe('Dmaj7');
    expect(transposeChord('F#m7', -1)).toBe('Fm7');
  });
  it('ignores unrecognized chords', () => {
    expect(transposeChord('', 5)).toBe('');
  });
});
