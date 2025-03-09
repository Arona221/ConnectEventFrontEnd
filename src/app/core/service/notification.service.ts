import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, Subject, timer, throwError, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationDTO } from '../model/notification.model';
import { delay, map, switchMap, retryWhen, takeUntil, shareReplay } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';


interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}


export interface Notification {
  id: number;
  message: string;
  dateEnvoi: string;
  deleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private apiUrl1 = `${environment.apiUrl}/notification`;
  private apiUrl2 = `${environment.apiUrl}/evenements/organisateur`;
  
  
  private notificationCount = new BehaviorSubject<number>(0);
  private eventsSubject = new BehaviorSubject<any[]>([]);
  events$: Observable<any[]> = this.eventsSubject.asObservable();

  private destroy$ = new Subject<void>();
  private refreshInterval = 30000; // 30 secondes
  
  constructor(private http: HttpClient, private snackBar: MatSnackBar) {
    this.loadInitialCount();
    this.initializeAutoRefresh();
  }

  get notificationsCount$() {
    return this.notificationCount.asObservable();
  }

  private loadInitialCount() {
    const userId = localStorage.getItem('idUtilisateur');
    if (userId) {
      this.getUserNotifications(+userId).subscribe(notifications => {
        this.notificationCount.next(notifications.length);
      });
    }

  }

  getUserNotifications(userId: number): Observable<Notification[]> {
    if (!userId) {
      return throwError(() => new Error('User ID is required'));
    }
    
    return this.http.get<Notification[]>(`${this.apiUrl}/utilisateur/${userId}`).pipe(
      tap(notifications => this.notificationCount.next(notifications.length)),
      catchError(this.handleError('getUserNotifications'))
    ) as Observable<Notification[]>;
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.notificationCount.next(Math.max(0, this.notificationCount.value - 1)))
    );
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/marquer-lues/${userId}`, {}).pipe(
      tap(() => this.notificationCount.next(0))
    );
  }
   // Récupérer tous les événements de l'organisateur
   getOrganisateurEvents(organisateurId: number): Observable<any[]> {
    return this.http.get<Page<any>>(`${this.apiUrl2}/${organisateurId}`)
      .pipe(
        tap(response => console.log('Réponse complète du backend:', response)),
        map(response => response.content)
      );
  }
  


  // Afficher un message de succès
  showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', { duration: 3000 });
  }

  // Afficher un message d'erreur
  showError(error: string): void {
    this.snackBar.open(error, 'Fermer', { duration: 5000 });
  }

  // Gestion de la destruction du service
  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private initializeAutoRefresh(): void {
    const organisateurId = Number(localStorage.getItem('idUtilisateur'));
    if (organisateurId) {
      timer(0, this.refreshInterval).pipe(
        switchMap(() => this.fetchOrganisateurEvents(organisateurId)),
        retryWhen(errors => errors.pipe(delay(5000))),
        takeUntil(this.destroy$),
        shareReplay(1)
      ).subscribe({
        next: events => this.eventsSubject.next(events),
        error: error => console.error('Erreur de rafraîchissement:', error)
      });
    }
  }
  // notification.service.ts

private fetchOrganisateurEvents(organisateurId: number): Observable<any[]> {
  return this.http.get<any>(`${this.apiUrl2}/${organisateurId}`).pipe(
    map(response => {
      if (!response?.content) {
        throw new Error('Format de réponse inattendu');
      }
      return response.content.map((event: any) => ({
        ...event,
        id: event.id_evenement // Correction ici
      }));
    }),
    catchError(error => {
      console.error('Erreur de récupération des événements:', error);
      return of([]);
    })
  );
}
  // Méthodes d'envoi de notifications
  sendEmail(organisateurId: number, evenementId: number, notification: NotificationDTO): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.apiUrl1}/email?organisateurId=${organisateurId}&evenementId=${evenementId}`,
      notification,
      { headers }
    );
  }

  sendSMS(organisateurId: number, evenementId: number, message: string): Observable<any> {
    // Ensure IDs are valid numbers
    if (!organisateurId || !evenementId) {
      return new Observable(observer => {
        observer.error({ error: { message: 'ID organisateur ou événement invalide' } });
      });
    }
    
    return this.http.post(
      `${this.apiUrl1}/sms?organisateurId=${organisateurId}&evenementId=${evenementId}&message=${encodeURIComponent(message)}`,
      {}
    );
  }

  sendWhatsApp(organisateurId: number, evenementId: number, notification: NotificationDTO): Observable<any> {
    // Ensure IDs are valid numbers
    if (!organisateurId || !evenementId) {
      return new Observable(observer => {
        observer.error({ error: { message: 'ID organisateur ou événement invalide' } });
      });
    }
    
    return this.http.post(
      `${this.apiUrl1}/whatsApp?organisateurId=${organisateurId}&evenementId=${evenementId}`,
      notification
    );
  }

  // Centralized error handler
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      let errorMessage = 'Une erreur est survenue';
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Erreur: ${error.error.message}`;
      } else if (error.status) {
        // Server-side error
        switch (error.status) {
          case 404:
            errorMessage = 'Ressource non trouvée';
            break;
          case 401:
            errorMessage = 'Non autorisé';
            break;
          case 403:
            errorMessage = 'Accès refusé';
            break;
          case 500:
            errorMessage = 'Erreur serveur';
            break;
          default:
            errorMessage = `Erreur ${error.status}: ${error.statusText}`;
        }
        
        if (error.error && error.error.message) {
          errorMessage += ` - ${error.error.message}`;
        }
      }
      
      // Optional: show error in UI
      this.showError(errorMessage);
      
      // Return an observable with a user-facing error message
      return throwError(() => new Error(errorMessage));
    };
  }
}