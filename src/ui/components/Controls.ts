import { store } from '../../state/store';
import type { Marker } from '../../core/model';
import {
  playChart,
  stopPlayback,
  playSectionLoop,
  setMasterVolume,
} from '../../audio/player';
import { exportChartPDF } from '../../export/pdf';
import { getTemplate, type TemplateName } from '../../core/templates';
import {
  saveChart as saveLibraryChart,
  getChart as getLibraryChart,
} from '../../state/library';
import { LibraryModal } from './LibraryModal';
import { t, getLang, setLang } from '../../i18n';
import { syncNow } from '../../state/sync';

type WaveType = 'sine' | 'square' | 'triangle' | 'sawtooth';

export function Controls(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'controls';
  const messageEl = document.createElement('div');
  messageEl.className = 'message';
  messageEl.setAttribute('role', 'alert');
  messageEl.setAttribute('aria-live', 'assertive');
  messageEl.tabIndex = -1;
  const messageText = document.createElement('span');
  const closeBtn = document.createElement('button');
  closeBtn.className = 'message-close';
  closeBtn.type = 'button';
  closeBtn.textContent = '×';
  const updateCloseAria = () => {
    closeBtn.setAttribute('aria-label', t('closeMessage'));
  };
  updateCloseAria();
  document.addEventListener('langchange', updateCloseAria);
  messageEl.append(messageText, closeBtn);

  let hideTimeout: number | undefined;
  let lastFocused: HTMLElement | null = null;
  function hideMessage() {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = undefined;
    }
    messageText.textContent = '';
    messageEl.style.display = 'none';
    if (lastFocused) {
      const toFocus = lastFocused;
      lastFocused = null;
      setTimeout(() => {
        toFocus.focus();
      });
    }
  }
  closeBtn.onclick = hideMessage;

  const saveBtn = document.createElement('button');
  saveBtn.onclick = () => {
    const json = store.toJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chart.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadInput = document.createElement('input');
  loadInput.type = 'file';
  loadInput.accept = 'application/json';
  loadInput.onchange = async () => {
    const file = loadInput.files?.[0];
    if (file) {
      const text = await file.text();
      store.fromJSON(text);
    }
  };

  const pdfBtn = document.createElement('button');
  pdfBtn.onclick = () => {
    exportChartPDF(store.chart);
  };

  const saveLibBtn = document.createElement('button');
  saveLibBtn.onclick = async () => {
    const title = prompt(t('promptTitle'), store.chart.title);
    if (!title) return;
    const tagStr = prompt(t('promptTags'), '');
    const tags = tagStr
      ? tagStr
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    await saveLibraryChart(store.chart, title, tags);
  };

  const openLibBtn = document.createElement('button');
  openLibBtn.onclick = () => {
    const modal = LibraryModal(async (id) => {
      const chart = await getLibraryChart(id);
      if (chart) {
        store.setChart(chart);
      }
    }, openLibBtn);
    document.body.appendChild(modal);
  };

  const syncBtn = document.createElement('button');
  syncBtn.onclick = () => {
    syncNow().catch(() => {});
  };

  const langBtn = document.createElement('button');
  langBtn.onclick = () => {
    const next = getLang() === 'es' ? 'en' : 'es';
    setLang(next);
  };

  const templateLabel = document.createElement('label');
  const templateSelect = document.createElement('select');
  const templateOptions: TemplateName[] = [
    'AABA',
    'Blues',
    'Rhythm Changes',
    'Intro-Tag-Out',
  ];
  templateOptions.forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    templateSelect.appendChild(opt);
  });
  const templateBtn = document.createElement('button');
  templateBtn.onclick = () => {
    const name = templateSelect.value as TemplateName;
    store.setChart(getTemplate(name));
  };
  templateLabel.appendChild(templateSelect);

  const toggleSecondaryBtn = document.createElement('button');
  const shortcut = 'Ctrl+Shift+L';
  const updateToggleText = () => {
    const key = store.showSecondary ? 'hideSecondary' : 'showSecondary';
    toggleSecondaryBtn.textContent = t(key, { shortcut });
    toggleSecondaryBtn.title = shortcut;
  };
  toggleSecondaryBtn.onclick = () => {
    store.toggleSecondary();
  };

  const transposeUpBtn = document.createElement('button');
  const transposeUpShortcut = 'Ctrl+↑';
  const transposeOctUpShortcut = 'Ctrl+Alt+↑';
  transposeUpBtn.title = `${transposeUpShortcut} (+1), ${transposeOctUpShortcut} (+12)`;
  transposeUpBtn.onclick = () => {
    store.transpose(1);
  };

  const transposeDownBtn = document.createElement('button');
  const transposeDownShortcut = 'Ctrl+↓';
  const transposeOctDownShortcut = 'Ctrl+Alt+↓';
  transposeDownBtn.title = `${transposeDownShortcut} (-1), ${transposeOctDownShortcut} (-12)`;
  transposeDownBtn.onclick = () => {
    store.transpose(-1);
  };

  const resetTransposeBtn = document.createElement('button');

  const transposeInfo = document.createElement('span');
  const updateTransposeInfo = () => {
    const val = store.manualTranspose;
    const sign = val > 0 ? '+' : '';
    transposeInfo.textContent = `${t('transposeLabel')} ${sign}${val}`;
  };
  updateTransposeInfo();

  const updateLangTexts = () => {
    saveBtn.textContent = t('saveJson');
    pdfBtn.textContent = t('exportPdf');
    saveLibBtn.textContent = t('saveLibrary');
    openLibBtn.textContent = t('openLibrary');
    templateLabel.textContent = t('templateLabel') + ' ';
    templateBtn.textContent = t('newFromTemplate');
    transposeUpBtn.textContent = t('transposeUp', {
      s1: transposeUpShortcut,
      s12: transposeOctUpShortcut,
    });
    transposeDownBtn.textContent = t('transposeDown', {
      s1: transposeDownShortcut,
      s12: transposeOctDownShortcut,
    });
    resetTransposeBtn.textContent = t('resetTranspose');
    syncBtn.textContent = t('syncNow');
    syncBtn.title = t('syncNowTitle');
    langBtn.textContent = t('toggleLang');
    langBtn.title = t('toggleLangTitle');
    updateToggleText();
    updateTransposeInfo();
  };
  document.addEventListener('langchange', updateLangTexts);
  updateLangTexts();

  resetTransposeBtn.onclick = () => {
    store.resetTranspose();
  };

  const tempoLabel = document.createElement('label');
  const tempoShortcut = 'Ctrl+←/→';
  const tempoText = document.createTextNode('');
  const updateTempoTexts = () => {
    tempoText.textContent =
      t('tempoLabel', {
        shortcut: tempoShortcut,
        wheel: t('wheel'),
      }) + ' ';
    tempoLabel.title = t('tempoTitle', { shortcut: tempoShortcut });
  };
  const tempoInput = document.createElement('input');
  tempoInput.type = 'number';
  tempoInput.min = '40';
  tempoInput.max = '240';
  tempoInput.value = String(store.tempo);
  tempoInput.onchange = () => {
    const val = Number(tempoInput.value);
    if (!Number.isNaN(val)) {
      store.setTempo(val);
    }
  };
  tempoInput.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    const change = ev.deltaY < 0 ? 1 : -1;
    const bpm = Math.min(240, Math.max(40, store.tempo + change));
    store.setTempo(bpm);
    tempoInput.value = String(bpm);
  });
  tempoLabel.append(tempoText, tempoInput);
  updateTempoTexts();
  document.addEventListener('langchange', updateTempoTexts);

  const masterVolLabel = document.createElement('label');
  const masterVolShortcut = 'Alt+Shift+↑/↓/0';
  const masterVolText = document.createTextNode('');
  masterVolLabel.title = masterVolShortcut;
  const masterVolInput = document.createElement('input');
  masterVolInput.type = 'range';
  masterVolInput.min = '0';
  masterVolInput.max = '1';
  masterVolInput.step = '0.01';
  masterVolInput.value = String(store.masterVolume);
  masterVolInput.oninput = () => {
    const val = Number(masterVolInput.value);
    if (!Number.isNaN(val)) {
      store.setMasterVolume(val);
    }
  };
  masterVolLabel.append(masterVolText, masterVolInput);

  const chordVolLabel = document.createElement('label');
  const chordVolShortcut = 'Ctrl+Alt+Shift+↑/↓';
  const chordVolText = document.createTextNode('');
  chordVolLabel.title = chordVolShortcut;
  const chordVolInput = document.createElement('input');
  chordVolInput.type = 'range';
  chordVolInput.min = '0';
  chordVolInput.max = '1';
  chordVolInput.step = '0.01';
  chordVolInput.value = String(store.chordVolume);
  chordVolInput.oninput = () => {
    const val = Number(chordVolInput.value);
    if (!Number.isNaN(val)) {
      store.setChordVolume(val);
    }
  };
  chordVolLabel.append(chordVolText, chordVolInput);

  const chordWaveLabel = document.createElement('label');
  const chordWaveText = document.createTextNode('');
  const chordWaveSelect = document.createElement('select');
  (['sine', 'square', 'triangle', 'sawtooth'] as WaveType[]).forEach((w) => {
    const opt = document.createElement('option');
    opt.value = w;
    opt.textContent = t(`wave_${w}`);
    chordWaveSelect.appendChild(opt);
  });
  chordWaveSelect.value = store.chordWave;
  chordWaveSelect.onchange = () => {
    store.setChordWave(chordWaveSelect.value as WaveType);
  };
  chordWaveLabel.append(chordWaveText, chordWaveSelect);

  const metronomeBtn = document.createElement('button');
  const updateMetronomeText = () => {
    metronomeBtn.textContent = store.metronome
      ? t('metronomeOff')
      : t('metronomeOn');
  };
  metronomeBtn.onclick = () => {
    store.toggleMetronome();
  };

  const metronomeVolLabel = document.createElement('label');
  const metronomeVolShortcut = 'Ctrl+Shift+↑/↓';
  const metronomeVolText = document.createTextNode('');
  metronomeVolLabel.title = metronomeVolShortcut;
  const metronomeVolInput = document.createElement('input');
  metronomeVolInput.type = 'range';
  metronomeVolInput.min = '0';
  metronomeVolInput.max = '1';
  metronomeVolInput.step = '0.01';
  metronomeVolInput.value = String(store.metronomeVolume);
  metronomeVolInput.oninput = () => {
    const val = Number(metronomeVolInput.value);
    if (!Number.isNaN(val)) {
      store.setMetronomeVolume(val);
    }
  };
  metronomeVolLabel.append(metronomeVolText, metronomeVolInput);

  const playBtn = document.createElement('button');
  const stopBtn = document.createElement('button');
  playBtn.onclick = () => {
    setMasterVolume(store.masterVolume);
    playChart(
      store.chart,
      store.tempo,
      store.metronome,
      store.metronomeVolume,
      store.chordVolume,
      store.chordWave,
    );
  };
  stopBtn.onclick = () => {
    stopPlayback();
  };

  const loopBtn = document.createElement('button');
  loopBtn.onclick = () => {
    if (store.selectedSection !== null) {
      setMasterVolume(store.masterVolume);
      playSectionLoop(
        store.chart,
        store.selectedSection,
        store.tempo,
        store.metronome,
        store.metronomeVolume,
        store.chordVolume,
        store.chordWave,
      );
    }
  };

  const instrumentLabel = document.createElement('label');
  const instrumentText = document.createTextNode('');
  instrumentLabel.htmlFor = 'instrument-select';
  const instrumentSelect = document.createElement('select');
  instrumentSelect.id = 'instrument-select';
  [
    ['C', 'C'],
    ['Bb', 'Bb'],
    ['Eb', 'Eb'],
    ['F', 'F'],
  ].forEach(([value, text]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = text;
    instrumentSelect.appendChild(opt);
  });
  instrumentLabel.append(instrumentText, instrumentSelect);

  const accidentalLabel = document.createElement('label');
  const accidentalText = document.createTextNode('');
  accidentalLabel.htmlFor = 'accidental-select';
  const accidentalSelect = document.createElement('select');
  accidentalSelect.id = 'accidental-select';
  [
    ['sharp', '♯'],
    ['flat', '♭'],
  ].forEach(([value, text]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = text;
    accidentalSelect.appendChild(opt);
  });
  accidentalLabel.append(accidentalText, accidentalSelect);

  const updateViewControls = () => {
    instrumentSelect.value = store.instrument;
    accidentalSelect.value = store.preferSharps ? 'sharp' : 'flat';
  };
  updateViewControls();

  instrumentSelect.onchange = () => {
    store.setInstrument(
      instrumentSelect.value as 'C' | 'Bb' | 'Eb' | 'F',
      accidentalSelect.value === 'sharp',
    );
  };
  accidentalSelect.onchange = () => {
    store.setInstrument(
      instrumentSelect.value as 'C' | 'Bb' | 'Eb' | 'F',
      accidentalSelect.value === 'sharp',
    );
  };

  const themeBtn = document.createElement('button');
  const updateThemeBtn = () => {
    themeBtn.textContent =
      store.theme === 'dark' ? t('lightTheme') : t('darkTheme');
  };
  themeBtn.onclick = () => {
    store.toggleTheme();
  };

  const fontSizeLabel = document.createElement('label');
  const fontSizeText = document.createTextNode('');
  const fontSizeInput = document.createElement('input');
  fontSizeInput.type = 'number';
  fontSizeInput.min = '12';
  fontSizeInput.max = '24';
  fontSizeInput.value = String(store.fontSize);
  fontSizeInput.onchange = () => {
    const val = Number(fontSizeInput.value);
    if (!Number.isNaN(val)) store.setFontSize(val);
  };
  fontSizeLabel.append(fontSizeText, fontSizeInput);

  const voltaLabel = document.createElement('label');
  const voltaText = document.createTextNode('');
  const voltaSelect = document.createElement('select');
  ['', '1', '2'].forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v ? `${v}ª` : '(sin)';
    voltaSelect.appendChild(opt);
  });
  const voltaFrom = document.createElement('input');
  voltaFrom.type = 'number';
  voltaFrom.min = '1';
  const voltaTo = document.createElement('input');
  voltaTo.type = 'number';
  voltaTo.min = '1';
  const voltaBtn = document.createElement('button');
  voltaBtn.onclick = () => {
    if (store.selectedSection === null) return;
    const num = Number(voltaSelect.value);
    const from = Number(voltaFrom.value) - 1;
    const to = Number(voltaTo.value) - 1;
    if (num && !Number.isNaN(from) && !Number.isNaN(to)) {
      store.setVolta(store.selectedSection, num as 1 | 2, from, to);
    }
  };
  const clearVoltaBtn = document.createElement('button');
  clearVoltaBtn.onclick = () => {
    if (store.selectedSection === null) return;
    store.clearVolta(store.selectedSection, 1);
    store.clearVolta(store.selectedSection, 2);
  };
  voltaLabel.append(voltaText, voltaSelect, voltaFrom, voltaTo, voltaBtn);

  const markerLabel = document.createElement('label');
  const markerText = document.createTextNode('');
  const markerSelect = document.createElement('select');
  const markerOptions: (Marker | '')[] = [
    '',
    '%',
    '||:',
    ':||',
    'Segno',
    'Coda',
    'Fine',
    'D.C.',
    'D.S.',
    'To Coda',
  ];
  markerOptions.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m || t('noMarker');
    markerSelect.appendChild(opt);
  });
  markerLabel.append(markerText, markerSelect);
  const updateMarkerSelect = () => {
    if (store.selectedSection === null || store.selectedMeasure === null) {
      markerSelect.disabled = true;
      markerSelect.value = '';
      return;
    }
    markerSelect.disabled = false;
    const measure =
      store.chart.sections[store.selectedSection].measures[
        store.selectedMeasure
      ];
    markerSelect.value = measure.markers?.[0] || '';
  };
  markerSelect.onchange = () => {
    store.setMarker(markerSelect.value as Marker | '');
  };

  const updateControlTexts = () => {
    masterVolText.textContent =
      t('masterVolumeLabel', { shortcut: masterVolShortcut }) + ' ';
    chordVolText.textContent =
      t('chordVolumeLabel', { shortcut: chordVolShortcut }) + ' ';
    chordWaveText.textContent = t('chordWaveLabel') + ' ';
    metronomeVolText.textContent =
      t('metronomeVolLabel', { shortcut: metronomeVolShortcut }) + ' ';
    loopBtn.textContent = t('loopSection');
    instrumentText.textContent = t('instrumentLabel') + ' ';
    accidentalText.textContent = t('accidentalLabel') + ' ';
    fontSizeText.textContent = t('fontSizeLabel') + ' ';
    voltaText.textContent = t('voltaLabel') + ' ';
    voltaFrom.placeholder = t('voltaFrom');
    voltaTo.placeholder = t('voltaTo');
    voltaBtn.textContent = t('apply');
    clearVoltaBtn.textContent = t('clearVoltas');
    markerText.textContent = t('markerLabel') + ' ';
    const noMarkerOpt = markerSelect.querySelector('option[value=""]');
    if (noMarkerOpt) noMarkerOpt.textContent = t('noMarker');
    chordWaveSelect.querySelectorAll('option').forEach((opt) => {
      const val = opt.value as WaveType;
      opt.textContent = t(`wave_${val}`);
    });
    updateMetronomeText();
    updateThemeBtn();
  };
  document.addEventListener('langchange', updateControlTexts);
  updateControlTexts();

  const updatePlayTexts = () => {
    const shortcut = t('spaceKey');
    playBtn.textContent = t('play', { shortcut });
    playBtn.title = shortcut;
    stopBtn.textContent = t('stop', { shortcut });
    stopBtn.title = shortcut;
  };
  document.addEventListener('langchange', updatePlayTexts);
  updatePlayTexts();

  store.onMessage((msg) => {
    messageText.textContent = msg;
    messageEl.style.display = 'flex';
    lastFocused = document.activeElement as HTMLElement | null;
    messageEl.focus();
    hideTimeout = window.setTimeout(() => {
      hideMessage();
    }, 3000);
  });

  store.subscribe(() => {
    updateToggleText();
    updateMarkerSelect();
    updateViewControls();
    updateTransposeInfo();
    tempoInput.value = String(store.tempo);
    updateMetronomeText();
    metronomeVolInput.value = String(store.metronomeVolume);
    masterVolInput.value = String(store.masterVolume);
    chordVolInput.value = String(store.chordVolume);
    chordWaveSelect.value = store.chordWave;
    updateThemeBtn();
    fontSizeInput.value = String(store.fontSize);
  });
  updateMarkerSelect();

  el.append(
    saveBtn,
    loadInput,
    pdfBtn,
    saveLibBtn,
    openLibBtn,
    templateLabel,
    templateBtn,
    toggleSecondaryBtn,
    transposeUpBtn,
    transposeDownBtn,
    transposeInfo,
    resetTransposeBtn,
    tempoLabel,
    masterVolLabel,
    chordVolLabel,
    chordWaveLabel,
    metronomeVolLabel,
    playBtn,
    stopBtn,
    loopBtn,
    metronomeBtn,
    instrumentLabel,
    accidentalLabel,
    themeBtn,
    fontSizeLabel,
    voltaLabel,
    clearVoltaBtn,
    markerLabel,
    syncBtn,
    langBtn,
    messageEl,
  );
  return el;
}
