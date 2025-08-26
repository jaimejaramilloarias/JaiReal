PLAN DE TAREAS — EDITOR DE CIFRADOS: "JaiReal-PRO" (Checklist para CODEX) — con ONLINE
Autor: Jaime Jaramillo Arias — Fecha: 2025-08-25

Convenciones: [ ] pendiente · [x] hecho

0. Lineamientos Técnicos Generales
   [x] Vite + TypeScript + HTML/CSS; ESLint+Prettier; TS strict; arquitectura modular; Vitest+Playwright.
   0B) Documentación
   [x] README con instrucciones básicas.

1. Inicialización
   [x] Proyecto Vite TS + CI.

2. Modelo de Datos
   [x] Tipos BeatSlot/Measure/Section/Chart/Markers/Volta; schemaVersion; tests.

3. Estado y Persistencia Local
   [x] Store + autosave local; abrir/guardar JSON.

4. UI Base
   [x] Encabezado, riel, grid de compases, controles.
   4B) Estilos responsivos
   [x] CSS responsive mínimo.

5. Edición 4 acordes/compás
   [x] Slots 1–4 contenteditable.
   [x] Atajos; copiar/pegar.
   5B) Copiar/pegar compases completos y portapapeles del sistema
   [x] Hecho.
   5C) Arrastrar para reordenar compases
   [x] Hecho.
   5D) Indicador visual al arrastrar compases
   [ ] Pendiente.

6. Renglón secundario
   [x] Por beat; estilo pequeño; persistencia.
   6B) Imprimir renglón secundario
   [x] Hecho.
   6C) Toggle de visibilidad del renglón secundario
   [ ] Pendiente.

7. Marcadores
   [ ] %, ||:, :||, Segno/Coda/Fine/D.C./D.S./To Coda con toolbar y reglas.

8. Voltas
   [ ] 1ª/2ª con rango; overlay y persistencia.

9. Transposición
   [ ] Semitonos + vistas Concierto/Bb/Eb/F; ♯/♭.

10. Plantillas
    [ ] AABA/Blues/Rhythm Changes/Intro-Tag-Out.

11. Exportación
    [ ] PDF; (PNG/SVG en v1).

12. Biblioteca local
    [ ] IndexedDB; etiquetas + búsqueda básica.

13. Importadores
    [ ] ChordPro/iReal/CSV; tests.

14. Preferencias/Vista
    [ ] Tema, fuentes/tamaños, ♯/♭.

15. PWA / Offline
    [ ] Service Worker + manifest; app shell offline; onLine indicator.

15B) Online / Sincronización y Nube
Objetivo: offline-first con sync en la nube, compartir y backups.

15B.1 Backend (elegir Supabase o Firebase)
[ ] Proyecto creado, SDK, .env, reglas de seguridad.

15B.2 Modelo servidor
[ ] users, charts, revisions, shares, collections, tags; índices.

15B.3 Sincronización
[ ] Outbox IndexedDB con clientMutationId; LWW; pull/push delta; reintentos; UI de estado; conflictos básicos.

15B.4 Autenticación y permisos
[ ] Email/Google; roles owner/editor/commenter/reader; enlaces revocables; auditoría mínima.

15B.5 Biblioteca cloud
[ ] Listado con filtros; favoritos/archivados/papelera; backups diarios.

15B.6 Import/Export online
[ ] Parse en worker; export por lotes (PDF/ZIP) con cola.

15B.7 Seguridad
[ ] HTTPS, CSP, SameSite, rate-limits, size-limits, backups/restore por chart.

15B.8 UX de red
[ ] Indicadores de red y sync; Forzar sync; Resolver conflicto.

Criterios de aceptación (15B)
[ ] Login → editar offline → reconectar → sync automático ok.
[ ] Compartir enlace de lectura y revocar acceso.
[ ] Conflictos detectados con opción “local” o “remoto”.

16. Accesibilidad e i18n
    [ ] Teclado, roles/aria, atajos; ES/EN.

17. QA/E2E
    [ ] Vitest (modelo/transpose/parsers); Playwright (MVP y flujos online); CI artefactos.

18. Estándares
    [ ] TS estricto, lógica pura en core, sin innerHTML, eventos delegados, Conventional Commits.

19. Hitos
    [ ] MVP: 1–8,10,11(PDF),12(min),15(PWA),17 parcial,18.
    [ ] v1: 9,11(PNG/SVG),13,14,15B (sync+share lectura),16,17 completo.
    [ ] v2: colaboración tiempo real, LMS, lote PDF/ZIP, diffs y merge por compás.
