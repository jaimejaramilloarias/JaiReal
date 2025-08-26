import { store } from '../../state/store';
import type { BeatSlot } from '../../core/model';

let clipboard: BeatSlot | null = null;

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
          const beat = measure.beats[b];
          const slot = document.createElement('div');
          slot.className = 'slot';

          const chordEl = document.createElement('div');
          chordEl.className = 'chord';
          chordEl.contentEditable = 'true';
          chordEl.textContent = beat.chord;
          chordEl.oninput = () => {
            beat.chord = chordEl.textContent || '';
            store.setChart(store.chart);
          };

          const secondaryEl = document.createElement('div');
          secondaryEl.className = 'secondary';
          secondaryEl.contentEditable = 'true';
          secondaryEl.textContent = beat.secondary || '';
          secondaryEl.oninput = () => {
            beat.secondary = secondaryEl.textContent || '';
            store.setChart(store.chart);
          };

          const handleKey = (ev: KeyboardEvent) => {
            if (ev.ctrlKey && ev.shiftKey && ev.key === 'c') {
              clipboard = { chord: beat.chord, secondary: beat.secondary };
              ev.preventDefault();
            }
            if (ev.ctrlKey && ev.shiftKey && ev.key === 'v') {
              if (clipboard) {
                beat.chord = clipboard.chord;
                beat.secondary = clipboard.secondary;
                chordEl.textContent = beat.chord;
                secondaryEl.textContent = beat.secondary || '';
                store.setChart(store.chart);
              }
              ev.preventDefault();
            }
          };

          chordEl.addEventListener('keydown', handleKey);
          secondaryEl.addEventListener('keydown', handleKey);

          slot.appendChild(chordEl);
          slot.appendChild(secondaryEl);
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
