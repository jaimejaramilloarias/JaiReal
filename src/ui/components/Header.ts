import { t, getLang, setLang } from '../../i18n';
import { onSyncStatus, syncNow } from '../../state/sync';

export function Header(): HTMLElement {
  const el = document.createElement('header');
  const title = document.createElement('span');
  title.textContent = 'JaiReal-PRO';

  const status = document.createElement('span');
  status.className = 'net-status';

  const sync = document.createElement('span');
  sync.className = 'sync-status';

  const syncBtn = document.createElement('button');
  syncBtn.className = 'sync-now';

  const langBtn = document.createElement('button');
  langBtn.className = 'lang-toggle';

  const updateStatus = () => {
    status.textContent = navigator.onLine ? t('online') : t('offline');
  };

  const updateSyncBtn = () => {
    syncBtn.textContent = t('syncNow');
    syncBtn.title = t('syncNowTitle');
  };

  const updateLangBtn = () => {
    langBtn.textContent = t('toggleLang');
    langBtn.title = t('toggleLangTitle');
  };

  langBtn.onclick = () => {
    const next = getLang() === 'es' ? 'en' : 'es';
    setLang(next);
  };

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  document.addEventListener('langchange', () => {
    updateStatus();
    updateSyncBtn();
    updateLangBtn();
  });

  onSyncStatus((s) => {
    if (s === 'syncing') sync.textContent = t('syncing');
    else if (s === 'synced') sync.textContent = t('synced');
    else if (s === 'error') sync.textContent = t('syncError');
    else sync.textContent = '';
  });

  syncBtn.onclick = () => {
    syncNow().catch(() => {});
  };

  updateStatus();
  updateSyncBtn();
  updateLangBtn();

  el.append(title, status, sync, syncBtn, langBtn);
  return el;
}
