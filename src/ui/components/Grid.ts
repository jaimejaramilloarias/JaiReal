import { store } from '../../state/store';
import type { BeatSlot, Measure } from '../../core/model';

let beatClipboard: BeatSlot | null = null;
let measureClipboard: Measure | null = null;
let dragIndex: number | null = null;
let dragSection: number | null = null;

export function Grid(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'grid';

  const render = () => {
    el.innerHTML = '';
    store.chart.sections.forEach((section, sIdx) => {
      const sectionEl = document.createElement('div');
      sectionEl.className = 'section';
      const title = document.createElement('div');
      title.className = 'section-title';
      title.textContent = section.name;
      sectionEl.appendChild(title);

      const measureEls: HTMLElement[] = [];

      section.measures.forEach((measure, mIdx) => {
        const measureEl = document.createElement('div');
        measureEl.className = 'measure';
        measureEl.draggable = true;
        if (store.selectedSection === sIdx && store.selectedMeasure === mIdx) {
          measureEl.classList.add('selected');
        }
        measureEl.onclick = () => {
          store.selectMeasure(sIdx, mIdx);
        };
        measureEl.addEventListener('dragstart', (ev) => {
          ev.dataTransfer?.setData('text/plain', '');
          (ev.dataTransfer || ({} as DataTransfer)).effectAllowed = 'move';
          dragSection = sIdx;
          dragIndex = mIdx;
        });
        measureEl.addEventListener('dragover', (ev) => {
          ev.preventDefault();
          ev.dataTransfer!.dropEffect = 'move';
        });
        measureEl.addEventListener('dragenter', () => {
          measureEl.classList.add('drag-over');
        });
        measureEl.addEventListener('dragleave', () => {
          measureEl.classList.remove('drag-over');
        });
        measureEl.addEventListener('drop', (ev) => {
          ev.preventDefault();
          measureEl.classList.remove('drag-over');
          if (dragSection === sIdx && dragIndex !== null) {
            const measures = section.measures;
            const [m] = measures.splice(dragIndex, 1);
            let insertAt = mIdx;
            if (dragIndex < mIdx) insertAt--;
            measures.splice(insertAt, 0, m);
            store.setChart(store.chart);
          }
          dragIndex = null;
          dragSection = null;
        });

        if (measure.markers && measure.markers.length) {
          const markerEl = document.createElement('div');
          markerEl.className = 'markers';
          markerEl.textContent = measure.markers.join(' ');
          measureEl.appendChild(markerEl);
        }

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
          secondaryEl.style.display = store.showSecondary ? '' : 'none';
          secondaryEl.oninput = () => {
            beat.secondary = secondaryEl.textContent || '';
            store.setChart(store.chart);
          };

          const handleKey = async (ev: KeyboardEvent) => {
            // Beat copy/paste
            if (ev.ctrlKey && ev.shiftKey && ev.key === 'c') {
              const data = { chord: beat.chord, secondary: beat.secondary };
              beatClipboard = { ...data };
              try {
                await navigator.clipboard.writeText(JSON.stringify(data));
              } catch {
                // ignore clipboard errors
              }
              ev.preventDefault();
              return;
            }
            if (ev.ctrlKey && ev.shiftKey && ev.key === 'v') {
              ev.preventDefault();
              let text = '';
              try {
                text = await navigator.clipboard.readText();
              } catch {
                // ignore
              }
              try {
                const data = JSON.parse(text) as BeatSlot;
                beat.chord = data.chord || '';
                beat.secondary = data.secondary;
                beatClipboard = { ...data };
              } catch {
                if (beatClipboard) {
                  beat.chord = beatClipboard.chord;
                  beat.secondary = beatClipboard.secondary;
                }
              }
              chordEl.textContent = beat.chord;
              secondaryEl.textContent = beat.secondary || '';
              store.setChart(store.chart);
              return;
            }

            // Measure copy/paste
            if (ev.ctrlKey && ev.altKey && ev.key === 'c') {
              const data = { beats: measure.beats.map((b) => ({ ...b })) };
              measureClipboard = JSON.parse(JSON.stringify(data));
              try {
                await navigator.clipboard.writeText(JSON.stringify(data));
              } catch {
                // ignore
              }
              ev.preventDefault();
              return;
            }
            if (ev.ctrlKey && ev.altKey && ev.key === 'v') {
              ev.preventDefault();
              let text = '';
              try {
                text = await navigator.clipboard.readText();
              } catch {
                // ignore
              }
              let data: Measure | null = null;
              try {
                data = JSON.parse(text) as Measure;
              } catch {
                data = measureClipboard;
              }
              if (data && Array.isArray(data.beats)) {
                measure.beats = data.beats.map((b) => ({
                  chord: b.chord || '',
                  secondary: b.secondary,
                }));
                measureClipboard = JSON.parse(JSON.stringify(data));
                store.setChart(store.chart);
              }
            }
          };

          chordEl.addEventListener('keydown', handleKey);
          secondaryEl.addEventListener('keydown', handleKey);

          slot.appendChild(chordEl);
          slot.appendChild(secondaryEl);
          measureEl.appendChild(slot);
        }

        measureEls.push(measureEl);
        sectionEl.appendChild(measureEl);
      });

      const voltaContainer = document.createElement('div');
      voltaContainer.className = 'volta-container';
      sectionEl.appendChild(voltaContainer);

      el.appendChild(sectionEl);

      requestAnimationFrame(() => {
        voltaContainer.innerHTML = '';
        section.measures.forEach((measure, mIdx) => {
          if (measure.volta && measure.volta.from === mIdx) {
            const startEl = measureEls[mIdx];
            const endEl = measureEls[measure.volta.to];
            if (!startEl || !endEl) return;
            const voltaEl = document.createElement('div');
            voltaEl.className = 'volta';
            voltaEl.textContent = `${measure.volta.number}ª`;
            const left = startEl.offsetLeft;
            const width = endEl.offsetLeft + endEl.offsetWidth - left;
            voltaEl.style.left = `${left}px`;
            voltaEl.style.width = `${width}px`;
            voltaContainer.appendChild(voltaEl);
          }
        });
      });
    });
  };

  render();
  store.subscribe(render);
  return el;
}
