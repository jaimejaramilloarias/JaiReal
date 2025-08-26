export type Lang = 'es' | 'en';

const translations: Record<Lang, Record<string, string>> = {
  es: {
    online: 'En línea',
    offline: 'Sin conexión',
    toggleLang: 'EN',
    toggleLangTitle: 'Cambiar a inglés',
    closeMessage: 'Cerrar mensaje',
    saveJson: 'Guardar JSON',
    exportPdf: 'Exportar PDF',
    saveLibrary: 'Guardar en biblioteca',
    openLibrary: 'Abrir de biblioteca',
    templateLabel: 'Plantilla:',
    newFromTemplate: 'Nueva desde plantilla',
    showSecondary: 'Mostrar renglón secundario ({shortcut})',
    hideSecondary: 'Ocultar renglón secundario ({shortcut})',
    transposeUp: 'Transponer +1 ({s1}) / +12 ({s12})',
    transposeDown: 'Transponer -1 ({s1}) / -12 ({s12})',
    transposeLabel: 'Transposición:',
    resetTranspose: 'Reset Transposición',
    tempoLabel: 'Tempo ({shortcut}, {wheel}):',
    tempoTitle: '{shortcut}, rueda del ratón',
    wheel: 'rueda',
  },
  en: {
    online: 'Online',
    offline: 'Offline',
    toggleLang: 'ES',
    toggleLangTitle: 'Switch to Spanish',
    closeMessage: 'Close message',
    saveJson: 'Save JSON',
    exportPdf: 'Export PDF',
    saveLibrary: 'Save to library',
    openLibrary: 'Open from library',
    templateLabel: 'Template:',
    newFromTemplate: 'New from template',
    showSecondary: 'Show secondary line ({shortcut})',
    hideSecondary: 'Hide secondary line ({shortcut})',
    transposeUp: 'Transpose +1 ({s1}) / +12 ({s12})',
    transposeDown: 'Transpose -1 ({s1}) / -12 ({s12})',
    transposeLabel: 'Transposition:',
    resetTranspose: 'Reset Transposition',
    tempoLabel: 'Tempo ({shortcut}, {wheel}):',
    tempoTitle: '{shortcut}, mouse wheel',
    wheel: 'wheel',
  },
};

let currentLang: Lang = 'es';

export function t(key: string, vars?: Record<string, string>): string {
  let str = translations[currentLang][key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}

export function setLang(lang: Lang): void {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.dispatchEvent(new CustomEvent('langchange'));
}

export function getLang(): Lang {
  return currentLang;
}
