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


      <div class="container mt-5">
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
      font-family: 'Roboto', sans-serif;
      
  }
  .navbar {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-top: 5%;
  }
  .navbar-nav .nav-link {
      padding: 10px 15px;
      transition: 0.3s;
  }
  .navbar-nav .nav-link.active, .navbar-nav .nav-link:hover {
      color: #ff6600 !important;
      text-decoration: underline;
  }
  .nav-item .dropdown-menu {
      min-width: 180px;
  }

  .type-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border-width: 2px;
    
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
    
      &.selected {
        border-width: 3px;
        background-color: rgba(0, 0, 0, 0.03);
      }
    
      .card-title {
        font-size: 0.9rem;
        margin-bottom: 0;
      }
    }
    
    .spinner-border {
      width: 3rem;
      height: 3rem;
    }

    .container {
      max-width: 800px;
      padding: 2rem;
    }
    
    .card {
      border-radius: 1rem;
      overflow: hidden;
    }
    
    .card-header {
      padding: 1.5rem;
      font-size: 1.25rem;
    }
    
    .form-select, .form-control {
      border-radius: 0.5rem;
      padding: 1rem;
      border: 2px solid #dee2e6;
      transition: all 0.3s ease;
    
      &:focus {
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
      }
    }
    
    .btn {
      border-radius: 0.5rem;
      padding: 1rem 2rem;
      font-weight: 500;
      transition: all 0.3s ease;
    
      &:disabled {
        opacity: 0.7;
      }
    
      i {
        font-size: 1.25rem;
      }
    }
    
    .spinner-border {
      width: 3rem;
      height: 3rem;
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
