export type BeatSlot = {
  chord: string;
  secondary?: string;
};

export type Marker =
  | '%'
  | '||:'
  | ':||'
  | 'Segno'
  | 'Coda'
  | 'Fine'
  | 'D.C.'
  | 'D.S.'
  | 'To Coda';

export type Volta = {
  number: number;
  from: number;
  to: number;
};

export interface Measure {
  beats: BeatSlot[];
  markers?: Marker[];
  volta?: Volta;
  notes?: string[]; // secondary line per beat
}

export interface Section {
  name: string;
  measures: Measure[];
}

export interface Chart {
  schemaVersion: number;
  title: string;
  sections: Section[];
}

export const schemaVersion = 1;

export const emptyChart = (): Chart => ({
  schemaVersion,
  title: '',
  sections: [],
});
