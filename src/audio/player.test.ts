import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Chart } from '../core/model';
import * as player from './player';

class FakeOscillator {
  type = 'sine';
  frequency = { value: 0 };
  connect() {}
  start() {}
  stop() {}
}

class FakeGain {
  gain = {
    value: 1,
    setValueAtTime(v: number) {
      this.value = v;
    },
    exponentialRampToValueAtTime() {},
  };
  connect() {}
}

class FakeAudioContext {
  state = 'running';
  currentTime = 0;
  destination = {};
  createOscillator() {
    return new FakeOscillator();
  }
  createGain() {
    return new FakeGain();
  }
  close() {}
  resume() {}
}

beforeEach(() => {
  // @ts-expect-error test stub
  window.AudioContext = FakeAudioContext as unknown as typeof AudioContext;
  // @ts-expect-error test stub
  window.webkitAudioContext =
    FakeAudioContext as unknown as typeof AudioContext;
  player.stopPlayback();
});

describe('playChart metronome', () => {
  it('skips clicks when disabled', () => {
    const chart: Chart = {
      schemaVersion: 1,
      title: '',
      sections: [
        {
          name: 'A',
          measures: [
            {
              beats: [
                { chord: '' },
                { chord: '' },
                { chord: '' },
                { chord: '' },
              ],
            },
          ],
        },
      ],
    };
    const spy = vi.spyOn(player.internal, 'scheduleClick');
    player.playChart(chart, 120, false);
    expect(spy).not.toHaveBeenCalled();
    spy.mockClear();
    player.playChart(chart, 120, true);
    expect(spy).toHaveBeenCalled();
  });

  it('passes metronome volume to scheduleClick', () => {
    const chart: Chart = {
      schemaVersion: 1,
      title: '',
      sections: [
        {
          name: 'A',
          measures: [
            {
              beats: [
                { chord: '' },
                { chord: '' },
                { chord: '' },
                { chord: '' },
              ],
            },
          ],
        },
      ],
    };
    const spy = vi.spyOn(player.internal, 'scheduleClick');
    player.playChart(chart, 120, true, 0.3);
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][2]).toBe(0.3);
  });

  it('adds count-in clicks', () => {
    const chart: Chart = {
      schemaVersion: 1,
      title: '',
      sections: [
        {
          name: 'A',
          measures: [
            {
              beats: [
                { chord: '' },
                { chord: '' },
                { chord: '' },
                { chord: '' },
              ],
            },
          ],
        },
      ],
    };
    const spy = vi.spyOn(player.internal, 'scheduleClick');
    player.playChart(chart, 120, true, 1, 1, 'sine', 2);
    expect(spy).toHaveBeenCalledTimes(6); // 4 beats + 2 count-in
  });

  it('uses provided waveform for chords', () => {
    const chart: Chart = {
      schemaVersion: 1,
      title: '',
      sections: [
        {
          name: 'A',
          measures: [
            {
              beats: [
                { chord: 'C' },
                { chord: '' },
                { chord: '' },
                { chord: '' },
              ],
            },
          ],
        },
      ],
    };
    const created: FakeOscillator[] = [];
    class TestAudioContext extends FakeAudioContext {
      createOscillator() {
        const o = new FakeOscillator();
        created.push(o);
        return o;
      }
    }
    // @ts-expect-error test stub
    window.AudioContext = TestAudioContext as unknown as typeof AudioContext;
    // @ts-expect-error test stub
    window.webkitAudioContext =
      TestAudioContext as unknown as typeof AudioContext;
    player.playChart(chart, 120, false, 1, 1, 'square');
    expect(created[0]?.type).toBe('square');
  });
});

describe('master volume', () => {
  it('updates master gain value', () => {
    const chart: Chart = {
      schemaVersion: 1,
      title: '',
      sections: [
        {
          name: 'A',
          measures: [
            {
              beats: [
                { chord: 'C' },
                { chord: '' },
                { chord: '' },
                { chord: '' },
              ],
            },
          ],
        },
      ],
    };
    player.setMasterVolume(0.5);
    player.playChart(chart, 120, false);
    expect(player.getMasterVolume()).toBe(0.5);
  });
});

describe('playSectionLoop', () => {
  it('schedules repeat', () => {
    const chart: Chart = {
      schemaVersion: 1,
      title: '',
      sections: [
        {
          name: 'A',
          measures: [
            {
              beats: [
                { chord: '' },
                { chord: '' },
                { chord: '' },
                { chord: '' },
              ],
            },
          ],
        },
      ],
    };
    const spy = vi.spyOn(globalThis, 'setTimeout');
    player.playSectionLoop(chart, 0, 60, false);
    expect(spy).toHaveBeenCalled();
    const delay = spy.mock.calls[0][1] as number;
    expect(delay).toBe(4000);
    player.stopPlayback();
    spy.mockRestore();
  });

  it('clears repeat timer on stop', () => {
    const chart: Chart = {
      schemaVersion: 1,
      title: '',
      sections: [
        {
          name: 'A',
          measures: [
            {
              beats: [
                { chord: '' },
                { chord: '' },
                { chord: '' },
                { chord: '' },
              ],
            },
          ],
        },
      ],
    };
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    player.playSectionLoop(chart, 0, 60, false);
    player.stopPlayback();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
