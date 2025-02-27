declare module 'pdfmake/build/pdfmake' {
  interface TCreatedPdf {
    download: (defaultFileName?: string) => void;
  }

  interface TPdfMake {
    createPdf: (documentDefinition: any) => TCreatedPdf;
    vfs: any;
  }

  const pdfMake: TPdfMake;
  export = pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  export const pdfMake: { vfs: any };
} 