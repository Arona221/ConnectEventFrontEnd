  import { Component, OnInit, OnDestroy } from '@angular/core';
  import { NotificationService } from '../../core/service/notification.service';
  import { Observable, Subject } from 'rxjs';
  import { Router, RouterLink, RouterLinkActive } from '@angular/router';
  import { CommonModule } from '@angular/common';
  import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
  import { MatSnackBar } from '@angular/material/snack-bar';
  import { NotificationDTO } from '../../core/model/notification.model';
  import { takeUntil } from 'rxjs/operators';
  import { MatCardModule } from '@angular/material/card';
  import { MatSelectModule } from '@angular/material/select';
  import { MatInputModule } from '@angular/material/input';
  import { MatButtonModule } from '@angular/material/button';
  import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

  @Component({
    selector: 'app-envoyermessage',
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      MatCardModule,
      MatSelectModule,
      MatInputModule,
      MatButtonModule,
      MatProgressSpinnerModule,
      RouterLink,
      RouterLinkActive
    ],
    template: `
      <!DOCTYPE html>
  <html lang="fr">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Éditer un événement</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  </head>
  <body>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div class="container-fluid">
          <a class="navbar-brand" routerLink="/acceuil-organisateur">
              <i class="fas fa-user-cog"></i> Organisateur
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" title="Menu">
              <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav ms-auto">
                  <li class="nav-item">
                      <a class="nav-link" routerLink="/ajouter-evenement" routerLinkActive="active">
                          <i class="fas fa-plus-circle"></i> Ajouter un événement
                      </a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link" routerLink="/gerer-evenements" routerLinkActive="active">
                          <i class="fas fa-tools"></i> Gérer événements
                      </a>
                  </li>
                  <li class="nav-item dropdown">
                      <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" routerLinkActive="active">
                          <i class="fas fa-calendar-check"></i> Ressources
                      </a>
                      <ul class="dropdown-menu">
                          <li>
                              <a class="dropdown-item" routerLink="/trouver-ressources" routerLinkActive="active">
                                  <i class="fas fa-search"></i> Trouver des ressources
                              </a>
                          </li>
                          <li>
                              <a class="dropdown-item" routerLink="/mes-ressources" routerLinkActive="active">
                                  <i class="fas fa-list"></i> Mes ressources réservées
                              </a>
                          </li>
                      </ul>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link" routerLink="/statistiques" routerLinkActive="active">
                          <i class="fas fa-chart-line"></i> Statistiques
                      </a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link" routerLink="/messages" routerLinkActive="active">
                          <i class="fas fa-paper-plane"></i> Messages
                      </a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link" routerLink="/notifications" routerLinkActive="active">
                        <i class="fas fa-bell"></i>
                        <span class="badge bg-danger" *ngIf="notificationCount$ | async as count">
                          {{ count }}
                        </span>
                      </a>
                    </li>
                  <li class="nav-item dropdown">
                      <a class="nav-link dropdown-toggle" href="#" id="profilDropdown" role="button" data-bs-toggle="dropdown">
                          {{ nomUtilisateur }} <i class="fas fa-user"></i>
                      </a>
                      <ul class="dropdown-menu dropdown-menu-end">
                          <li><a class="dropdown-item" routerLink="/profil"><i class="fas fa-cog"></i> Gérer profil</a></li>
                          <li><a class="dropdown-item" href="#" (click)="logout()"><i class="fas fa-sign-out-alt"></i> Déconnexion</a></li>
                      </ul>
                  </li>
              </ul>
          </div>
      </div>
  </nav>


      <div class="container ">
        <div class="card shadow-lg">
          <div class="card-header bg-primary text-white">
            <h3 class="mb-0">
              <i class="fas fa-paper-plane me-2"></i>Envoyer des notifications
            </h3>
          </div>

          <div class="card-body">
            <form [formGroup]="notificationForm">
              <!-- Sélection d'événement -->
              <div class="mb-4 position-relative">
                <label class="form-label">Événement</label>
                <select class="form-select" formControlName="selectedEventId">
  <option value="" disabled selected>Sélectionnez un événement</option>
  <option *ngFor="let event of events$ | async" [value]="event.id_evenement">
    {{ event.nom }}
  </option>
</select>


                <div *ngIf="isLoading" class="loading-indicator">
                  <div class="spinner-border spinner-border-sm text-primary"></div>
                </div>
                <div *ngIf="showError('selectedEventId')" class="text-danger mt-1">
                  Veuillez sélectionner un événement
                </div>
              </div>

              <!-- Message -->
              <div class="mb-4">
                <label class="form-label">Message</label>
                <textarea
                  class="form-control"
                  formControlName="contenu"
                  rows="5"
                  placeholder="Rédigez votre message..."></textarea>
                <div *ngIf="showError('contenu')" class="text-danger mt-1">
                  Le message doit contenir entre 10 et 1000 caractères
                </div>
              </div>

              <!-- Boutons d'envoi -->
              <div class="d-grid gap-3">
              <button
                    class="btn btn-danger btn-lg"
                    (click)="sendNotification('email')"
                    [disabled]="isSending || notificationForm.invalid">
                  <i class="fas fa-envelope me-2"></i>
                    Envoyer par Email
              </button>

                <button
                  class="btn btn-info btn-lg text-white"
                  (click)="sendNotification('sms')"
                  [disabled]="isSending || notificationForm.invalid">
                  <i class="fas fa-comment-sms me-2"></i>
                  Envoyer par SMS
                </button>

                <button
                  class="btn btn-success btn-lg"
                  (click)="sendNotification('whatsapp')"
                  [disabled]="isSending || notificationForm.invalid">
                  <i class="fab fa-whatsapp me-2"></i>
                  Envoyer par WhatsApp
                </button>
              </div>
              <div *ngIf="errorMessage" class="alert alert-danger mt-3">
                {{ errorMessage }}
              </div>
            </form>
          </div>
        </div>
      </div>
    `,
    styles: [`
      .is-loading {
        opacity: 0.7;
        pointer-events: none;
      }
      .loading-indicator {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
      }
      .card {
        margin-top: 4rem;
      }
     body {
    background-color: #f8f9fa;
    font-family: 'Poppins', 'Roboto', sans-serif;
    padding-top: 60px;
  }
  
  
  /* Navbar Base Styling */
  .navbar {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    padding: 12px 0;
    margin-top: 75px; /* Ajout d'une marge supérieure */
    background: linear-gradient(to right, #212529, #343a40) !important;
  }
  
  .navbar-brand {
    font-weight: 600;
    font-size: 1.25rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 102, 0, 0.2);
    border-radius: 8px;
    margin-right: 20px;
    transition: all 0.3s ease;
  }
  
  .navbar-brand:hover {
    background: rgba(255, 102, 0, 0.3);
    transform: translateY(-2px);
  }
  
  .navbar-brand i {
    color: #ff6600;
    margin-right: 8px;
  }
  
  /* Nav Items Styling - Maintenir l'alignement horizontal */
  .navbar-nav {
    display: flex;
    align-items: center; /* Aligner verticalement */
  }
  
  .navbar-nav .nav-item {
    margin: 0 2px;
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .navbar-nav .nav-link {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    position: relative;
    transition: all 0.3s ease;
    white-space: nowrap; /* Empêcher le retour à la ligne */
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%; /* Hauteur uniforme */
  }
  
  .navbar-nav .nav-link i {
    margin-right: 8px;
    transition: transform 0.3s;
  }
  
  .navbar-nav .nav-link:hover i {
    transform: translateY(-2px);
  }
  
  .navbar-nav .nav-link.active, 
  .navbar-nav .nav-link:hover {
    color: #fff !important;
    background-color: rgba(255, 102, 0, 0.2);
    text-decoration: none;
  }
  
  .navbar-nav .nav-link.active::after, 
  .navbar-nav .nav-link:hover::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 16px;
    right: 16px;
    height: 2px;
    background-color: #ff6600;
    border-radius: 2px;
  }
  
  /* Dropdown Styling */
  .nav-item .dropdown-menu {
    min-width: 220px;
    padding: 8px;
    border: none;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    margin-top: 10px;
    animation: fadeIn 0.3s ease;
    border-top: 3px solid #ff6600;
  }
  
  .dropdown-item {
    padding: 10px 15px;
    border-radius: 5px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
  }
  
  .dropdown-item i {
    margin-right: 10px;
    color: #ff6600;
    width: 18px;
    text-align: center;
  }
  
  .dropdown-item:hover, 
  .dropdown-item:focus, 
  .dropdown-item.active {
    background-color: rgba(255, 102, 0, 0.1);
    color: #212529;
  }
  
  /* Notification Badge */
  .badge.bg-danger {
    position: absolute;
    top: 0px;
    right: 5px;
    font-size: 0.65rem;
    padding: 0.25rem 0.4rem;
    animation: pulse 1.5s infinite;
  }
  
  /* User Profile Dropdown */
  #profilDropdown {
    padding: 8px 16px;
    font-weight: 500;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    transition: all 0.3s;
    display: flex;
    align-items: center;
  }
  
  #profilDropdown:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  #profilDropdown i {
    margin-left: 8px;
    background: #ff6600;
    color: white;
    padding: 5px;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
  }
  
  /* Container pour maintenir l'alignement */
  .navbar-collapse {
    display: flex;
    justify-content: flex-end; /* Aligner à droite */
  }
  
  /* Animation Keyframes */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  /* Responsive Adjustments tout en préservant l'alignement */
  @media (max-width: 991.98px) {
    .navbar-collapse {
      background-color: #292d31;
      padding: 15px;
      border-radius: 8px;
      margin-top: 10px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      display: block; /* Revenir à un affichage en bloc pour mobile */
    }
    
    .navbar-nav {
      display: block; /* Affichage en bloc pour mobile */
    }
    
    .navbar-nav .nav-item {
      margin: 5px 0;
      display: block;
    }
    
    .navbar-nav .nav-link {
      justify-content: flex-start; /* Aligner le texte à gauche sur mobile */
    }
    
    .navbar-nav .nav-link.active::after, 
    .navbar-nav .nav-link:hover::after {
      left: 0;
      right: 0;
    }
    
    .dropdown-menu {
      border: none;
      box-shadow: none;
      padding: 0 0 0 20px;
      margin-top: 5px;
      background-color: transparent;
    }
    
    .dropdown-item {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .dropdown-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
  }

  .type-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-width: 2px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(255, 102, 0, 0.2);
  }

  &.selected {
    border-width: 3px;
    border-color: #ff6600;
    background-color: rgba(255, 102, 0, 0.05);
  }

  .card-title {
    font-size: 0.9rem;
    margin-bottom: 0;
  }
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  color: #ff6600;
}

.container {
  max-width: 800px;
  padding: 2rem;
}

.card {
  border-radius: 1rem;
  overflow: hidden;
  border-color: #e0e0e0;
}

.card-header {
  padding: 1.5rem;
  font-size: 1.25rem;
  background-color: #ff6600 !important;
}

.form-select, .form-control {
  border-radius: 0.5rem;
  padding: 1rem;
  border: 2px solid #dee2e6;
  transition: all 0.3s ease;

  &:focus {
    border-color: #ff6600;
    box-shadow: 0 0 0 0.25rem rgba(255, 102, 0, 0.25);
  }
}

.btn {
  border-radius: 0.5rem;
  padding: 1rem 2rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.7;
  }

  i {
    font-size: 1.25rem;
  }
}

/* Boutons personnalisés */
.btn-danger {
  background-color: #ff6600;
  border-color: #ff6600;
  
  &:hover:not(:disabled) {
    background-color: #e55a00;
    border-color: #e55a00;
  }
}

.btn-info {
  background-color: #0099cc;
  border-color: #0099cc;
  
  &:hover:not(:disabled) {
    background-color: #0088b3;
    border-color: #0088b3;
  }
}

.btn-success {
  background-color: #33cc66;
  border-color: #33cc66;
  
  &:hover:not(:disabled) {
    background-color: #2db659;
    border-color: #2db659;
  }
}

.text-danger {
  color: #ff6600 !important;
}

.alert-danger {
  background-color: rgba(255, 102, 0, 0.1);
  border-color: rgba(255, 102, 0, 0.3);
  color: #cc5200;
}

.loading-indicator {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

    `]
  })
  export class EnvoyermessageComponent implements OnInit, OnDestroy {
    notificationForm: FormGroup;
    isSending = false;
    isLoading = false;
    events$: Observable<any[]>;
    private destroy$ = new Subject<void>();
    nomUtilisateur: string;
    notificationCount$: Observable<number>;
    errorMessage: string | null = null;
    

    constructor(
      private notificationService: NotificationService,
      private router: Router,
      private fb: FormBuilder
    ) {
      this.notificationForm = this.fb.group({
        selectedEventId: [null, Validators.required], // Valeur par défaut : null
        contenu: ['', [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1000)
        ]],
        typeNotification: ['INFO']
      });
      this.events$ = this.notificationService.events$;
      this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
      this.notificationCount$ = this.notificationService.notificationsCount$;
    }

    ngOnInit(): void {
      this.events$.subscribe(events => {
        console.log('Événements chargés:', events);
        events.forEach(event => {
          console.log('ID Événement:', event.id, 'Type:', typeof event.id);
        });
      });
    }
    

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }

    showError(fieldName: string): boolean {
      const field = this.notificationForm.get(fieldName);
      return field ? field.invalid && field.touched : false;
    }

    sendNotification(channel: 'email' | 'sms' | 'whatsapp'): void {
      const formValue = this.notificationForm.value;
      
      console.log('Valeur brute du formulaire:', formValue);
      console.log('Type de selectedEventId:', typeof formValue.selectedEventId);
    
      const evenementId = Number(formValue.selectedEventId);
      
      if (isNaN(evenementId)) {
        console.error('ID Événement invalide - Valeur brute:', formValue.selectedEventId);
        this.showError('Veuillez sélectionner un événement valide');
        return;
      }
      
      const organisateurId = Number(localStorage.getItem('idUtilisateur'));
      console.log("Événement sélectionné :", this.notificationForm.value.selectedEventId)
     
      console.log('Valeur de selectedEventId:', formValue.selectedEventId);
      console.log('ID Événement converti:', evenementId);
    
      if (isNaN(evenementId)) {
        console.error('ID événement invalide:', evenementId);
        this.notificationService.showError('ID événement invalide.');
        return;
      }
    
      const notification: NotificationDTO = {
        contenu: formValue.contenu,
        typeNotification: formValue.typeNotification,
        date: new Date()
      };
    
      this.isSending = true;
      const request$ = channel === 'email' 
        ? this.notificationService.sendEmail(organisateurId, evenementId, notification)
        : channel === 'sms'
        ? this.notificationService.sendSMS(organisateurId, evenementId, formValue.contenu)
        : this.notificationService.sendWhatsApp(organisateurId, evenementId, notification);
    
      request$.pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Notification envoyée par ${channel}`);
          this.notificationForm.patchValue({ contenu: '' });
          this.notificationForm.markAsPristine();
        },
        error: (error) => {
          console.error('Erreur technique:', error);
          this.notificationService.showError(
            error.error?.message || `Erreur lors de l'envoi par ${channel}`
          );
        },
        complete: () => {
          this.isSending = false;
        }
      });
    }
    logout(): void {
      localStorage.clear();
      this.router.navigate(['/connexion']);
    }
  }
