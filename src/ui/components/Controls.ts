import { store } from '../../state/store';

export function Controls(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'controls';

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
  const updateToggleText = () => {
    toggleSecondaryBtn.textContent = store.showSecondary
      ? 'Ocultar renglón secundario'
      : 'Mostrar renglón secundario';
  };
  updateToggleText();
  toggleSecondaryBtn.onclick = () => {
    store.toggleSecondary();
    updateToggleText();
  };

  el.append(saveBtn, loadInput, toggleSecondaryBtn);
  return el;
}
