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

      section.measures.forEach((measure) => {
        const measureEl = document.createElement('div');
        measureEl.className = 'measure';

        for (let b = 0; b < 4; b++) {
          if (!measure.beats[b]) {
            measure.beats[b] = { chord: '' };
          }
          const slot = document.createElement('div');
          slot.className = 'slot';
          slot.contentEditable = 'true';
          slot.textContent = measure.beats[b].chord;
          slot.oninput = () => {
            measure.beats[b].chord = slot.textContent || '';
            store.setChart(store.chart);
          };
          measureEl.appendChild(slot);
        }

        sectionEl.appendChild(measureEl);
      });

      el.appendChild(sectionEl);
    });
  };

  render();
  store.subscribe(render);
  return el;
}
