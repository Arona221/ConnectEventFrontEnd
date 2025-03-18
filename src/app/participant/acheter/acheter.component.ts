import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { EvenementService } from '../../core/service/evenement.service';
import { BilletService } from '../../core/service/billet.service';
import { EvenementDTO } from '../../core/model/EvenementDTO';
import { CommonModule } from '@angular/common';
import { BilletDTO } from '../../core/model/BilletDTO';
import { FormsModule } from '@angular/forms';
import { FactureResponse } from '../../core/model/FactureResponse';
import { BilletItemDTO, BilletSelectionDTO } from '../../core/model/billet-selection.model';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../core/service/notification.service';

@Component({
  selector: 'app-acheter',
  templateUrl: './acheter.component.html',
  styleUrls: ['./acheter.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive]
})
export class AcheterComponent implements OnInit {
  nomUtilisateur: string | null = '';
  private countSubscription!: Subscription;
  notificationsCount: number = 0;
  notifications: { read: boolean }[] = [];
  event: EvenementDTO | null = null;
  billets: BilletDTO[] = [];
  total: number = 0;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  modePaiement: string = 'PAYDUNYA';
  processingPayment: boolean = false;
  selectedBillets: BilletItemDTO[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public eventService: EvenementService,
    private billetService: BilletService,
    private notificationService: NotificationService
  ) {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur');
  }

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEvent(+eventId);
    } else {
      this.handleError("ID d'événement manquant");
    }
    this.loadNotifications();

    this.countSubscription = this.notificationService.notificationCount$
    .subscribe(count => {
      // Mettre à jour le badge de la navbar
      this.notificationsCount = count;
    });
  }
  private loadNotifications(): void {
    const userId = parseInt(localStorage.getItem('idUtilisateur') || '0', 10);
    this.notificationService.getNotifications(userId).subscribe({
      next: (data) => {
        this.notifications = data;
        this.updateUnreadCount();
      },
      error: (err) => console.error('Error loading notifications:', err)
    });
  }
  private updateUnreadCount(): void {
    const count = this.notifications.filter(n => !n.read).length;
    this.notificationService.updateUnreadCount(count);
  }

  private loadEvent(eventId: number): void {
    this.isLoading = true;
    this.eventService.getEvenementById(eventId).subscribe({
      next: (event) => this.handleEventResponse(event),
      error: (err) => this.handleError("Erreur lors du chargement de l'événement", err)
    });
  }

  private handleEventResponse(event: EvenementDTO): void {
    if (!event) {
      this.handleError("Événement non trouvé");
      return;
    }
    
    this.event = event;
    this.initializeBillets(event);
    this.isLoading = false;
  }

  private initializeBillets(event: EvenementDTO): void {
    console.log("📢 Billets récupérés depuis l'événement:", event.billets);
    this.billets = event.billets?.map(b => ({
        id: b.id ? Number(b.id) : 0,
        typeBillet: b.typeBillet,
        prix: b.prix,
        quantite: 0
    })) || [];
}

  private handleError(message: string, error?: any): void {
    console.error(error);
    this.errorMessage = message;
    this.isLoading = false;
  }

  updateQuantity(billet: BilletDTO, change: number): void {
    const newQuantity = Math.max(0, (billet.quantite || 0) + change);
    billet.quantite = newQuantity;
    
    // Mise à jour de la sélection
    this.selectedBillets = this.billets
      .filter(b => b.quantite > 0)
      .map(b => ({
        billetId: Number(b.id) || 0, // Vérification stricte
        quantite: b.quantite
      }));

    this.calculateTotal();
  }

  calculateTotal(): void {
    this.total = this.billets.reduce((acc, billet) => 
      acc + (billet.quantite * billet.prix), 0);
  }

  proceedToPayment(): void {
    this.processingPayment = true;
    this.errorMessage = null;

    const selectedBillets = this.billets
      .filter(billet => billet.quantite > 0)
      .map(billet => ({
        billetId: Number(billet.id) || 0, // Vérification stricte
        quantite: billet.quantite
      }));

    // 🔥 Debug : Vérifier si billetId est null
    selectedBillets.forEach(b => {
      if (!b.billetId) {
        console.error("⚠️ Erreur: Un billet a un ID NULL !", b);
      }
    });

    if (selectedBillets.length === 0) {
      this.errorMessage = "Veuillez sélectionner au moins un billet";
      this.processingPayment = false;
      return;
    }

    const evenementId = this.event?.id_evenement || this.event?.id_evenement; // Vérification des deux formats possibles
    if (!evenementId) {
      console.error("⚠️ ID de l'événement est NULL !", this.event);
      this.errorMessage = "ID d'événement invalide";
      this.processingPayment = false;
      return;
    }

    const participantId = Number(localStorage.getItem('idUtilisateur'));
    if (!participantId) {
      console.error("⚠️ ID du participant est NULL !");
      this.errorMessage = "Veuillez vous reconnecter";
      this.processingPayment = false;
      return;
    }

    const billetSelection: BilletSelectionDTO = {
      evenementId: evenementId,
      participantId: participantId,
      billets: selectedBillets,
      modePaiement: this.modePaiement as 'PAYDUNYA' | 'WAVE'
    };

    console.log("📢 Données envoyées à l'API:", JSON.stringify(billetSelection, null, 2));

    this.billetService.acheterBillets(billetSelection).subscribe({
      next: (response) => this.handlePaymentSuccess(response),
      error: (err) => this.handlePaymentError(err)
    });
  }

  private handlePaymentSuccess(response: FactureResponse): void {
    this.processingPayment = false;
    if (response.invoiceUrl) {
      const newWindow = window.open(response.invoiceUrl, '_blank');
      if (!newWindow) {
        this.errorMessage = "Veuillez autoriser les popups pour le paiement";
      }
    }
  }

  private handlePaymentError(error: any): void {
    console.error('❌ Erreur de paiement:', error);
    this.errorMessage = error.error?.message || 'Erreur lors du traitement du paiement';
    this.processingPayment = false;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

