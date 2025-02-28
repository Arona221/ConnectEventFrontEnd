import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Utilisation d'un setter pour assigner vfs sans modifier directement l'import
export function initializePdfMake() {
  const pdfMakeInstance = { ...pdfMake };
  pdfMakeInstance.vfs = (pdfFonts as any).pdfMake.vfs;
  return pdfMakeInstance;
}


