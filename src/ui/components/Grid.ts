import { store } from '../../state/store';

export function Grid(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'grid';

  const render = () => {
    el.innerHTML = '';
    store.chart.sections.forEach((section) => {
      const sectionEl = document.createElement('div');
      sectionEl.className = 'section';
      const title = document.createElement('div');
      title.className = 'section-title';
      title.textContent = section.name;
      sectionEl.appendChild(title);

      section.measures.forEach(() => {
        const measureEl = document.createElement('div');
        measureEl.className = 'measure';
        sectionEl.appendChild(measureEl);
      });

      el.appendChild(sectionEl);
    });
  };

  render();
  store.subscribe(render);
  return el;
}
