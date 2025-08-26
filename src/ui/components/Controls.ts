import { store } from '../../state/store';
import type { Marker } from '../../core/model';
import { playChart, stopPlayback } from '../../audio/player';

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
  tempoLabel.textContent = 'Tempo: ';
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
  tempoLabel.appendChild(tempoInput);

  const playBtn = document.createElement('button');
  playBtn.textContent = 'Reproducir';
  playBtn.onclick = () => {
    playChart(store.chart, store.tempo);
  };

  const stopBtn = document.createElement('button');
  stopBtn.textContent = 'Detener';
  stopBtn.onclick = () => {
    stopPlayback();
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
  });
  updateMarkerSelect();

  markerLabel.appendChild(markerSelect);
  el.append(
    saveBtn,
    loadInput,
    toggleSecondaryBtn,
    transposeUpBtn,
    transposeDownBtn,
    transposeInfo,
    resetTransposeBtn,
    tempoLabel,
    playBtn,
    stopBtn,
    instrumentLabel,
    instrumentSelect,
    accidentalLabel,
    accidentalSelect,
    markerLabel,
    messageEl,
  );
  return el;
}
