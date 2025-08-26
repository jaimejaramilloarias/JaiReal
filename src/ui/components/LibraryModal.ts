import { listCharts as listLibraryCharts } from '../../state/library';

export function LibraryModal(onSelect: (id: string) => void): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'library-modal';

  const content = document.createElement('div');
  content.className = 'library-modal-content';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Cerrar';
  closeBtn.type = 'button';
  closeBtn.onclick = () => overlay.remove();

  const titleLabel = document.createElement('label');
  titleLabel.textContent = 'Título:';
  const titleInput = document.createElement('input');
  titleLabel.appendChild(titleInput);

  const tagLabel = document.createElement('label');
  tagLabel.textContent = 'Etiqueta:';
  const tagInput = document.createElement('input');
  tagLabel.appendChild(tagInput);

  const list = document.createElement('ul');

  async function refresh() {
    const charts = await listLibraryCharts({
      title: titleInput.value || undefined,
      tag: tagInput.value || undefined,
    });
    list.innerHTML = '';
    charts.forEach((c) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = `${c.title} [${c.tags.join(', ')}]`;
      btn.onclick = () => {
        onSelect(c.id);
        overlay.remove();
      };
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  titleInput.addEventListener('input', refresh);
  tagInput.addEventListener('input', refresh);
  refresh();

  content.append(closeBtn, titleLabel, tagLabel, list);
  overlay.appendChild(content);
  return overlay;
}
