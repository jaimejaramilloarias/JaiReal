import { listCharts as listLibraryCharts } from '../../state/library';
import { t } from '../../i18n';

export function LibraryModal(onSelect: (id: string) => void): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'library-modal';

  const content = document.createElement('div');
  content.className = 'library-modal-content';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  const updateCloseText = () => {
    closeBtn.textContent = t('close');
  };
  updateCloseText();
  closeBtn.onclick = () => overlay.remove();
  document.addEventListener('langchange', updateCloseText);

  const titleLabel = document.createElement('label');
  const titleText = document.createTextNode('');
  const titleInput = document.createElement('input');
  titleLabel.append(titleText, titleInput);

  const tagLabel = document.createElement('label');
  const tagText = document.createTextNode('');
  const tagInput = document.createElement('input');
  tagLabel.append(tagText, tagInput);

  const updateTexts = () => {
    titleText.textContent = t('title') + ':';
    tagText.textContent = t('tag') + ':';
  };
  updateTexts();
  document.addEventListener('langchange', updateTexts);

  const list = document.createElement('ul');

  async function refresh() {
    const charts = await listLibraryCharts({
      title: titleInput.value || undefined,
      tag: tagInput.value || undefined,
    });
    while (list.firstChild) list.removeChild(list.firstChild);
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
