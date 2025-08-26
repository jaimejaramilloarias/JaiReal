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
    setValueAtTime() {},
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
});
