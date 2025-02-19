import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EvenementService } from '../../core/service/evenement.service';
import { EvenementDTO } from '../../core/model/EvenementDTO';
import { CommonModule } from '@angular/common';
import { BilletDTO } from '../../core/model/BilletDTO';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-acheter',
  templateUrl: './acheter.component.html',
  styleUrls: ['./acheter.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule]
})
export class AcheterComponent implements OnInit {
 
  nomUtilisateur: string | null = '';
  notificationsCount: number = 0;
  event: EvenementDTO | null = null;
  billets: BilletDTO[] = [];
  total: number = 0;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public eventService: EvenementService
  ) {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur');
  }

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      console.log("Récupération de l'événement avec ID:", eventId);
      this.isLoading = true;
      this.eventService.getEvenementById(+eventId).subscribe({
        next: (event) => {
          console.log("Événement récupéré:", event);
          if (!event) {
            this.errorMessage = "Événement non trouvé";
            this.isLoading = false;
            return;
          }
          
          this.event = event;
          
          // Formatage de la date si nécessaire
          if (event.date && typeof event.date === 'string') {
            event.date = new Date(event.date);
          }
          
          // Initialisation des billets avec vérification
          this.billets = event.billets ? event.billets.map(b => ({
            ...b,
            quantite: 0 // Initialiser la quantité à 0
          })) : [];
          
          console.log("Billets initialisés:", this.billets);
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Erreur lors de la récupération de l'événement:", err);
          this.errorMessage = "Erreur lors du chargement de l'événement";
          this.isLoading = false;
        }
      });
    } else {
      console.error("ID d'événement non trouvé dans l'URL");
      this.errorMessage = "ID d'événement manquant";
      this.isLoading = false;
    }
  }

  updateQuantity(billet: BilletDTO, change: number): void {
    const newQuantity = billet.quantite + change;
    if (newQuantity >= 0) {
      billet.quantite = newQuantity;
      this.calculateTotal();
    }
  }

  calculateTotal(): void {
    this.total = this.billets.reduce((acc, billet) => 
      acc + (billet.quantite * billet.prix), 0);
  }

  proceedToPayment(): void {
    if (this.total <= 0) {
      return;
    }
    
    // Logique de paiement
    const selectedTickets = this.billets
      .filter(b => b.quantite > 0)
      .map(b => ({
        type: b.typeBillet,
        quantity: b.quantite,
        price: b.prix
      }));
    
    console.log('Tickets sélectionnés:', selectedTickets);
    // Redirection vers le processus de paiement - à implémenter
    // this.router.navigate(['/paiement'], { state: { tickets: selectedTickets, total: this.total, eventId: this.event?.id_evenement } });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}