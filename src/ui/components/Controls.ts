import { store } from '../../state/store';
import type { Marker } from '../../core/model';
import {
  playChart,
  stopPlayback,
  playSectionLoop,
  setMasterVolume,
} from '../../audio/player';
import { getTemplate, type TemplateName } from '../../core/templates';

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
  closeBtn.setAttribute('aria-label', 'Cerrar mensaje');
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
  saveBtn.textContent = 'Guardar JSON';
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

  const templateLabel = document.createElement('label');
  templateLabel.textContent = 'Plantilla: ';
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
  templateBtn.textContent = 'Nueva desde plantilla';
  templateBtn.onclick = () => {
    const name = templateSelect.value as TemplateName;
    store.setChart(getTemplate(name));
  };
  templateLabel.appendChild(templateSelect);

  const toggleSecondaryBtn = document.createElement('button');
  const shortcut = 'Ctrl+Shift+L';
  const updateToggleText = () => {
    toggleSecondaryBtn.textContent = store.showSecondary
      ? `Ocultar renglón secundario (${shortcut})`
      : `Mostrar renglón secundario (${shortcut})`;
    toggleSecondaryBtn.title = shortcut;
  };
  updateToggleText();
  toggleSecondaryBtn.onclick = () => {
    store.toggleSecondary();
  };

  const transposeUpBtn = document.createElement('button');
  const transposeUpShortcut = 'Ctrl+↑';
  const transposeOctUpShortcut = 'Ctrl+Alt+↑';
  transposeUpBtn.textContent = `Transponer +1 (${transposeUpShortcut}) / +12 (${transposeOctUpShortcut})`;
  transposeUpBtn.title = `${transposeUpShortcut} (+1), ${transposeOctUpShortcut} (+12)`;
  transposeUpBtn.onclick = () => {
    store.transpose(1);
  };

  const transposeDownBtn = document.createElement('button');
  const transposeDownShortcut = 'Ctrl+↓';
  const transposeOctDownShortcut = 'Ctrl+Alt+↓';
  transposeDownBtn.textContent = `Transponer -1 (${transposeDownShortcut}) / -12 (${transposeOctDownShortcut})`;
  transposeDownBtn.title = `${transposeDownShortcut} (-1), ${transposeOctDownShortcut} (-12)`;
  transposeDownBtn.onclick = () => {
    store.transpose(-1);
  };

  const transposeInfo = document.createElement('span');
  const updateTransposeInfo = () => {
    const val = store.manualTranspose;
    const sign = val > 0 ? '+' : '';
    transposeInfo.textContent = `Transposición: ${sign}${val}`;
  };
  updateTransposeInfo();

  const resetTransposeBtn = document.createElement('button');
  resetTransposeBtn.textContent = 'Reset Transposición';
  resetTransposeBtn.onclick = () => {
    store.resetTranspose();
  };

  const tempoLabel = document.createElement('label');
  const tempoShortcut = 'Ctrl+←/→';
  const tempoWheelHint = 'rueda';
  tempoLabel.textContent = `Tempo (${tempoShortcut}, ${tempoWheelHint}): `;
  tempoLabel.title = `${tempoShortcut}, rueda del ratón`;
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
  tempoLabel.appendChild(tempoInput);

  const masterVolLabel = document.createElement('label');
  const masterVolShortcut = 'Alt+Shift+↑/↓';
  masterVolLabel.textContent = `Volumen (${masterVolShortcut}): `;
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
  masterVolLabel.appendChild(masterVolInput);

  const metronomeBtn = document.createElement('button');
  const updateMetronomeText = () => {
    metronomeBtn.textContent = store.metronome
      ? 'Desactivar metrónomo'
      : 'Activar metrónomo';
  };
  updateMetronomeText();
  metronomeBtn.onclick = () => {
    store.toggleMetronome();
  };

  const metronomeVolLabel = document.createElement('label');
  const metronomeVolShortcut = 'Ctrl+Shift+↑/↓';
  metronomeVolLabel.textContent = `Volumen metrónomo (${metronomeVolShortcut}): `;
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
  metronomeVolLabel.appendChild(metronomeVolInput);

  const playBtn = document.createElement('button');
  const playShortcut = 'Espacio';
  playBtn.textContent = `Reproducir (${playShortcut})`;
  playBtn.title = playShortcut;
  playBtn.onclick = () => {
    setMasterVolume(store.masterVolume);
    playChart(store.chart, store.tempo, store.metronome, store.metronomeVolume);
  };

  const stopBtn = document.createElement('button');
  stopBtn.textContent = `Detener (${playShortcut})`;
  stopBtn.title = playShortcut;
  stopBtn.onclick = () => {
    stopPlayback();
  };

  const loopBtn = document.createElement('button');
  loopBtn.textContent = 'Repetir sección';
  loopBtn.onclick = () => {
    if (store.selectedSection !== null) {
      setMasterVolume(store.masterVolume);
      playSectionLoop(
        store.chart,
        store.selectedSection,
        store.tempo,
        store.metronome,
        store.metronomeVolume,
      );
    }
  };

  const instrumentLabel = document.createElement('label');
  instrumentLabel.textContent = 'Vista: ';
  const instrumentSelect = document.createElement('select');
  [
    ['C', 'Concierto'],
    ['Bb', 'Bb'],
    ['Eb', 'Eb'],
    ['F', 'F'],
  ].forEach(([value, text]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = text;
    instrumentSelect.appendChild(opt);
  });

  const accidentalLabel = document.createElement('label');
  accidentalLabel.textContent = 'Preferir: ';
  const accidentalSelect = document.createElement('select');
  [
    ['sharp', '♯'],
    ['flat', '♭'],
  ].forEach(([value, text]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = text;
    accidentalSelect.appendChild(opt);
  });

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

  const voltaLabel = document.createElement('label');
  voltaLabel.textContent = 'Volta: ';
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
  voltaFrom.placeholder = 'desde';
  const voltaTo = document.createElement('input');
  voltaTo.type = 'number';
  voltaTo.min = '1';
  voltaTo.placeholder = 'hasta';
  const voltaBtn = document.createElement('button');
  voltaBtn.textContent = 'Aplicar';
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
  clearVoltaBtn.textContent = 'Borrar voltas';
  clearVoltaBtn.onclick = () => {
    if (store.selectedSection === null) return;
    store.clearVolta(store.selectedSection, 1);
    store.clearVolta(store.selectedSection, 2);
  };
  voltaLabel.append(voltaSelect, voltaFrom, voltaTo, voltaBtn);

  const markerLabel = document.createElement('label');
  markerLabel.textContent = 'Marcador: ';
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
    opt.textContent = m || '(sin marcador)';
    markerSelect.appendChild(opt);
  });
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
  });
  updateMarkerSelect();

  markerLabel.appendChild(markerSelect);
  el.append(
    saveBtn,
    loadInput,
    templateLabel,
    templateBtn,
    toggleSecondaryBtn,
    transposeUpBtn,
    transposeDownBtn,
    transposeInfo,
    resetTransposeBtn,
    tempoLabel,
    masterVolLabel,
    metronomeVolLabel,
    playBtn,
    stopBtn,
    loopBtn,
    metronomeBtn,
    instrumentLabel,
    instrumentSelect,
    accidentalLabel,
    accidentalSelect,
    voltaLabel,
    clearVoltaBtn,
    markerLabel,
    messageEl,
  );
  return el;
}
