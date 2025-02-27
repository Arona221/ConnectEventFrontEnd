import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BilletService } from '../../core/service/billet.service';

@Component({
  selector: 'app-payment-confirm',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div *ngIf="isLoading" class="text-center">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2">Vérification du paiement...</p>
      </div>
      
      <div *ngIf="paymentStatus" class="alert alert-success">
        <h4 class="alert-heading">Paiement confirmé !</h4>
        <p>Référence: {{referenceTransaction}}</p>
        <p>Montant: {{paymentStatus.montantTotal | currency:'XOF'}}</p>
      </div>
    </div>
  `
})
export class PaymentConfirmComponent implements OnInit {
  referenceTransaction!: string;
  paymentStatus: any;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private billetService: BilletService
  ) {}

  ngOnInit() {
    this.referenceTransaction = this.route.snapshot.paramMap.get('reference') || '';
    
    if (this.referenceTransaction) {
      this.billetService.verifierPaiement(this.referenceTransaction).subscribe({
        next: (response) => {
          this.paymentStatus = response;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
    }
  }
}