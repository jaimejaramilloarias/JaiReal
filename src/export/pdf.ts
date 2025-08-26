import jsPDF from 'jspdf';
import type { Chart } from '../core/model';

export function exportChartPDF(chart: Chart) {
  const doc = new jsPDF();
  let y = 10;
  doc.text(chart.title || 'Untitled', 10, y);
  y += 10;
  chart.sections.forEach((section) => {
    const name = section.name ? section.name + ':' : '';
    doc.text(name, 10, y);
    y += 10;
    section.measures.forEach((measure) => {
      const chords = measure.beats.map((b) => b.chord || '-').join(' ');
      doc.text(chords, 10, y);
      y += 10;
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    });
    y += 5;
  });
  doc.save('chart.pdf');
}
