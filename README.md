# JaiReal-PRO

Editor de cifrados orientado a trabajo offline.
Incluye reproducción básica de acordes con la Web Audio API.
Soporta plantillas AABA, Blues, Rhythm Changes e Intro-Tag-Out, además de
voltas de 1ª y 2ª con rango.

## Requisitos

- Node.js 18+

## Instalación

```bash
npm install
```

## Configuración de Supabase

Copia `.env.example` a `.env` y coloca las credenciales de tu proyecto
Supabase:

```bash
cp .env.example .env
# Edita .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
```

El archivo `supabase/schema.sql` contiene el modelo de tablas y políticas de
seguridad recomendadas.

## Desarrollo

```bash
npm run dev
```

Visita <http://localhost:5173> en tu navegador.

## Pruebas

```bash
npm test
npm run test:e2e
```

## Lint

```bash
npm run lint
```

## Atajos de teclado

- `Ctrl+Shift+L`: alterna la visibilidad del renglón secundario.
