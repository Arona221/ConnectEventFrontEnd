import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav *ngIf="totalPages > 1">
      <ul class="pagination justify-content-center">
        <!-- Bouton Précédent -->
        <li class="page-item" [class.disabled]="currentPage === 0">
          <a class="page-link" (click)="changePage(currentPage - 1)" [attr.aria-disabled]="currentPage === 0">
            &laquo; Précédent
          </a>
        </li>

        <!-- Numéros de page -->
        <li class="page-item" *ngFor="let page of pages" 
            [class.active]="page === currentPage + 1">
          <a class="page-link" (click)="changePage(page - 1)">
            {{ page }}
          </a>
        </li>

        <!-- Bouton Suivant -->
        <li class="page-item" [class.disabled]="currentPage === totalPages - 1">
          <a class="page-link" (click)="changePage(currentPage + 1)" [attr.aria-disabled]="currentPage === totalPages - 1">
            Suivant &raquo;
          </a>
        </li>
      </ul>
    </nav>
  `,
  styles: [`
    .page-link {
      cursor: pointer;
      margin: 0 5px;
      border-radius: 5px;
      transition: all 0.3s;
    }
    .page-item.active .page-link {
      background-color: #ff6600 ;
      border-color: #ff6600 ;
      color: white !important;
    }
    .page-link:hover {
      background-color: #e9ecef;
    }
    .page-item.disabled .page-link {
      cursor: not-allowed;
      opacity: 0.6;
    }
  `]
})
export class PaginationComponent {
  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Output() pageChanged = new EventEmitter<number>();

  get pages(): number[] {
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i + 1);
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.pageChanged.emit(page);
    }
  }
}