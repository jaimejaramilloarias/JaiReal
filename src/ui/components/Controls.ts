import { store } from '../../state/store';
import type { Marker } from '../../core/model';

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
  function hideMessage() {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = undefined;
    }
    messageText.textContent = '';
    messageEl.style.display = 'none';
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
    messageEl.focus();
    hideTimeout = window.setTimeout(() => {
      hideMessage();
    }, 3000);
  });

  store.subscribe(() => {
    updateToggleText();
    updateMarkerSelect();
  });
  updateMarkerSelect();

  markerLabel.appendChild(markerSelect);
  el.append(saveBtn, loadInput, toggleSecondaryBtn, markerLabel, messageEl);
  return el;
}
