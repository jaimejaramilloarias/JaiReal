import type { Chart, Measure } from './model';
import { schemaVersion } from './model';

export type TemplateName =
  | 'AABA'
  | 'Blues'
  | 'Rhythm Changes'
  | 'Intro-Tag-Out';

const emptyMeasure = (): Measure => ({
  beats: [{ chord: '' }, { chord: '' }, { chord: '' }, { chord: '' }],
});

const measures = (n: number): Measure[] =>
  Array.from({ length: n }, () => emptyMeasure());

export const templates: Record<TemplateName, Chart> = {
  AABA: {
    schemaVersion,
    title: '',
    sections: [
      { name: 'A', measures: measures(8) },
      { name: 'A', measures: measures(8) },
      { name: 'B', measures: measures(8) },
      { name: 'A', measures: measures(8) },
    ],
  },
  Blues: {
    schemaVersion,
    title: '',
    sections: [
      {
        name: 'Blues',
        measures: measures(12).map((m, i) => {
          const chords = [
            'I7',
            'IV7',
            'I7',
            'I7',
            'IV7',
            'IV7',
            'I7',
            'I7',
            'V7',
            'IV7',
            'I7',
            'V7',
          ];
          m.beats[0].chord = chords[i];
          return m;
        }),
      },
    ],
  },
  'Rhythm Changes': {
    schemaVersion,
    title: '',
    sections: [
      { name: 'A', measures: measures(8) },
      { name: 'A', measures: measures(8) },
      { name: 'B', measures: measures(8) },
      { name: 'A', measures: measures(8) },
    ],
  },
  'Intro-Tag-Out': {
    schemaVersion,
    title: '',
    sections: [
      { name: 'Intro', measures: measures(4) },
      { name: 'A', measures: measures(8) },
      { name: 'Tag', measures: measures(4) },
      { name: 'Out', measures: measures(4) },
    ],
  },
};

export function getTemplate(name: TemplateName): Chart {
  return JSON.parse(JSON.stringify(templates[name])) as Chart;
}
