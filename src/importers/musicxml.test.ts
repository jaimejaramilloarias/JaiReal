import { describe, expect, it } from 'vitest';
import { parseMusicXML } from './musicxml';

describe('MusicXML importer', () => {
  it('parses title and chords', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>My Song</work-title></work>
  <part-list><score-part id="P1"><part-name>Music</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <harmony>
        <root><root-step>C</root-step></root>
        <kind text="">major</kind>
      </harmony>
      <harmony>
        <root><root-step>F</root-step></root>
        <kind text="">major</kind>
      </harmony>
      <harmony>
        <root><root-step>G</root-step></root>
        <kind text="">major</kind>
      </harmony>
      <harmony>
        <root><root-step>C</root-step></root>
        <kind text="">major</kind>
      </harmony>
    </measure>
    <measure number="2">
      <harmony>
        <root><root-step>D</root-step></root>
        <kind text="m">minor</kind>
      </harmony>
      <harmony>
        <root><root-step>G</root-step></root>
        <kind text="">major</kind>
      </harmony>
      <harmony>
        <root><root-step>C</root-step></root>
        <kind text="">major</kind>
      </harmony>
      <harmony>
        <root><root-step>F</root-step></root>
        <kind text="">major</kind>
      </harmony>
    </measure>
  </part>
</score-partwise>`;
    const chart = parseMusicXML(xml);
    expect(chart.title).toBe('My Song');
    expect(chart.sections[0].measures[0].beats[1].chord).toBe('F');
    expect(chart.sections[0].measures[1].beats[0].chord).toBe('Dm');
  });
});
