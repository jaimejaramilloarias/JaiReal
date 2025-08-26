import './style.css';
import { Header } from './ui/components/Header';
import { Rail } from './ui/components/Rail';
import { Grid } from './ui/components/Grid';
import { Controls } from './ui/components/Controls';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.append(Header(), Rail(), Grid(), Controls());
