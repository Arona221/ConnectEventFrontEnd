import { MatPaginatorIntl } from '@angular/material/paginator';

export class FrenchPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Éléments par page';
  override nextPageLabel = 'Page suivante';
  override previousPageLabel = 'Page précédente';
  override firstPageLabel = 'Première page';
  override lastPageLabel = 'Dernière page';

  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0) {
      return 'Page 1 sur 1';
    }
    const amountPages = Math.ceil(length / pageSize);
    return `Page ${page + 1} sur ${amountPages}`;
  };
}