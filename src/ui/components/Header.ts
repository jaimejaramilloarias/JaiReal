import { t, getLang, setLang } from '../../i18n';

export function Header(): HTMLElement {
  const el = document.createElement('header');
  const title = document.createElement('span');
  title.textContent = 'JaiReal-PRO';

  const status = document.createElement('span');
  status.className = 'net-status';

  const langBtn = document.createElement('button');
  langBtn.className = 'lang-toggle';

  const updateStatus = () => {
    status.textContent = navigator.onLine ? t('online') : t('offline');
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
    updateLangBtn();
  });

  updateStatus();
  updateLangBtn();

  el.append(title, status, langBtn);
  return el;
}
