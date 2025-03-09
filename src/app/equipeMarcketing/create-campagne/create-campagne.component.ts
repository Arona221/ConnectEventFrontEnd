import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MarketingService } from '../../core/service/marketing.service';
import { MessageMarketingUpdate, Canal } from '../../core/model/message-marketing-update.model';
import { SegmentAudienceUpdate } from '../../core/model/segment-audience-update.model';
import { CommonModule } from '@angular/common';
import { EvenementDTO } from '../../core/model/EvenementDTO';

@Component({
  selector: 'app-create-campagne',
  templateUrl: './create-campagne.component.html',
  styleUrls: ['./create-campagne.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive]
})
export class CreateCampagneComponent implements OnInit {
  campaignForm: FormGroup;
  eventId!: number;
  isLoading = false;
  isLoadingMessage = false;
  errorMessage: string | null = null;
  generatedMessage: MessageMarketingUpdate | null = null;
  isMenuOpen = false;
  nomUtilisateur: string | null = '';
  evenementDetails: EvenementDTO | null = null;
  allCampagnes: { [key: string]: any[] } = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private marketingService: MarketingService
  ) {
    // Formulaire de création de campagne
    this.campaignForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      budget: ['', [Validators.required, Validators.min(100)]],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      expediteurEmail: ['', [Validators.required, Validators.email]], // Nouveau champ pour l'email de l'expéditeur
      critere1: ['', Validators.required],
      critere2: ['', Validators.required],
      contacts: this.fb.array([]) // Formulaire dynamique pour les contacts
    }, { validator: this.dateValidator });
  }

  ngOnInit(): void {
    this.eventId = +this.route.snapshot.queryParams['eventId'];
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur');
    this.loadEventDetails();
    
    
    // Pré-remplir l'email de l'expéditeur avec celui de l'utilisateur connecté s'il existe
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      this.campaignForm.get('expediteurEmail')?.setValue(userEmail);
    }
  }
  
  generateMessage(): void {
    this.isLoadingMessage = true;
    
    // Appel unique qui génère ET sauvegarde le message
    this.marketingService.generateMessage(this.eventId).subscribe({
      next: (savedMessage) => {
        this.generatedMessage = savedMessage; // Message déjà persisté avec ID
        this.isLoadingMessage = false;
      },
      error: (err) => {
        console.error('Erreur génération message:', err);
        this.isLoadingMessage = false;
        this.errorMessage = 'Erreur lors de la génération du message.';
      }
    });
  }

  // Ajouter un contact
  addContact(): void {
    const contactGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      prenom: ['', Validators.required],
      nom: ['', Validators.required]
    });
    this.contactsFormArray.push(contactGroup);
  }

  // Getter pour le FormArray des contacts
  get contactsFormArray(): FormArray {
    return this.campaignForm.get('contacts') as FormArray;
  }

  // Validation des dates
  private dateValidator(group: FormGroup): { [key: string]: any } | null {
    const start = new Date(group.get('dateDebut')?.value);
    const end = new Date(group.get('dateFin')?.value);
    return start && end && start >= end ? { invalidDates: true } : null;
  }

  // Soumission du formulaire de création de campagne
  onSubmit() {
    if (this.campaignForm.valid) {
      this.isLoading = true;

      // 1. Créer le Segment
      const segmentData = {
        criteres: [this.campaignForm.value.critere1, this.campaignForm.value.critere2],
        contacts: this.campaignForm.value.contacts
      };
      
      this.marketingService.createSegment(segmentData).subscribe({
        next: (savedSegment) => {
          console.log('Segment créé:', savedSegment);
          if (!this.generatedMessage?.idMessage) {
            this.errorMessage = 'Veuillez générer un message avant de soumettre la campagne.';
            this.isLoading = false;
            return;
          }
          
          // 2. Créer la Campagne avec les IDs existants
          const campaignData = {
            nom: this.campaignForm.value.nom,
            budget: this.campaignForm.value.budget,
            dateDebut: this.campaignForm.value.dateDebut + 'T00:00:00',
            dateFin: this.campaignForm.value.dateFin + 'T23:59:59',
            expediteurEmail: this.campaignForm.value.expediteurEmail, // Ajout de l'email de l'expéditeur
            statut: 'Planifier', // Définition explicite du statut par défaut
            evenement: { id_evenement: this.eventId },
            message: { idMessage: this.generatedMessage.idMessage },
            segment: { id_segment: savedSegment.id_segment } // ◄ Structure plate
          };
          console.log('Données Campagne:', campaignData); 

          // 3. Envoyer la Campagne
          this.marketingService.createCampagne(campaignData).subscribe({
            next: () => {
              this.router.navigate(['/evenements-promouvoir']);
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Erreur création campagne:', err);
              this.isLoading = false;
              this.errorMessage = 'Erreur lors de la création de la campagne.';
            }
          });
        },
        error: (err) => {
          console.error('Erreur création segment:', err);
          this.isLoading = false;
          this.errorMessage = 'Erreur lors de la création du segment.';
        }
      });
    }
  }

  // Toggle menu
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Logout
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }

  // Navigation vers la liste des campagnes
  navigateToMesCampagnes(): void {
    this.router.navigate(['/evenements-promouvoir']);
  }
  private loadEventDetails(): void {
    this.marketingService.getEventDetails(this.eventId).subscribe({
      next: (event) => {
        this.evenementDetails = event;
      },
      error: (err) => {
        console.error('Erreur chargement événement:', err);
        this.errorMessage = 'Impossible de charger les détails de l\'événement';
      }
    });
  }
  getCampaignCount(status: string): number {
    return (this.allCampagnes[status] || []).length;
  }
}