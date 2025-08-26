import './style.css';
import { Header } from './ui/components/Header';
import { Rail } from './ui/components/Rail';
import { Grid } from './ui/components/Grid';
import { Controls } from './ui/components/Controls';
import { store } from './state/store';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.append(Header(), Rail(), Grid(), Controls());

window.addEventListener('keydown', (ev) => {
  if (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === 'l') {
    store.toggleSecondary();
    ev.preventDefault();
    return;
  }
  if (ev.ctrlKey && ev.key === 'ArrowUp') {
    store.transpose(1);
    ev.preventDefault();
    return;
  }
  if (ev.ctrlKey && ev.key === 'ArrowDown') {
    store.transpose(-1);
    ev.preventDefault();
  }
});
