export function Header(): HTMLElement {
  const el = document.createElement('header');
  const title = document.createElement('span');
  title.textContent = 'JaiReal-PRO';
  const status = document.createElement('span');
  status.className = 'net-status';
  const update = () => {
    status.textContent = navigator.onLine ? 'En línea' : 'Sin conexión';
  };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
  el.append(title, status);
  return el;
}
