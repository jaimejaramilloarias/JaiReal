import './style.css';
import { Header } from './ui/components/Header';
import { Rail } from './ui/components/Rail';
import { Grid } from './ui/components/Grid';
import { Controls } from './ui/components/Controls';
import { store } from './state/store';
import { playChart, stopPlayback, isPlaying } from './audio/player';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.append(Header(), Rail(), Grid(), Controls());

window.addEventListener('keydown', (ev) => {
  if (ev.ctrlKey && ev.altKey && ev.shiftKey && ev.key === 'ArrowUp') {
    const vol = Math.min(1, Math.round((store.chordVolume + 0.1) * 100) / 100);
    store.setChordVolume(vol);
    ev.preventDefault();
    return;
  }
  if (ev.ctrlKey && ev.altKey && ev.shiftKey && ev.key === 'ArrowDown') {
    const vol = Math.max(0, Math.round((store.chordVolume - 0.1) * 100) / 100);
    store.setChordVolume(vol);
    ev.preventDefault();
    return;
  }
  if (ev.ctrlKey && ev.altKey && ev.key === 'ArrowUp') {
    store.transpose(12);
    ev.preventDefault();
    return;
  }
  if (ev.ctrlKey && ev.altKey && ev.key === 'ArrowDown') {
    store.transpose(-12);
    ev.preventDefault();
    return;
  }
  if (ev.altKey && ev.shiftKey && ev.key === 'ArrowUp') {
    const vol = Math.min(1, Math.round((store.masterVolume + 0.1) * 100) / 100);
    store.setMasterVolume(vol);
    ev.preventDefault();
    return;
  }
  if (ev.altKey && ev.shiftKey && ev.key === 'ArrowDown') {
    const vol = Math.max(0, Math.round((store.masterVolume - 0.1) * 100) / 100);
    store.setMasterVolume(vol);
    ev.preventDefault();
    return;
  }
  if (ev.altKey && ev.shiftKey && ev.key === '0') {
    store.setMasterVolume(1);
    ev.preventDefault();
    return;
  }
  if (ev.ctrlKey && ev.shiftKey && ev.key === 'ArrowUp') {
    const vol = Math.min(
      1,
      Math.round((store.metronomeVolume + 0.1) * 100) / 100,
    );
    store.setMetronomeVolume(vol);
    ev.preventDefault();
    return;
  }
  if (ev.ctrlKey && ev.shiftKey && ev.key === 'ArrowDown') {
    const vol = Math.max(
      0,
      Math.round((store.metronomeVolume - 0.1) * 100) / 100,
    );
    store.setMetronomeVolume(vol);
    ev.preventDefault();
    return;
  }
  if (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === 'l') {
    store.toggleSecondary();
    ev.preventDefault();
    return;
  }
  if (ev.ctrlKey && ev.key === 'ArrowUp') {
    store.transpose(1);
    ev.preventDefault();
    return;
  }
  if (ev.ctrlKey && ev.key === 'ArrowDown') {
    store.transpose(-1);
    ev.preventDefault();
    return;
  }
  if (ev.ctrlKey && ev.key === 'ArrowRight') {
    const bpm = Math.min(240, store.tempo + 5);
    store.setTempo(bpm);
    ev.preventDefault();
    return;
  }
  if (ev.ctrlKey && ev.key === 'ArrowLeft') {
    const bpm = Math.max(40, store.tempo - 5);
    store.setTempo(bpm);
    ev.preventDefault();
    return;
  }
  if (ev.code === 'Space') {
    if (isPlaying()) {
      stopPlayback();
    } else {
      playChart(
        store.chart,
        store.tempo,
        store.metronome,
        store.metronomeVolume,
        store.chordVolume,
        store.chordWave,
      );
    }
    ev.preventDefault();
  }
});
