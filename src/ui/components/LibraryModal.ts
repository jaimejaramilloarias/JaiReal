import { listCharts as listLibraryCharts } from '../../state/library';
import { t } from '../../i18n';

export function LibraryModal(
  onSelect: (id: string) => void,
  opener?: HTMLElement,
): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'library-modal';

  const content = document.createElement('div');
  content.className = 'library-modal-content';
  content.setAttribute('role', 'dialog');
  content.setAttribute('aria-modal', 'true');

  const titleEl = document.createElement('h2');
  titleEl.id = 'library-modal-title';
  const updateTitle = () => {
    titleEl.textContent = t('library');
  };
  updateTitle();
  document.addEventListener('langchange', updateTitle);
  content.setAttribute('aria-labelledby', titleEl.id);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  const updateCloseText = () => {
    closeBtn.textContent = t('close');
  };
  updateCloseText();
  document.addEventListener('langchange', updateCloseText);

  function close() {
    overlay.remove();
    opener?.focus();
    overlay.removeEventListener('keydown', handleKey);
  }

  closeBtn.onclick = close;

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }
  overlay.addEventListener('keydown', handleKey);

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
        close();
      };
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  titleInput.addEventListener('input', refresh);
  tagInput.addEventListener('input', refresh);
  refresh();

  setTimeout(() => {
    titleInput.focus();
  });

  content.append(titleEl, closeBtn, titleLabel, tagLabel, list);
  overlay.appendChild(content);
  return overlay;
}
