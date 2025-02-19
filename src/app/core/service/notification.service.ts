import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  private notificationCount = new BehaviorSubject<number>(0);
  
  constructor(private http: HttpClient) {
    this.loadInitialCount();
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
    return this.http.get<Notification[]>(`${this.apiUrl}/utilisateur/${userId}`).pipe(
      tap(notifications => this.notificationCount.next(notifications.length))
    );
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
}