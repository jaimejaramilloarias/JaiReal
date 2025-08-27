import { store } from '../../state/store';

export function Header(): HTMLElement {
  const el = document.createElement('header');
  const title = document.createElement('h1');
  title.className = 'chart-title';

  const renderTitle = () => {
    title.textContent = store.chart.title || 'Untitled';
  };

  renderTitle();
  store.subscribe(renderTitle);

  el.append(title);
  return el;
}
