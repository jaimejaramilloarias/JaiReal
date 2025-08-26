import {
  listCharts as listLibraryCharts,
  markFavorite,
  setStatus,
} from '../../state/library';
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

  const favLabel = document.createElement('label');
  const favCheck = document.createElement('input');
  favCheck.type = 'checkbox';
  const favText = document.createTextNode('');
  favLabel.append(favCheck, favText);

  const statusLabel = document.createElement('label');
  const statusText = document.createTextNode('');
  const statusSelect = document.createElement('select');
  const optActive = document.createElement('option');
  optActive.value = 'active';
  const optArchived = document.createElement('option');
  optArchived.value = 'archived';
  const optTrashed = document.createElement('option');
  optTrashed.value = 'trashed';
  statusSelect.append(optActive, optArchived, optTrashed);
  statusLabel.append(statusText, statusSelect);

  const updateTexts = () => {
    titleText.textContent = t('title') + ':';
    tagText.textContent = t('tag') + ':';
    favText.textContent = t('favoritesOnly');
    statusText.textContent = t('statusFilter');
    optActive.textContent = t('status_active');
    optArchived.textContent = t('status_archived');
    optTrashed.textContent = t('status_trashed');
  };
  updateTexts();
  document.addEventListener('langchange', updateTexts);

  const list = document.createElement('ul');

  async function refresh() {
    const charts = await listLibraryCharts({
      title: titleInput.value || undefined,
      tag: tagInput.value || undefined,
      favorite: favCheck.checked ? true : undefined,
      status: statusSelect.value as 'active' | 'archived' | 'trashed',
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

      const favBtn = document.createElement('button');
      favBtn.type = 'button';
      const updateFavBtn = () => {
        favBtn.textContent = c.favorite ? '★' : '☆';
        favBtn.title = c.favorite ? t('unfavorite') : t('favorite');
      };
      updateFavBtn();
      favBtn.onclick = async (e) => {
        e.stopPropagation();
        await markFavorite(c.id, !c.favorite);
        await refresh();
      };
      li.appendChild(favBtn);

      if (c.status === 'active') {
        const archBtn = document.createElement('button');
        archBtn.type = 'button';
        archBtn.textContent = t('archive');
        archBtn.onclick = async (e) => {
          e.stopPropagation();
          await setStatus(c.id, 'archived');
          await refresh();
        };
        li.appendChild(archBtn);
        const trashBtn = document.createElement('button');
        trashBtn.type = 'button';
        trashBtn.textContent = t('trash');
        trashBtn.onclick = async (e) => {
          e.stopPropagation();
          await setStatus(c.id, 'trashed');
          await refresh();
        };
        li.appendChild(trashBtn);
      } else if (c.status === 'archived') {
        const restoreBtn = document.createElement('button');
        restoreBtn.type = 'button';
        restoreBtn.textContent = t('restore');
        restoreBtn.onclick = async (e) => {
          e.stopPropagation();
          await setStatus(c.id, 'active');
          await refresh();
        };
        li.appendChild(restoreBtn);
        const trashBtn = document.createElement('button');
        trashBtn.type = 'button';
        trashBtn.textContent = t('trash');
        trashBtn.onclick = async (e) => {
          e.stopPropagation();
          await setStatus(c.id, 'trashed');
          await refresh();
        };
        li.appendChild(trashBtn);
      } else if (c.status === 'trashed') {
        const restoreBtn = document.createElement('button');
        restoreBtn.type = 'button';
        restoreBtn.textContent = t('restore');
        restoreBtn.onclick = async (e) => {
          e.stopPropagation();
          await setStatus(c.id, 'active');
          await refresh();
        };
        li.appendChild(restoreBtn);
      }

      list.appendChild(li);
    });
  }

  titleInput.addEventListener('input', refresh);
  tagInput.addEventListener('input', refresh);
  favCheck.addEventListener('change', refresh);
  statusSelect.addEventListener('change', refresh);
  refresh();

  setTimeout(() => {
    titleInput.focus();
  });

  content.append(
    titleEl,
    closeBtn,
    titleLabel,
    tagLabel,
    favLabel,
    statusLabel,
    list,
  );
  overlay.appendChild(content);
  return overlay;
}
