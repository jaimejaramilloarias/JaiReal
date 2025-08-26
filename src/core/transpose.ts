const sharpNotes = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];
const flatNotes = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
];

export function transposeNote(
  note: string,
  semitones: number,
  preferSharps = true,
): string {
  let idx = sharpNotes.indexOf(note);
  if (idx === -1) idx = flatNotes.indexOf(note);
  if (idx === -1) return note;
  const notes = preferSharps ? sharpNotes : flatNotes;
  const newIndex = (idx + semitones + 12) % 12;
  return notes[newIndex];
}

export function transposeChord(
  chord: string,
  semitones: number,
  preferSharps = true,
): string {
  const match = chord.match(/^([A-G](?:#|b)?)(.*)$/);
  if (!match) return chord;
  const [, root, rest] = match;
  const newRoot = transposeNote(root, semitones, preferSharps);
  return newRoot + rest;
}
