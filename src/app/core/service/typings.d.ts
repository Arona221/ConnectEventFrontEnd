declare module 'pdfmake/build/pdfmake' {
    export interface TCreatedPdf {
      download: (defaultFileName?: string) => void;
    }
    export interface PdfMakeStatic {
      createPdf(documentDefinition: any): TCreatedPdf;
      vfs: any;
    }
    const pdfMake: PdfMakeStatic;
    export = pdfMake;
  }
  
  declare module 'pdfmake/build/vfs_fonts' {
    export const pdfFonts: any;
  }